import os
import pytest
from app.db.session import SessionLocal, Base, engine
from app.db.models import User, PredictionHistory
from app.schemas.auth import UserRegisterRequest, UserLoginRequest
from app.schemas.predict import CropPredictionRequest, YieldPredictionRequest, FertilizerPredictionRequest
from app.api.auth import register, login, get_current_user_profile, update_profile
from app.api.predict import predict_crop, predict_yield, predict_fertilizer
from app.api.history import get_user_history, get_prediction_detail, delete_prediction_record
from app.api.dashboard import get_dashboard_stats
from app.api.health import health_check
from app.core.security import decode_access_token
from fastapi import HTTPException

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_health_check(db):
    res = health_check(db=db)
    assert res["status"] == "healthy"
    assert res["database"] == "connected"
    assert res["models"]["crop_recommendation"]["available"] is True
    assert res["models"]["yield_prediction"]["available"] is True
    assert res["models"]["fertilizer_recommendation"]["available"] is True

def test_user_registration_and_login(db):
    # 1. Register User A
    req = UserRegisterRequest(
        full_name="Rajesh Patel",
        email="rajesh.patel@example.com",
        password="ValidPassword123",
        confirm_password="ValidPassword123"
    )
    token_resp = register(request=req, db=db)
    assert token_resp.access_token is not None
    assert token_resp.user.email == "rajesh.patel@example.com"
    assert token_resp.user.full_name == "Rajesh Patel"

    # Verify token payload
    user_id = decode_access_token(token_resp.access_token)
    assert int(user_id) == token_resp.user.id

    # 2. Duplicate registration throws 409
    with pytest.raises(HTTPException) as exc:
        register(request=req, db=db)
    assert exc.value.status_code == 409

    # 3. Login with correct password
    login_req = UserLoginRequest(
        email="rajesh.patel@example.com",
        password="ValidPassword123"
    )
    logged_in = login(request=login_req, db=db)
    assert logged_in.access_token is not None

    # 4. Login with invalid password throws 401
    bad_login = UserLoginRequest(
        email="rajesh.patel@example.com",
        password="WrongPassword"
    )
    with pytest.raises(HTTPException) as exc:
        login(request=bad_login, db=db)
    assert exc.value.status_code == 401

def test_predictions_and_user_isolation(db):
    # Fetch User A
    user_a = db.query(User).filter(User.email == "rajesh.patel@example.com").first()
    assert user_a is not None

    # 1. Crop prediction
    crop_req = CropPredictionRequest(
        nitrogen=90.0,
        phosphorus=42.0,
        potassium=43.0,
        temperature=25.0,
        humidity=80.0,
        ph=6.5,
        rainfall=200.0
    )
    crop_res = predict_crop(req=crop_req, current_user=user_a, db=db)
    assert crop_res.recommended_crop in ["Rice", "Jute"]
    assert crop_res.prediction_id is not None
    assert len(crop_res.agronomic_tips) > 0

    # 2. Yield prediction
    yield_req = YieldPredictionRequest(
        state="Punjab",
        crop="Wheat",
        season="Rabi",
        area=15.0,
        annual_rainfall=700.0,
        fertilizer_used=160.0,
        pesticide_used=1.4
    )
    yield_res = predict_yield(req=yield_req, current_user=user_a, db=db)
    assert yield_res.predicted_yield > 0
    assert yield_res.total_production == round(yield_res.predicted_yield * 15.0, 2)
    assert yield_res.prediction_id is not None

    # 3. Fertilizer prediction
    fert_req = FertilizerPredictionRequest(
        temperature=27.0,
        humidity=65.0,
        moisture=40.0,
        soil_type="Clayey",
        crop_type="Paddy",
        nitrogen=10.0,
        potassium=22.0,
        phosphorous=25.0
    )
    fert_res = predict_fertilizer(req=fert_req, current_user=user_a, db=db)
    assert fert_res.recommended_fertilizer is not None
    assert fert_res.prediction_id is not None

    # Verify User A dashboard stats
    stats_a = get_dashboard_stats(current_user=user_a, db=db)
    assert stats_a.total_predictions == 3
    assert stats_a.crop_recommendations == 1
    assert stats_a.yield_predictions == 1
    assert stats_a.fertilizer_recommendations == 1
    assert len(stats_a.recent_activity) == 3

    # Create User B
    req_b = UserRegisterRequest(
        full_name="Anita Sharma",
        email="anita.sharma@example.com",
        password="Password123",
        confirm_password="Password123"
    )
    user_b_token = register(request=req_b, db=db)
    user_b = db.query(User).filter(User.email == "anita.sharma@example.com").first()

    # User B history must be isolated (0 items)
    history_b = get_user_history(current_user=user_b, db=db)
    assert history_b.total == 0
    assert len(history_b.items) == 0

    # User B cannot access User A's prediction record
    with pytest.raises(HTTPException) as exc:
        get_prediction_detail(prediction_id=crop_res.prediction_id, current_user=user_b, db=db)
    assert exc.value.status_code == 404

    # User A CAN access their prediction record
    rec_a = get_prediction_detail(prediction_id=crop_res.prediction_id, current_user=user_a, db=db)
    assert rec_a.id == crop_res.prediction_id
    assert rec_a.user_id == user_a.id

    # User A deletes their fertilizer prediction
    del_res = delete_prediction_record(prediction_id=fert_res.prediction_id, current_user=user_a, db=db)
    assert del_res["status"] == "success"

    # Total predictions now 2
    stats_after_del = get_dashboard_stats(current_user=user_a, db=db)
    assert stats_after_del.total_predictions == 2

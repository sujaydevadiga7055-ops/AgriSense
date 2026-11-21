import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, PredictionHistory
from app.core.deps import get_current_user
from app.schemas.predict import (
    CropPredictionRequest, CropPredictionResponse,
    YieldPredictionRequest, YieldPredictionResponse,
    FertilizerPredictionRequest, FertilizerPredictionResponse
)
from ml.inference.crop_service import crop_service
from ml.inference.yield_service import yield_service
from ml.inference.fertilizer_service import fertilizer_service

router = APIRouter(prefix="/predict", tags=["Predictions"])

@router.post("/crop", response_model=CropPredictionResponse)
def predict_crop(
    req: CropPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not crop_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Crop Recommendation ML model is currently offline or not loaded on the server."
        )

    try:
        result = crop_service.predict(
            n=req.nitrogen,
            p=req.phosphorus,
            k=req.potassium,
            temp=req.temperature,
            hum=req.humidity,
            ph=req.ph,
            rain=req.rainfall
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference computation error: {str(e)}"
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    input_dict = req.model_dump()
    output_dict = {
        "recommended_crop": result["recommended_crop"],
        "confidence": result.get("confidence"),
        "explanation": result["explanation"],
        "agronomic_tips": result["agronomic_tips"],
        "disclaimer": result["disclaimer"]
    }

    # Store prediction in user history
    history_entry = PredictionHistory(
        user_id=current_user.id,
        prediction_type="crop",
        input_data=input_dict,
        output_data=output_dict,
        model_version="1.0.0"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)

    return CropPredictionResponse(
        recommended_crop=result["recommended_crop"],
        confidence=result.get("confidence"),
        input_summary=input_dict,
        explanation=result["explanation"],
        agronomic_tips=result["agronomic_tips"],
        disclaimer=result["disclaimer"],
        prediction_id=history_entry.id,
        created_at=now_iso
    )

@router.post("/yield", response_model=YieldPredictionResponse)
def predict_yield(
    req: YieldPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not yield_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Crop Yield Prediction ML model is currently offline or not loaded on the server."
        )

    try:
        result = yield_service.predict(
            state=req.state,
            crop=req.crop,
            season=req.season,
            area=req.area,
            annual_rainfall=req.annual_rainfall or 1100.0,
            fertilizer_used=req.fertilizer_used or 150.0,
            pesticide_used=req.pesticide_used or 1.5
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Yield inference computation error: {str(e)}"
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    input_dict = req.model_dump()
    output_dict = {
        "predicted_yield": result["predicted_yield"],
        "total_production": result["total_production"],
        "unit": result["unit"],
        "production_unit": result["production_unit"],
        "explanation": result["explanation"],
        "disclaimer": result["disclaimer"]
    }

    # Store prediction in user history
    history_entry = PredictionHistory(
        user_id=current_user.id,
        prediction_type="yield",
        input_data=input_dict,
        output_data=output_dict,
        model_version="1.0.0"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)

    return YieldPredictionResponse(
        predicted_yield=result["predicted_yield"],
        total_production=result["total_production"],
        unit=result["unit"],
        production_unit=result["production_unit"],
        crop=req.crop,
        state=req.state,
        season=req.season,
        area=req.area,
        input_summary=input_dict,
        explanation=result["explanation"],
        disclaimer=result["disclaimer"],
        prediction_id=history_entry.id,
        created_at=now_iso
    )

@router.post("/fertilizer", response_model=FertilizerPredictionResponse)
def predict_fertilizer(
    req: FertilizerPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not fertilizer_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Fertilizer Recommendation ML model is currently offline or not loaded on the server."
        )

    try:
        result = fertilizer_service.predict(
            temp=req.temperature,
            hum=req.humidity,
            moist=req.moisture,
            soil_type=req.soil_type,
            crop_type=req.crop_type,
            n=req.nitrogen,
            k=req.potassium,
            p=req.phosphorous
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fertilizer inference computation error: {str(e)}"
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    input_dict = req.model_dump()
    output_dict = {
        "recommended_fertilizer": result["recommended_fertilizer"],
        "nutrient_analysis": result["nutrient_analysis"],
        "guidance": result["guidance"],
        "precautions": result["precautions"],
        "disclaimer": result["disclaimer"]
    }

    # Store prediction in user history
    history_entry = PredictionHistory(
        user_id=current_user.id,
        prediction_type="fertilizer",
        input_data=input_dict,
        output_data=output_dict,
        model_version="1.0.0"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)

    return FertilizerPredictionResponse(
        recommended_fertilizer=result["recommended_fertilizer"],
        soil_type=req.soil_type,
        crop_type=req.crop_type,
        input_summary=input_dict,
        nutrient_analysis=result["nutrient_analysis"],
        guidance=result["guidance"],
        precautions=result["precautions"],
        disclaimer=result["disclaimer"],
        prediction_id=history_entry.id,
        created_at=now_iso
    )

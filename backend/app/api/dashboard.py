from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, PredictionHistory
from app.core.deps import get_current_user
from app.schemas.dashboard import DashboardStatsResponse
from app.schemas.history import HistoryItemResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total count
    total = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id).count()
    
    # Crop predictions count
    crops = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id,
        PredictionHistory.prediction_type == "crop"
    ).count()

    # Yield predictions count
    yields = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id,
        PredictionHistory.prediction_type == "yield"
    ).count()

    # Fertilizer predictions count
    fertilizers = db.query(PredictionHistory).filter(
        PredictionHistory.user_id == current_user.id,
        PredictionHistory.prediction_type == "fertilizer"
    ).count()

    # Recent 5 activity records
    recent = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardStatsResponse(
        total_predictions=total,
        crop_recommendations=crops,
        yield_predictions=yields,
        fertilizer_recommendations=fertilizers,
        recent_activity=[HistoryItemResponse.model_validate(item) for item in recent]
    )

from pydantic import BaseModel
from typing import List
from app.schemas.history import HistoryItemResponse

class DashboardStatsResponse(BaseModel):
    total_predictions: int
    crop_recommendations: int
    yield_predictions: int
    fertilizer_recommendations: int
    recent_activity: List[HistoryItemResponse]

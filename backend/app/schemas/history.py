from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Dict, Any, List, Optional

class HistoryItemResponse(BaseModel):
    id: int
    user_id: int
    prediction_type: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HistoryListResponse(BaseModel):
    total: int
    items: List[HistoryItemResponse]

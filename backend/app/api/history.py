from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.db.models import User, PredictionHistory
from app.core.deps import get_current_user
from app.schemas.history import HistoryItemResponse, HistoryListResponse

router = APIRouter(prefix="/history", tags=["Prediction History"])

@router.get("", response_model=HistoryListResponse)
def get_user_history(
    prediction_type: Optional[str] = Query(None, description="Filter by 'crop', 'yield', or 'fertilizer'"),
    q: Optional[str] = Query(None, description="Search term in results or inputs"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id)

    if isinstance(prediction_type, str) and prediction_type.strip() and prediction_type.lower() != "all":
        query = query.filter(PredictionHistory.prediction_type == prediction_type.lower().strip())

    records = query.order_by(PredictionHistory.created_at.desc()).all()

    # Search filter in python/memory or DB if search query provided
    if isinstance(q, str) and q.strip():
        search_term = q.strip().lower()
        filtered = []
        for r in records:
            out_str = str(r.output_data).lower()
            in_str = str(r.input_data).lower()
            if search_term in out_str or search_term in in_str or search_term in r.prediction_type.lower():
                filtered.append(r)
        records = filtered

    total = len(records)
    actual_limit = limit if isinstance(limit, int) else 50
    actual_offset = offset if isinstance(offset, int) else 0
    paginated = records[actual_offset : actual_offset + actual_limit]

    return HistoryListResponse(
        total=total,
        items=[HistoryItemResponse.model_validate(item) for item in paginated]
    )

@router.get("/{prediction_id}", response_model=HistoryItemResponse)
def get_prediction_detail(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(PredictionHistory).filter(
        PredictionHistory.id == prediction_id,
        PredictionHistory.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record #{prediction_id} not found or you do not have permission to view it."
        )

    return HistoryItemResponse.model_validate(record)

@router.delete("/{prediction_id}", status_code=status.HTTP_200_OK)
def delete_prediction_record(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(PredictionHistory).filter(
        PredictionHistory.id == prediction_id,
        PredictionHistory.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record #{prediction_id} not found or unauthorized."
        )

    db.delete(record)
    db.commit()

    return {"status": "success", "message": f"Prediction record #{prediction_id} deleted successfully."}

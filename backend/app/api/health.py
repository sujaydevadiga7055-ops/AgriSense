import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings
from ml.inference.crop_service import crop_service
from ml.inference.yield_service import yield_service
from ml.inference.fertilizer_service import fertilizer_service

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    metadata = {}
    metadata_path = os.path.join(settings.ARTIFACTS_DIR, "model_metadata.json")
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        except Exception:
            pass

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "models": {
            "crop_recommendation": {
                "available": crop_service.is_available(),
                "file": "crop_model.joblib"
            },
            "yield_prediction": {
                "available": yield_service.is_available(),
                "file": "yield_model.joblib"
            },
            "fertilizer_recommendation": {
                "available": fertilizer_service.is_available(),
                "file": "fertilizer_model.joblib"
            }
        },
        "metadata": metadata
    }

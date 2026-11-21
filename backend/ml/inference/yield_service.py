import os
import joblib
import pandas as pd
from typing import Dict, Any
from app.core.config import settings

class YieldInferenceService:
    def __init__(self):
        self.model_path = os.path.join(settings.ARTIFACTS_DIR, "yield_model.joblib")
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"[YieldInferenceService] Error loading model: {e}")
                self.model = None
        else:
            self.model = None

    def is_available(self) -> bool:
        if self.model is None:
            self._load_model()
        return self.model is not None

    def predict(self, state: str, crop: str, season: str, area: float,
                annual_rainfall: float, fertilizer_used: float, pesticide_used: float) -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("Yield Prediction model artifact is unavailable. Please verify backend/ml/artifacts/yield_model.joblib exists.")

        df = pd.DataFrame([{
            'state': state,
            'crop': crop,
            'season': season,
            'area': area,
            'annual_rainfall': annual_rainfall,
            'fertilizer_used': fertilizer_used,
            'pesticide_used': pesticide_used
        }])

        pred_rate = float(self.model.predict(df)[0])
        pred_rate = max(0.1, round(pred_rate, 2))
        total_prod = round(pred_rate * area, 2)

        explanation = (
            f"Based on historical agro-climatic patterns in {state} during the {season} season, "
            f"cultivating {crop} across {area} hectares with {annual_rainfall:.0f} mm annual rainfall "
            f"and {fertilizer_used:.1f} kg/ha nutrient management is estimated to yield {pred_rate} metric tons per hectare."
        )

        return {
            "predicted_yield": pred_rate,
            "total_production": total_prod,
            "unit": "Metric Tons / Hectare (t/ha)",
            "production_unit": "Metric Tons (t)",
            "explanation": explanation,
            "disclaimer": "Crop yield prediction is a statistical estimate based on input variables and historical climatic averages. Severe weather events or pests may alter real yields."
        }

yield_service = YieldInferenceService()

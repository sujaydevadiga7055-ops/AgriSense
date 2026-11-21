import os
import joblib
import pandas as pd
from typing import Dict, Any, Tuple
from app.core.config import settings

class CropInferenceService:
    def __init__(self):
        self.model_path = os.path.join(settings.ARTIFACTS_DIR, "crop_model.joblib")
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"[CropInferenceService] Error loading model: {e}")
                self.model = None
        else:
            self.model = None

    def is_available(self) -> bool:
        if self.model is None:
            self._load_model()
        return self.model is not None

    def predict(self, n: float, p: float, k: float, temp: float, hum: float, ph: float, rain: float) -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("Crop Recommendation model artifact is unavailable. Please verify backend/ml/artifacts/crop_model.joblib exists.")

        df = pd.DataFrame([{
            'N': n,
            'P': p,
            'K': k,
            'temperature': temp,
            'humidity': hum,
            'ph': ph,
            'rainfall': rain
        }])

        pred_crop = self.model.predict(df)[0]
        
        # Calculate confidence if predict_proba is supported
        confidence = None
        try:
            proba = self.model.predict_proba(df)[0]
            confidence = round(float(max(proba)) * 100, 1)
        except Exception:
            confidence = None

        crop_info = self._get_crop_guidance(pred_crop, temp, rain, ph)

        return {
            "recommended_crop": pred_crop.capitalize(),
            "confidence": confidence,
            "explanation": crop_info["explanation"],
            "agronomic_tips": crop_info["tips"],
            "disclaimer": "Agricultural recommendation based on machine learning inference. Soil conditions vary locally; consider local agricultural extension advice."
        }

    def _get_crop_guidance(self, crop: str, temp: float, rain: float, ph: float) -> Dict[str, Any]:
        crop_lower = crop.lower()
        guidance = {
            "rice": {
                "explanation": f"Rice thrives in wet conditions with high rainfall ({rain:.0f} mm observed) and warm temperatures ({temp:.1f}°C). The current soil pH of {ph:.1f} is well-suited for paddy water retention.",
                "tips": [
                    "Maintain 3-5 cm standing water during vegetative growth.",
                    "Apply nitrogen in split doses: basal, active tillering, and panicle initiation.",
                    "Ensure adequate weed control in early vegetative stages."
                ]
            },
            "wheat": {
                "explanation": f"Wheat requires moderate temperatures and cool nights, matching your environmental readings.",
                "tips": [
                    "Sow seeds in well-pulverized loam soil.",
                    "Provide crown root initiation (CRI) irrigation 20-25 days after sowing.",
                    "Ensure balanced N-P-K fertilizer application before tillering."
                ]
            },
            "maize": {
                "explanation": f"Maize requires warm weather ({temp:.1f}°C) and well-drained fertile soil with pH {ph:.1f}.",
                "tips": [
                    "Ensure good field drainage as maize is sensitive to waterlogging.",
                    "Apply zinc sulphate if soil shows micronutrient deficiency.",
                    "Side-dress nitrogen when plants reach knee-high stage."
                ]
            },
            "cotton": {
                "explanation": f"Cotton performs best with warm climate ({temp:.1f}°C) and adequate sunshine during boll formation.",
                "tips": [
                    "Sow in deep black or alluvial soil with good aeration.",
                    "Avoid excessive moisture during harvesting to preserve fiber quality.",
                    "Monitor regularly for bollworm and sucking pests."
                ]
            },
            "chickpea": {
                "explanation": f"Chickpea (Gram) requires cool climate, low humidity, and moderate rainfall.",
                "tips": [
                    "Requires minimal nitrogen fertilizer due to natural nitrogen-fixing nodules.",
                    "Ensure soil is free from water stagnation to prevent wilt diseases.",
                    "Harvest when leaves turn yellow and pods turn brown."
                ]
            }
        }
        
        default_info = {
            "explanation": f"Your environmental parameters (temp: {temp:.1f}°C, rainfall: {rain:.0f} mm, pH: {ph:.1f}) show high suitability for {crop.capitalize()}.",
            "tips": [
                f"Prepare soil thoroughly with proper tilling and organic compost before planting {crop}.",
                "Monitor soil moisture levels closely during germination and flowering stages.",
                "Follow regional agricultural university package of practices for optimal sowing dates."
            ]
        }
        return guidance.get(crop_lower, default_info)

crop_service = CropInferenceService()

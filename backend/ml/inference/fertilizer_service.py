import os
import joblib
import pandas as pd
from typing import Dict, Any, List
from app.core.config import settings

class FertilizerInferenceService:
    def __init__(self):
        self.model_path = os.path.join(settings.ARTIFACTS_DIR, "fertilizer_model.joblib")
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"[FertilizerInferenceService] Error loading model: {e}")
                self.model = None
        else:
            self.model = None

    def is_available(self) -> bool:
        if self.model is None:
            self._load_model()
        return self.model is not None

    def predict(self, temp: float, hum: float, moist: float, soil_type: str,
                crop_type: str, n: float, k: float, p: float) -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("Fertilizer Recommendation model artifact is unavailable. Please verify backend/ml/artifacts/fertilizer_model.joblib exists.")

        df = pd.DataFrame([{
            'Temperature': temp,
            'Humidity': hum,
            'Moisture': moist,
            'Soil_Type': soil_type,
            'Crop_Type': crop_type,
            'Nitrogen': n,
            'Potassium': k,
            'Phosphorous': p
        }])

        rec_fert = str(self.model.predict(df)[0])

        # Nutrient balance analysis
        nutrient_analysis = {
            "Nitrogen (N)": f"{n:.1f} - " + ("Deficient" if n < 15 else "Adequate" if n <= 35 else "High"),
            "Phosphorus (P)": f"{p:.1f} - " + ("Deficient" if p < 15 else "Adequate" if p <= 35 else "High"),
            "Potassium (K)": f"{k:.1f} - " + ("Deficient" if k < 12 else "Adequate" if k <= 30 else "High")
        }

        guidance_map = {
            "Urea": "Urea provides a concentrated nitrogen source (46% N). Apply in split applications to minimize volatilization and leaching losses.",
            "DAP": "Diammonium Phosphate (DAP) provides 18% Nitrogen and 46% Phosphorus. Apply primarily as a basal dose at seed sowing or transplanting.",
            "10-26-26": "NPK 10-26-26 is rich in Potassium and Phosphorus, ideal for root development and disease resistance in fruit, tuber, and cereal crops.",
            "14-35-14": "NPK 14-35-14 is well-suited for basal application where phosphorus is urgently required for root establishment.",
            "28-28": "Provides an equal high ratio of Nitrogen and Phosphorus (28-28-0), ideal for vegetative and early flowering growth.",
            "17-17-17": "Balanced complete complex fertilizer suitable for soils with general mild macronutrient depletion.",
            "20-20": "NP 20-20 complex fertilizer is suited for top-dressing and basal application across various field crops."
        }

        guidance = guidance_map.get(
            rec_fert,
            f"Apply {rec_fert} in accordance with standard agricultural dosage recommendations for {crop_type} on {soil_type} soil."
        )

        precautions = [
            "Do not apply granular chemical fertilizers on wet foliage to avoid leaf scorching.",
            "Ensure adequate soil moisture before top-dressing with nitrogen fertilizers.",
            "Store fertilizers in a cool, dry, ventilated location away from direct sunlight.",
            "Always follow recommended personal protective equipment (PPE) during fertilizer spreading."
        ]

        disclaimer = (
            "NOTICE: The fertilizer recommendation dataset is based on controlled agronomic samples. "
            "This output is an ML-assisted decision support estimate and should always be validated "
            "with a laboratory soil test (Soil Health Card) or a local agricultural extension officer."
        )

        return {
            "recommended_fertilizer": rec_fert,
            "soil_type": soil_type,
            "crop_type": crop_type,
            "nutrient_analysis": nutrient_analysis,
            "guidance": guidance,
            "precautions": precautions,
            "disclaimer": disclaimer
        }

fertilizer_service = FertilizerInferenceService()

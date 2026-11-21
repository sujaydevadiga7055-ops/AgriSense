from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

# --- Crop Recommendation ---
class CropPredictionRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=140, description="Nitrogen content ratio in soil (N)")
    phosphorus: float = Field(..., ge=5, le=145, description="Phosphorus content ratio in soil (P)")
    potassium: float = Field(..., ge=5, le=205, description="Potassium content ratio in soil (K)")
    temperature: float = Field(..., ge=5.0, le=55.0, description="Temperature in degree Celsius")
    humidity: float = Field(..., ge=10.0, le=100.0, description="Relative humidity in %")
    ph: float = Field(..., ge=3.5, le=10.0, description="pH value of the soil (0-14 scale)")
    rainfall: float = Field(..., ge=10.0, le=400.0, description="Rainfall in mm")

class CropPredictionResponse(BaseModel):
    recommended_crop: str
    confidence: Optional[float] = None
    input_summary: Dict[str, Any]
    explanation: str
    agronomic_tips: List[str]
    disclaimer: str
    prediction_id: Optional[int] = None
    created_at: str

# --- Crop Yield Prediction ---
class YieldPredictionRequest(BaseModel):
    state: str = Field(..., min_length=2, description="State or region name")
    crop: str = Field(..., min_length=2, description="Crop name")
    season: str = Field(..., min_length=2, description="Crop season, e.g. Kharif, Rabi")
    area: float = Field(..., gt=0, le=100000.0, description="Cultivated land area in hectares")
    annual_rainfall: Optional[float] = Field(1100.0, ge=100.0, le=5000.0, description="Annual rainfall in mm")
    fertilizer_used: Optional[float] = Field(150.0, ge=0.0, le=1000.0, description="Fertilizer consumption in kg/ha")
    pesticide_used: Optional[float] = Field(1.5, ge=0.0, le=50.0, description="Pesticide consumption in kg/ha")

class YieldPredictionResponse(BaseModel):
    predicted_yield: float
    total_production: float
    unit: str = "Metric Tons / Hectare (t/ha)"
    production_unit: str = "Metric Tons (t)"
    crop: str
    state: str
    season: str
    area: float
    input_summary: Dict[str, Any]
    explanation: str
    disclaimer: str
    prediction_id: Optional[int] = None
    created_at: str

# --- Fertilizer Recommendation ---
class FertilizerPredictionRequest(BaseModel):
    temperature: float = Field(..., ge=10.0, le=50.0, description="Temperature in degree Celsius")
    humidity: float = Field(..., ge=10.0, le=100.0, description="Humidity percentage")
    moisture: float = Field(..., ge=10.0, le=100.0, description="Soil moisture level percentage")
    soil_type: str = Field(..., description="Soil Type: Black, Clayey, Loamy, Red, Sandy")
    crop_type: str = Field(..., description="Crop Type: Barley, Cotton, Ground Nuts, Maize, Millets, Oil seeds, Paddy, Pulses, Sugarcane, Tobacco, Wheat")
    nitrogen: float = Field(..., ge=0, le=150.0, description="Soil Nitrogen level (N)")
    potassium: float = Field(..., ge=0, le=150.0, description="Soil Potassium level (K)")
    phosphorous: float = Field(..., ge=0, le=150.0, description="Soil Phosphorous level (P)")

class FertilizerPredictionResponse(BaseModel):
    recommended_fertilizer: str
    soil_type: str
    crop_type: str
    input_summary: Dict[str, Any]
    nutrient_analysis: Dict[str, str]
    guidance: str
    precautions: List[str]
    disclaimer: str
    prediction_id: Optional[int] = None
    created_at: str

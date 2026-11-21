export interface CropPredictionInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropPredictionResult {
  recommended_crop: string;
  confidence?: number;
  input_summary: Record<string, any>;
  explanation: string;
  agronomic_tips: string[];
  disclaimer: string;
  prediction_id?: number;
  created_at: string;
}

export interface YieldPredictionInput {
  state: string;
  crop: string;
  season: string;
  area: number;
  annual_rainfall?: number;
  fertilizer_used?: number;
  pesticide_used?: number;
}

export interface YieldPredictionResult {
  predicted_yield: number;
  total_production: number;
  unit: string;
  production_unit: string;
  crop: string;
  state: string;
  season: string;
  area: number;
  input_summary: Record<string, any>;
  explanation: string;
  disclaimer: string;
  prediction_id?: number;
  created_at: string;
}

export interface FertilizerPredictionInput {
  temperature: number;
  humidity: number;
  moisture: number;
  soil_type: string;
  crop_type: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
}

export interface FertilizerPredictionResult {
  recommended_fertilizer: string;
  soil_type: string;
  crop_type: string;
  input_summary: Record<string, any>;
  nutrient_analysis: Record<string, string>;
  guidance: string;
  precautions: string[];
  disclaimer: string;
  prediction_id?: number;
  created_at: string;
}

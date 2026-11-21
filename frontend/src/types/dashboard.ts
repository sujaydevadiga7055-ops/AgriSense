import { HistoryItem } from './history';

export interface DashboardStats {
  total_predictions: number;
  crop_recommendations: number;
  yield_predictions: number;
  fertilizer_recommendations: number;
  recent_activity: HistoryItem[];
}

export interface BackendHealthResponse {
  status: 'healthy' | 'degraded' | 'offline';
  app_name: string;
  version: string;
  database: string;
  models: {
    crop_recommendation: {
      available: boolean;
      file: string;
    };
    yield_prediction: {
      available: boolean;
      file: string;
    };
    fertilizer_recommendation: {
      available: boolean;
      file: string;
    };
  };
  metadata?: Record<string, any>;
}

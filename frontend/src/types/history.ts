export interface HistoryItem {
  id: number;
  user_id: number;
  prediction_type: 'crop' | 'yield' | 'fertilizer' | string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  model_version: string;
  created_at: string;
}

export interface HistoryListResponse {
  total: number;
  items: HistoryItem[];
}

export interface HistoryFilterParams {
  prediction_type?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

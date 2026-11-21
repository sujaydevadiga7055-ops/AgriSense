import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  ProfileUpdateRequest
} from '../types/auth';
import {
  CropPredictionInput,
  CropPredictionResult,
  YieldPredictionInput,
  YieldPredictionResult,
  FertilizerPredictionInput,
  FertilizerPredictionResult
} from '../types/predict';
import {
  HistoryListResponse,
  HistoryItem,
  HistoryFilterParams
} from '../types/history';
import { DashboardStats, BackendHealthResponse } from '../types/dashboard';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private getHeaders(isProtected: boolean = false): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (isProtected) {
      const token = localStorage.getItem('agrisense_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('agrisense_token');
      localStorage.removeItem('agrisense_user');
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Your session has expired or is invalid. Please log in again.');
    }

    let errorData: any = null;
    if (!response.ok) {
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }

      const message =
        errorData?.detail ||
        (Array.isArray(errorData) ? errorData[0]?.msg : null) ||
        errorData?.message ||
        'An unexpected server error occurred. Please try again.';

      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }

  // --- HEALTH & STATUS ---
  async checkHealth(): Promise<BackendHealthResponse> {
    try {
      const res = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        headers: this.getHeaders(false),
      });
      return await this.handleResponse<BackendHealthResponse>(res);
    } catch (err: any) {
      return {
        status: 'offline',
        app_name: 'AgriSense AI',
        version: '1.0.0',
        database: 'disconnected',
        models: {
          crop_recommendation: { available: false, file: 'crop_model.joblib' },
          yield_prediction: { available: false, file: 'yield_model.joblib' },
          fertilizer_recommendation: { available: false, file: 'fertilizer_model.joblib' },
        },
      };
    }
  }

  // --- AUTHENTICATION ---
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<AuthResponse>(res);
  }

  async getMe(): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<User>(res);
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(res);
  }

  // --- PREDICTIONS ---
  async predictCrop(data: CropPredictionInput): Promise<CropPredictionResult> {
    const res = await fetch(`${BASE_URL}/api/predict/crop`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<CropPredictionResult>(res);
  }

  async predictYield(data: YieldPredictionInput): Promise<YieldPredictionResult> {
    const res = await fetch(`${BASE_URL}/api/predict/yield`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<YieldPredictionResult>(res);
  }

  async predictFertilizer(data: FertilizerPredictionInput): Promise<FertilizerPredictionResult> {
    const res = await fetch(`${BASE_URL}/api/predict/fertilizer`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<FertilizerPredictionResult>(res);
  }

  // --- PREDICTION HISTORY ---
  async getHistory(params?: HistoryFilterParams): Promise<HistoryListResponse> {
    const query = new URLSearchParams();
    if (params?.prediction_type && params.prediction_type !== 'all') {
      query.append('prediction_type', params.prediction_type);
    }
    if (params?.q) {
      query.append('q', params.q);
    }
    if (params?.limit) {
      query.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      query.append('offset', params.offset.toString());
    }

    const url = `${BASE_URL}/api/history${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<HistoryListResponse>(res);
  }

  async getHistoryDetail(id: number): Promise<HistoryItem> {
    const res = await fetch(`${BASE_URL}/api/history/${id}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<HistoryItem>(res);
  }

  async deleteHistory(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${BASE_URL}/api/history/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<{ status: string; message: string }>(res);
  }

  // --- DASHBOARD STATS ---
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<DashboardStats>(res);
  }
}

export const api = new ApiService();

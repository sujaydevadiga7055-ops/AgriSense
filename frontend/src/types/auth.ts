export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdateRequest {
  full_name: string;
}

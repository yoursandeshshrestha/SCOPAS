export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  status: string;
  data: AuthTokens;
}

export interface ErrorResponse {
  status: string;
  message: string;
  issues?: Record<string, unknown>;
}


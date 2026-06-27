import { api } from '../api';
import type { ApiResponse } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  /** Authenticate user and receive token */
  login: (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> =>
    api.post<LoginResponse>('/auth/login', credentials),

  /** Send password reset email */
  forgotPassword: (email: string): Promise<ApiResponse<null>> =>
    api.post<null>('/auth/forgot-password', { email }),

  /** Reset password with token */
  resetPassword: (token: string, password: string): Promise<ApiResponse<null>> =>
    api.post<null>('/auth/reset-password', { token, password }),

  /** Validate current session token */
  me: (): Promise<ApiResponse<LoginResponse['user']>> =>
    api.get<LoginResponse['user']>('/auth/me'),

  /** Logout (invalidate token server-side) */
  logout: (): Promise<ApiResponse<null>> =>
    api.post<null>('/auth/logout', {}),
};
// src/api/authApi.ts

import { api } from './client';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
  UserPreferences,
  TrustQualificationStatus,
} from '@/types';

export const authApi = {
  // ----- Authentication -----
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>(
      '/api/auth/refresh',
      null,
      { headers: { 'X-Refresh-Token': refreshToken } }
    ),

  logout: () =>
    api.post<ApiResponse<void>>('/api/auth/logout'),

  verify: (token: string) =>
    api.get<ApiResponse<void>>(`/api/auth/verify?token=${token}`),

  resendVerification: (email: string) =>
    api.post<ApiResponse<void>>('/api/auth/resend-verification', { universityEmail: email }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>('/api/auth/forgot-password', { universityEmail: email }),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<void>>('/api/auth/reset-password', data),

  // ----- User Profile -----
  getMe: () =>
    api.get<ApiResponse<User>>('/api/auth/me'),

  updateProfile: (formData: FormData) =>
    api.put<ApiResponse<User>>('/api/auth/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  changePassword: (data: ChangePasswordRequest) =>
    api.put<ApiResponse<void>>('/api/auth/me/password', data),

  deleteAccount: () =>
    api.delete<ApiResponse<void>>('/api/auth/me'),

  getTrustStatus: () =>
    api.get<ApiResponse<TrustQualificationStatus>>('/api/auth/me/trust-status'),

  getPreferences: () =>
    api.get<ApiResponse<UserPreferences>>('/api/auth/me/preferences'),

  updatePreferences: (data: UserPreferences) =>
    api.put<ApiResponse<UserPreferences>>('/api/auth/me/preferences', data),
};
import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosInstance.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    // Clear localStorage regardless of API success
    localStorage.clear();
  },
};
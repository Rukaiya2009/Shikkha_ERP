import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginResponse } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          console.log('AuthStore - login response:', response);
          
          // Store tokens
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          
          // Store user data
          const userData: User = {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role: response.user.role,
            schoolId: response.user.schoolId
          };
          
          // Also store in localStorage for AppRoutes to read
          const userForStorage = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.fullName,
            role: response.user.role.toLowerCase(),
            schoolId: response.user.schoolId
          };
          localStorage.setItem('user', JSON.stringify(userForStorage));
          
          console.log('AuthStore - stored user:', userForStorage);
          console.log('AuthStore - accessToken stored:', !!response.accessToken);
          
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return response;
        } catch (error: any) {
          console.error('AuthStore - login error:', error);
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          console.log('AuthStore - register response:', response);
          set({ isLoading: false });
        } catch (error: any) {
          console.error('AuthStore - register error:', error);
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.clear();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          window.location.href = '/login';
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
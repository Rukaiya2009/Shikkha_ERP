export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'  | 'DEVELOPER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    schoolId: string | null;
  };
  redirectUrl: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  schoolId: string | null;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
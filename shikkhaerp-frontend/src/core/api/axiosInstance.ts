import axios from 'axios';

// Backend has context-path /api (NO /v1)
// Full URL: http://localhost:8080/api/auth/...
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shikkha-erp.onrender.com/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // handle Render cold starts (can take 50+ seconds)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Endpoints where a 401/403 means "bad credentials / not allowed" — NOT
// "expired session". For these we must NOT attempt a token refresh and must
// NOT force a logout+redirect; the error is passed through so the calling
// page (e.g. Login) can display its own message ("Invalid credentials",
// "Account locked", etc.).
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/setup-password'];

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
};
  
// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('[API] Response error:', error.response?.status, error.response?.data);

    const originalRequest = error.config;

    // If the failing request is itself an auth call (login/refresh/register/
    // setup-password), do NOT try to refresh or log out — just pass the error
    // back so the page can show its message. This is the key fix: a failed
    // LOGIN must surface "Invalid credentials"/"Account locked", not silently
    // reload the page.
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Genuine expired-session case: an authenticated request got a 401.
    // Try a one-time token refresh; if that fails, clear and go to login.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

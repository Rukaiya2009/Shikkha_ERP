import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');

  const { login, isLoading, error, clearError } = useAuth();

  // Normal login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // First-time setup state
  const [setupEmail, setSetupEmail] = useState(emailParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  const isFirstTime = !!emailParam;

  // Pre-fill email if param exists
  useEffect(() => {
    if (emailParam) {
      setSetupEmail(emailParam);
    }
  }, [emailParam]);

  // Normal login handler (unchanged)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const response = await login(email, password);
      console.log('Login response:', response);

      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.fullName,
        role: response.user.role.toLowerCase(),
        schoolId: response.user.schoolId,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      let redirectPath = '/student/dashboard';
      const role = userData.role;

      if (role === 'super_admin') redirectPath = '/super-admin/dashboard';
      else if (role === 'school_admin') redirectPath = '/school-admin/dashboard';
      else if (role === 'teacher') redirectPath = '/teacher/dashboard';
      else if (role === 'parent') redirectPath = '/parent/dashboard';
      else redirectPath = '/student/dashboard';

      window.location.href = redirectPath;
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // First-time password setup handler
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    if (newPassword !== confirmPassword) {
      setSetupError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSetupError('Password must be at least 6 characters.');
      return;
    }

    setSetupLoading(true);
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SETUP_PASSWORD, {
        email: setupEmail,
        password: newPassword,
      });
      // Assuming backend returns tokens and user data
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      // Redirect to appropriate dashboard
      const role = user?.role?.toLowerCase() || 'student';
      let redirectPath = '/student/dashboard';
      if (role === 'super_admin') redirectPath = '/super-admin/dashboard';
      else if (role === 'school_admin') redirectPath = '/school-admin/dashboard';
      else if (role === 'teacher') redirectPath = '/teacher/dashboard';
      else if (role === 'parent') redirectPath = '/parent/dashboard';
      window.location.href = redirectPath;
    } catch (err: any) {
      setSetupError(err.response?.data?.message || 'Failed to set up password. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };

  // ── First-time setup UI ──────────────────────────────────────────
  if (isFirstTime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-white">SE</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome to ShikkhaERP</h1>
            <p className="text-gray-500 text-sm">Set up your admin account</p>
          </div>

          <form onSubmit={handleSetupPassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={setupEmail}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
                minLength={6}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            {setupError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {setupError}
              </div>
            )}

            <button
              type="submit"
              disabled={setupLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {setupLoading ? 'Setting up...' : 'Create Account & Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Normal login UI (your existing design) ──────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-white">SE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ShikkhaERP</h1>
          <p className="text-gray-500 text-sm">School Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 mb-4"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <a href="/register" className="text-blue-600 hover:underline text-sm">
              Create New Account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginContainer;
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { LoginForm } from '../components/LoginForm.present';

/**
 * Login + first-time password setup.
 *
 * Normal login renders the branded "Welcome Back" LoginForm (LoginForm.present).
 * The token-based setup-password flow (super-admin onboarding link from the
 * demo-approval email, carrying ?email= for prefill and ?token= for verification)
 * is preserved exactly — do NOT replace this with a plain login-only container,
 * or that onboarding link stops working.
 */
const LoginContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  const tokenParam = searchParams.get('token'); // secure setup token from the approval email

  const { login, isLoading, error, clearError } = useAuth();

  // First-time setup state
  const [setupEmail, setSetupEmail] = useState(emailParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // The setup screen is driven by the email in the link; the token verifies it.
  const isFirstTime = !!emailParam;

  useEffect(() => {
    if (emailParam) setSetupEmail(emailParam);
  }, [emailParam]);

  const redirectForRole = (role?: string) => {
    const r = (role || 'student').toLowerCase();
    if (r === 'super_admin') return '/welcome';
    if (r === 'school_admin') return '/school-admin/dashboard';
    if (r === 'teacher') return '/teacher/dashboard';
    if (r === 'parent') return '/parent/dashboard';
    if (r === 'developer') return '/developer/dashboard';
    return '/student/dashboard';
  };

  // Normal login — called by LoginForm with (email, password).
  const handleLogin = async (email: string, password: string) => {
    clearError();
    try {
      const response = await login(email, password);

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

      window.location.href = redirectForRole(userData.role);
    } catch (err) {
      console.error('Login failed:', err);
      // error state is set in the auth store; LoginForm renders it.
    }
  };

  // First-time password setup (token-based, matches secure backend).
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    if (!tokenParam) {
      setSetupError('This setup link is missing its security token. Please use the link from your approval email.');
      return;
    }
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
        token: tokenParam,
        newPassword,
      });
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      window.location.href = redirectForRole(user?.role);
    } catch (err: any) {
      setSetupError(err.response?.data?.message || 'Failed to set up password. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };

  // ── First-time setup UI (brand-aligned) ─────────────────────────
  if (isFirstTime) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F9FF] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-modal">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand">
              <span className="font-display text-xl font-extrabold text-white">SE</span>
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink">Welcome to ShikkhaERP</h1>
            <p className="text-sm text-slatesoft">Set up your admin account</p>
          </div>

          <form onSubmit={handleSetupPassword}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold text-ink">Email Address</label>
              <input
                type="email"
                value={setupEmail}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-linestrong bg-surfaceinset px-4 py-2.5 text-slatesoft"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold text-ink">Create Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-linestrong px-4 py-2.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand-sky/30"
                required
                minLength={6}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold text-ink">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-linestrong px-4 py-2.5 outline-none focus:border-brand focus:ring-4 focus:ring-brand-sky/30"
                required
              />
            </div>

            {setupError && (
              <div className="mb-4 rounded-lg bg-[#FBEAE9] p-3 text-sm text-[#B3261E]">{setupError}</div>
            )}

            <button
              type="submit"
              disabled={setupLoading}
              className="w-full rounded-xl bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-deep disabled:opacity-50"
            >
              {setupLoading ? 'Setting up…' : 'Create Account & Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Normal login: the branded "Welcome Back" form ────────────────
  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />;
};

export default LoginContainer;

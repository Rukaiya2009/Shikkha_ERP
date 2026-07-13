import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

const SetupPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Invalid link: the security token is missing. Please reopen the invitation email.'); return; }
    if (pw !== confirm) { setError('Passwords do not match.'); return; }
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.AUTH.SETUP_PASSWORD, { token, newPassword: pw });
      const d = res.data;
      const role = d.user.role.toLowerCase();
      localStorage.setItem('user', JSON.stringify({ id: d.user.id, email: d.user.email, name: d.user.fullName, role, schoolId: d.user.schoolId }));
      localStorage.setItem('accessToken', d.accessToken);
      localStorage.setItem('refreshToken', d.refreshToken);
      const map: Record<string, string> = { super_admin: '/super-admin/dashboard', school_admin: '/school-admin/dashboard', teacher: '/teacher/dashboard', parent: '/parent/dashboard', developer: '/developer/dashboard', student: '/student/dashboard' };
      window.location.href = map[role] || '/student/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to set password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Welcome to ShikkhaERP</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Set your password to activate your account</p>
        <form onSubmit={submit}>
          <input type="password" placeholder="Create password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Setting up...' : 'Create Account & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPassword;

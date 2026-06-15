import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.present';
import { useAuth } from '../../../hooks/useAuth';

const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      const response = await login(email, password);
      console.log('Full login response:', response);
      
      // Store user data in localStorage
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.fullName,
        role: response.user.role.toLowerCase(),
        schoolId: response.user.schoolId
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      console.log('Stored user data:', userData);
      console.log('Stored accessToken:', response.accessToken);
      
      // Redirect based on role
      let redirectPath = '/student/dashboard';
      const role = userData.role;
      
      switch (role) {
        case 'super_admin':
          redirectPath = '/super-admin/dashboard';
          break;
        case 'school_admin':
          redirectPath = '/school-admin/dashboard';
          break;
        case 'teacher':
          redirectPath = '/teacher/dashboard';
          break;
        case 'parent':
          redirectPath = '/parent/dashboard';
          break;
        case 'student':
          redirectPath = '/student/dashboard';
          break;
      }
      
      console.log('Redirecting to:', redirectPath);
      window.location.href = redirectPath;
      
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

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
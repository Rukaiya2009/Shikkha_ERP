import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.present';
import { useAuth } from '../../../hooks/useAuth';

const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
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
        schoolId: response.user.schoolId,
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
        default:
          redirectPath = '/student/dashboard';
      }

      console.log('Redirecting to:', redirectPath);
      window.location.href = redirectPath;
    } catch (err) {
      console.error('Login failed:', err);
      // The error state is already set in the auth store, so the form will display it.
    }
  };

  return <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />;
};

export default LoginContainer;
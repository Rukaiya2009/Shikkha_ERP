import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm.present';
import { useAuth } from '../../../hooks/useAuth';

const RegisterContainer: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: any) => {
    clearError();
    try {
      await register(data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Registration Successful!</h2>
          <p className="text-gray-500 mt-2">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <RegisterForm 
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default RegisterContainer;
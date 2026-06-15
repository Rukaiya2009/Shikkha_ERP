import React, { useState } from 'react';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  schoolId?: string | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSubmit, 
  isLoading = false, 
  error = null 
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [schoolId, setSchoolId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if role requires school ID (all except SUPER_ADMIN)
  const requiresSchoolId = () => {
    return role !== 'SUPER_ADMIN';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    await onSubmit({
      fullName,
      email,
      password,
      role,
      schoolId: requiresSchoolId() ? schoolId : null,
    });
  };

  // Get placeholder text based on role
  const getSchoolIdPlaceholder = () => {
    switch(role) {
      case 'TEACHER':
        return 'Enter your school ID (e.g., 11111111-1111-1111-1111-111111111111)';
      case 'STUDENT':
        return 'Enter your school ID';
      case 'PARENT':
        return 'Enter your school ID';
      case 'SCHOOL_ADMIN':
        return 'Enter your school ID';
      default:
        return 'School ID';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-white">SE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join ShikkhaERP today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isLoading}
            />
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isLoading}
            />
          </div>
          
          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isLoading}
            >
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
              <option value="TEACHER">Teacher</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* School ID Field - Required for all except SUPER_ADMIN */}
          {requiresSchoolId() && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School ID *
              </label>
              <input
                type="text"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                placeholder={getSchoolIdPlaceholder()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required={requiresSchoolId()}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Contact your school administrator to get your School ID
              </p>
            </div>
          )}
          
          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                required
                minLength={6}
                disabled={isLoading}
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
          
          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isLoading}
            />
            {password !== confirmPassword && confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">Already have an account? </span>
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
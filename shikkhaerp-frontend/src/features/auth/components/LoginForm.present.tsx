import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF] p-4 overflow-x-hidden animate-fade-in">
      <div className="w-full max-w-[1300px] mx-auto min-h-[700px] bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden flex flex-col md:flex-row animate-scale-in">

        {/* ====================================================
            LEFT SIDE – Login Form
            ==================================================== */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Brand Logo */}
            <div className="mb-8 flex justify-center animate-fade-in-up">
              <div className="inline-flex items-center px-5 py-2 border border-[#81D5FF] rounded-full bg-primary/5">
                <span className="text-xl md:text-2xl font-bold text-[#1E3A8A] tracking-tight">
                  ShikkhaERP
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center animate-fade-in-up animation-delay-100">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-sm md:text-base mt-2">
                Sign in to continue managing your school operations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="animate-fade-in-up animation-delay-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@school.com"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border-transparent focus:border-[#81D5FF] focus:ring-4 focus:ring-[#81D5FF]/20 text-base transition-all outline-none"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="animate-fade-in-up animation-delay-300">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border-transparent focus:border-[#81D5FF] focus:ring-4 focus:ring-[#81D5FF]/20 text-base transition-all outline-none pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between animate-fade-in-up animation-delay-400">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#81D5FF] focus:ring-[#81D5FF] focus:ring-2"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#1E3A8A] transition-colors">
                    Remember Me
                  </span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-[#1E3A8A] font-semibold hover:underline decoration-2 underline-offset-4"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm animate-fade-in-up animation-delay-500">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#81D5FF] hover:bg-[#6ec9f5] text-[#1E3A8A] font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] disabled:opacity-50 animate-fade-in-up animation-delay-500"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-[#1E3A8A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center animate-fade-in-up animation-delay-600">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <a href="/register" className="text-[#1E3A8A] font-bold hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center items-center gap-3 text-xs md:text-sm mt-6 border-t border-gray-100 pt-5 animate-fade-in-up animation-delay-700">
            <a href="#" className="text-gray-500 hover:text-[#1E3A8A] transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-gray-500 hover:text-[#1E3A8A] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>

        {/* ====================================================
            RIGHT SIDE – Branding & Trust
            ==================================================== */}
        <div className="hidden md:block w-1/2 relative bg-[#F0F9FF] overflow-hidden">
          {/* Background Image */}
          <img
            alt="School campus"
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
            src="/images/dashboard-preview_tab.png"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="absolute inset-0 bg-[#81D5FF]/15"></div>

          {/* Floating Trust Card */}
          <div className="relative z-10 flex items-center justify-center h-full p-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-float">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#1E3A8A]/70 font-semibold">
                    Welcome to
                  </p>
                  <h2 className="text-3xl font-bold text-[#1E3A8A] mt-1">[School Name]</h2>
                  <p className="text-sm text-[#1E3A8A]/80 font-medium border-b border-[#1E3A8A]/10 pb-3">
                    National School Management Platform
                  </p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#81D5FF]/30 flex items-center justify-center text-[#1E3A8A]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#1E3A8A]">
                      Secure Role‑Based Access Control
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#81D5FF]/30 flex items-center justify-center text-[#1E3A8A]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#1E3A8A]">
                      Real‑time Attendance &amp; Results
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#81D5FF]/30 flex items-center justify-center text-[#1E3A8A]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#1E3A8A]">
                      Exam &amp; Grade Management
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#81D5FF]/30 flex items-center justify-center text-[#1E3A8A]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#1E3A8A]">
                      Multi‑School Administration
                    </span>
                  </li>
                </ul>

                <div className="pt-4 border-t border-[#1E3A8A]/10">
                  <p className="text-xs text-[#1E3A8A]/70">
                    Trusted by educational institutions nationwide.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="absolute bottom-6 left-0 right-0 text-center z-10">
            <p className="text-xs text-white/90 drop-shadow-md font-medium tracking-wider">
              ShikkhaERP <span className="mx-1">•</span> Smart School. Smarter Management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
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
  schoolId?: string; // ✅ Added – temporary for backend testing
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordMismatch = confirmPassword !== '' && password !== confirmPassword;

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
      schoolId: '1', // 🔴 TEMPORARY – hardcoded for testing
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF] p-4 overflow-x-hidden animate-fade-in">
      <div className="w-full max-w-[1300px] mx-auto min-h-[700px] bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden flex flex-col md:flex-row animate-scale-in">

        {/* ====================================================
            LEFT SIDE – Registration Form (50%)
            ==================================================== */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Brand Logo with fade-in */}
            <div className="mb-8 flex justify-center animate-fade-in-up">
              <div className="inline-flex items-center px-5 py-2 border border-[#81D5FF] rounded-full bg-primary/5">
                <span className="text-xl md:text-2xl font-bold text-[#1E3A8A] tracking-tight">
                  ShikkhaERP
                </span>
              </div>
            </div>

            {/* Header with slide-up */}
            <div className="mb-6 text-center animate-slide-up">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Create an account
              </h1>
              <p className="text-gray-500 text-sm md:text-base mt-2">
                Sign up and get 30 day free trial
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields with staggered fade-in */}
              <div className="animate-fade-in-up animation-delay-100">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Fullname
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border-transparent focus:border-[#81D5FF] focus:ring-4 focus:ring-[#81D5FF]/20 text-base transition-all outline-none"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="animate-fade-in-up animation-delay-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
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

              <div className="animate-fade-in-up animation-delay-300">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border-transparent focus:border-[#81D5FF] focus:ring-4 focus:ring-[#81D5FF]/20 text-base appearance-none cursor-pointer outline-none"
                    disabled={isLoading}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PARENT">Parent</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="SCHOOL_ADMIN">School Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="DEVELOPER">Developer</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in-up animation-delay-400">
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
                    minLength={6}
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

              <div className="animate-fade-in-up animation-delay-500">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-11 px-4 rounded-xl bg-slate-50 border-transparent focus:border-[#81D5FF] focus:ring-4 focus:ring-[#81D5FF]/20 text-base transition-all outline-none pr-10 ${
                      passwordMismatch ? 'border-2 border-red-300' : ''
                    }`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || passwordMismatch}
                className="w-full h-12 bg-[#81D5FF] hover:bg-[#6ec9f5] text-[#1E3A8A] font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] disabled:opacity-50 animate-fade-in-up animation-delay-600"
              >
                {isLoading ? 'Creating Account...' : 'Submit'}
              </button>

              <div className="flex gap-3 pt-2 animate-fade-in-up animation-delay-700">
                <button
                  type="button"
                  className="flex-1 h-11 border border-gray-200 rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 2.96 2.58 3.94 2.6 3.95-.02.07-.41 1.41-1.34 2.79zM15 3c.55.65.9 1.52.78 2.45-.77.06-1.72-.52-2.27-1.26-.49-.66-.79-1.5-.66-2.32.77.03 1.66.55 2.15 1.13z" />
                  </svg>
                  <span className="text-sm font-semibold">Apple</span>
                </button>
                <button
                  type="button"
                  className="flex-1 h-11 border border-gray-200 rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-semibold">Google</span>
                </button>
              </div>
            </form>
          </div>

          <div className="flex justify-between items-center text-xs md:text-sm mt-6 border-t border-gray-100 pt-5 animate-fade-in-up animation-delay-800">
            <p className="text-gray-500">
              Have any account?{' '}
              <a href="/login" className="text-[#1E3A8A] font-bold hover:underline">
                Sign in
              </a>
            </p>
            <a href="#" className="text-gray-500 hover:underline">
              Terms &amp; Conditions
            </a>
          </div>
        </div>

        {/* ====================================================
            RIGHT SIDE – Dashboard Preview with Animations
            ==================================================== */}
        <div className="hidden md:block w-1/2 relative bg-[#F0F9FF] overflow-hidden">
          {/* Background image (tab version) */}
          <img
            alt="School dashboard preview"
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
            src="/images/dashboard-preview_tab.png"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#81D5FF]/40 via-[#81D5FF]/10 to-white/70"></div>

          {/* Floating UI Widgets */}
          <div className="relative h-full w-full p-6 md:p-8 flex flex-col justify-between">

            {/* ─── Top: Task Review Card ─── (floating up-down) */}
            <div className="flex justify-center mt-2 animate-float">
              <div className="bg-[#81D5FF] text-[#1E3A8A] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 whitespace-nowrap">
                <div className="bg-white/30 p-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-xs md:text-sm">Task Review With Team</p>
                  <p className="opacity-80 text-[9px] md:text-[10px] uppercase tracking-wider font-semibold">
                    09:30am – 10:00am
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Middle: Stats Cards ─── */}
            <div className="grid grid-cols-2 gap-3 my-1">
              {/* Total Students */}
              <div className="bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-lg animate-float animation-delay-200">
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Total Students
                </p>
                <p className="text-xl md:text-3xl font-bold text-gray-800">1,284</p>
                <p className="text-[10px] md:text-xs text-green-600 font-semibold">
                  ↑ 12.5% vs last month
                </p>
              </div>

              {/* Total Teachers */}
              <div className="bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-lg animate-float animation-delay-400">
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Total Teachers
                </p>
                <p className="text-xl md:text-3xl font-bold text-gray-800">96</p>
                <p className="text-[10px] md:text-xs text-green-600 font-semibold">
                  ↑ 8.2% vs last month
                </p>
              </div>

              {/* Attendance (full width) */}
              <div className="bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-lg col-span-2 animate-float animation-delay-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                      Attendance
                    </p>
                    <p className="text-xl md:text-3xl font-bold text-gray-800">
                      94% <span className="text-sm font-normal text-gray-500">Present</span>
                    </p>
                  </div>
                  <div className="flex gap-3 md:gap-4">
                    <div>
                      <p className="text-[10px] md:text-xs text-green-600 font-semibold">Present</p>
                      <p className="text-sm font-bold text-gray-700">1,208</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-red-500 font-semibold">Absent</p>
                      <p className="text-sm font-bold text-gray-700">76</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-yellow-500 font-semibold">Late</p>
                      <p className="text-sm font-bold text-gray-700">20</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Bottom: Daily Meeting + Calendar ─── */}
            <div className="flex gap-3">
              {/* Daily Meeting */}
              <div className="bg-white/70 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl flex-1 animate-float animation-delay-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-[10px] md:text-sm">
                    Daily Meeting
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#81D5FF] animate-pulse shadow-[0_0_8px_#81D5FF]"></div>
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mb-2">12:00pm – 01:00pm</p>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-gray-600 animate-scale-in-stagger">
                    JD
                  </div>
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-gray-600 animate-scale-in-stagger animation-delay-100">
                    MB
                  </div>
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-gray-600 animate-scale-in-stagger animation-delay-200">
                    AS
                  </div>
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white bg-[#81D5FF]/20 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-[#1E3A8A] animate-scale-in-stagger animation-delay-300">
                    +2
                  </div>
                </div>
              </div>

              {/* Mini Calendar */}
              <div className="bg-white/70 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl flex-1 animate-float animation-delay-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    Calendar Weekly
                  </span>
                </div>
                <div className="flex justify-between">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                    const date = 22 + idx;
                    const isToday = date === 24;
                    return (
                      <div
                        key={day}
                        className={`flex flex-col items-center gap-0.5 transition-all duration-300 hover:scale-110 ${
                          isToday ? 'bg-[#81D5FF] px-1 py-0.5 md:px-1.5 md:py-1 rounded-lg animate-pop' : ''
                        }`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <span
                          className={`text-[6px] md:text-[8px] ${
                            isToday ? 'font-bold text-[#1E3A8A]' : 'text-gray-500'
                          }`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-[8px] md:text-xs font-semibold ${
                            isToday ? 'text-[#1E3A8A]' : 'text-gray-700'
                          }`}
                        >
                          {date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ─── Footer ─── */}
            <div className="text-center mt-2 animate-fade-in-up animation-delay-900">
              <p className="text-[9px] md:text-[10px] text-white/80 font-medium tracking-wider">
                ShikkhaERP <span className="mx-1">•</span> Smart School. Smarter Management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
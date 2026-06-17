import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  DollarSign,
  BarChart3,
  Settings,
  Home,
  FileText,
  Clock,
  Award,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

const roleNavItems: Record<string, NavItem[]> = {
  SUPER_ADMIN: [
    { title: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { title: 'Schools', path: '/super-admin/schools', icon: Home },
    { title: 'Users', path: '/super-admin/users', icon: Users },
    { title: 'Reports', path: '/super-admin/reports', icon: BarChart3 },
    { title: 'System Settings', path: '/super-admin/settings', icon: Settings },
  ],
  SCHOOL_ADMIN: [
    { title: 'Dashboard', path: '/school-admin/dashboard', icon: LayoutDashboard },
    { title: 'Students', path: '/school-admin/students', icon: GraduationCap },
    { title: 'Teachers', path: '/school-admin/teachers', icon: Users },
    { title: 'Classes', path: '/school-admin/classes', icon: BookOpen },
    { title: 'Attendance', path: '/school-admin/attendance', icon: Calendar },
    { title: 'Exams', path: '/school-admin/exams', icon: ClipboardList },
    { title: 'Fees', path: '/school-admin/fees', icon: DollarSign },
    { title: 'Reports', path: '/school-admin/reports', icon: BarChart3 },
    { title: 'Settings', path: '/school-admin/settings', icon: Settings },
  ],
  TEACHER: [
    { title: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { title: 'My Classes', path: '/teacher/classes', icon: BookOpen },
    { title: 'Attendance', path: '/teacher/attendance', icon: Calendar },
    { title: 'Gradebook', path: '/teacher/gradebook', icon: FileText },
    { title: 'Lessons', path: '/teacher/lessons', icon: Clock },
    { title: 'Exams', path: '/teacher/exams', icon: ClipboardList },
  ],
  STUDENT: [
    { title: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { title: 'My Attendance', path: '/student/attendance', icon: Calendar },
    { title: 'Results', path: '/student/results', icon: Award },
    { title: 'Timetable', path: '/student/timetable', icon: Clock },
    { title: 'Fees', path: '/student/fees', icon: DollarSign },
    { title: 'Assignments', path: '/student/assignments', icon: FileText },
  ],
  PARENT: [
    { title: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    { title: 'My Children', path: '/parent/children', icon: Users },
    { title: 'Attendance', path: '/parent/attendance', icon: Calendar },
    { title: 'Results', path: '/parent/results', icon: Award },
    { title: 'Fees', path: '/parent/fees', icon: DollarSign },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const navItems = roleNavItems[role] || roleNavItems.STUDENT;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-[#1E3A8A] text-white z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:block
          flex flex-col
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#81D5FF] rounded-lg flex items-center justify-center">
            <span className="text-[#1E3A8A] font-bold text-sm">SE</span>
          </div>
          <span className="text-lg font-bold">ShikkhaERP</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                ${isActive
                  ? 'bg-[#81D5FF] text-[#1E3A8A] shadow-lg'
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-white/50 text-center">
          <p>ShikkhaERP v1.0</p>
        </div>
      </aside>
    </>
  );
};
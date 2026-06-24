// src/shared/layouts/sidebar/StudentSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Award, Clock, DollarSign, FileText } from 'lucide-react';
import { SidebarBase } from './SidebarBase';

const navItems = [
  { title: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { title: 'My Attendance', path: '/student/attendance', icon: Calendar },
  { title: 'Results', path: '/student/results', icon: Award },
  { title: 'Timetable', path: '/student/timetable', icon: Clock },
  { title: 'Fees', path: '/student/fees', icon: DollarSign },
  { title: 'Assignments', path: '/student/assignments', icon: FileText },
];

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <SidebarBase isOpen={isOpen} onClose={onClose}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path!}
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
    </SidebarBase>
  );
};
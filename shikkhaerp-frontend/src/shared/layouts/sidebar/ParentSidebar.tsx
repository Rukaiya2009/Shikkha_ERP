// src/shared/layouts/sidebar/ParentSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Award, Calendar, DollarSign, Bell, User } from 'lucide-react';
import { SidebarBase } from './SidebarBase';

const navItems = [
  { title: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
  { title: 'My Children', path: '/parent/children', icon: Users },
  { title: 'Attendance', path: '/parent/attendance', icon: Calendar },
  { title: 'Results', path: '/parent/results', icon: Award },
  { title: 'Fees', path: '/parent/fees', icon: DollarSign },
  { title: 'Notices', path: '/parent/notices', icon: Bell },
  { title: 'Profile', path: '/parent/profile', icon: User },
];

interface ParentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentSidebar: React.FC<ParentSidebarProps> = ({ isOpen, onClose }) => {
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
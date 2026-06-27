// src/shared/layouts/sidebar/DeveloperSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Mail, Settings, Code, Users } from 'lucide-react';
import { SidebarBase } from './SidebarBase';

const navItems = [
  { title: 'Dashboard', path: '/developer/dashboard', icon: LayoutDashboard },
  { title: 'Pending Approvals', path: '/developer/approvals', icon: CheckSquare },
  { title: 'All Schools', path: '/developer/schools', icon: Users },
  { title: 'Email Logs', path: '/developer/email-logs', icon: Mail },
  { title: 'Settings', path: '/developer/settings', icon: Settings },
];

interface DeveloperSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperSidebar: React.FC<DeveloperSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <SidebarBase isOpen={isOpen} onClose={onClose}>
      {/* Brand extra icon */}
      <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-blue-500/10 rounded-lg text-blue-300">
        <Code className="w-4 h-4" />
        <span className="text-xs font-mono font-semibold tracking-wider">DEV MODE</span>
      </div>

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
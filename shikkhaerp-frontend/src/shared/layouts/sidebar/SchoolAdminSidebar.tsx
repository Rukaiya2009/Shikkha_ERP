// src/shared/layouts/sidebar/SchoolAdminSidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Settings, ChevronDown } from 'lucide-react';
import { SidebarBase } from './SidebarBase';

interface NavItem {
  title: string;
  path?: string;
  icon: React.ElementType;
  children?: { title: string; path: string }[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', path: '/school-admin/dashboard', icon: LayoutDashboard },
  {
    title: 'User Management',
    icon: Users,
    children: [
      { title: 'Users', path: '/school-admin/users' },
      { title: 'Roles', path: '/school-admin/roles' },
      { title: 'Permissions', path: '/school-admin/permissions' },
    ],
  },
  {
    title: 'Student Management',
    icon: GraduationCap,
    children: [{ title: 'Student List', path: '/school-admin/students' }],
  },
  {
    title: 'Teacher Management',
    icon: Users,
    children: [{ title: 'Teacher List', path: '/school-admin/teachers' }],
  },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'School Profile', path: '/school-admin/settings/profile' },
      { title: 'Branding', path: '/school-admin/settings/branding' },
      { title: 'Preferences', path: '/school-admin/settings/preferences' },
    ],
  },
];

interface SchoolAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolAdminSidebar: React.FC<SchoolAdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const [expanded, setExpanded] = useState<string[]>(
    navItems.map((item) => item.title)
  );

  const toggleExpand = (title: string) => {
    setExpanded((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <SidebarBase isOpen={isOpen} onClose={onClose}>
      {navItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expanded.includes(item.title);

        if (hasChildren) {
          return (
            <div key={item.title}>
              <button
                onClick={() => toggleExpand(item.title)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isExpanded && (
                <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={onClose}
                      className={({ isActive }) => `
                        block px-4 py-2 rounded-lg text-sm transition-all
                        ${isActive
                          ? 'bg-[#81D5FF] text-[#1E3A8A]'
                          : 'hover:bg-white/10 text-white/70 hover:text-white'
                        }
                      `}
                    >
                      {child.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
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
        );
      })}
    </SidebarBase>
  );
};
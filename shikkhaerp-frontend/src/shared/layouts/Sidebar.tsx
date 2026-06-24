// src/shared/layouts/Sidebar.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SuperAdminSidebar } from './sidebar/SuperAdminSidebar';
import { SchoolAdminSidebar } from './sidebar/SchoolAdminSidebar';
import { TeacherSidebar } from './sidebar/TeacherSidebar';
import { StudentSidebar } from './sidebar/StudentSidebar';
import { ParentSidebar } from './sidebar/ParentSidebar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const sidebarMap: Record<string, React.FC<{ isOpen: boolean; onClose: () => void }>> = {
    SUPER_ADMIN: SuperAdminSidebar,
    SCHOOL_ADMIN: SchoolAdminSidebar,
    TEACHER: TeacherSidebar,
    STUDENT: StudentSidebar,
    PARENT: ParentSidebar,
  };

  const SidebarComponent = sidebarMap[role] || StudentSidebar;

  return <SidebarComponent isOpen={isOpen} onClose={onClose} />;
};
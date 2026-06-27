// src/shared/layouts/Sidebar.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SuperAdminSidebar } from './sidebar/SuperAdminSidebar';
import { SchoolAdminSidebar } from './sidebar/SchoolAdminSidebar';
import { TeacherSidebar } from './sidebar/TeacherSidebar';
import { StudentSidebar } from './sidebar/StudentSidebar';
import { ParentSidebar } from './sidebar/ParentSidebar';
import { DeveloperSidebar } from './sidebar/DeveloperSidebar'; // NEW

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || 'student'; // Force lowercase

  // ✅ Map lowercase roles to their sidebar components
  const sidebarMap: Record<string, React.FC<{ isOpen: boolean; onClose: () => void }>> = {
    super_admin: SuperAdminSidebar,
    school_admin: SchoolAdminSidebar,
    teacher: TeacherSidebar,
    student: StudentSidebar,
    parent: ParentSidebar,
    developer: DeveloperSidebar, // NEW
  };

  const SidebarComponent = sidebarMap[role] || StudentSidebar;

  return <SidebarComponent isOpen={isOpen} onClose={onClose} />;
};
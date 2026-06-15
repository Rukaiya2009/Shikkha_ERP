import React from 'react';
import { LogoutButton } from '../../features/auth/components/LogoutButton';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SE</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-800">ShikkhaERP</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
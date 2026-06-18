import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogoutButton } from '../../features/auth/components/LogoutButton';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Left: Logo + Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#81D5FF] rounded-lg flex items-center justify-center">
              <span className="text-[#1E3A8A] font-bold text-sm">SE</span>
            </div>
            <span className="text-lg font-bold text-[#1E3A8A] hidden sm:block">
              ShikkhaERP
            </span>
          </Link>
        </div>

        {/* Right: User Info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};
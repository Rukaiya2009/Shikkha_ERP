import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogoutButton } from '../../features/auth/components/LogoutButton';
import { ChangePasswordModal } from '../../features/auth/components/ChangePasswordModal';
import { Menu, ChevronDown, KeyRound } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on an outside click or Escape. Without this the menu
  // stays open when you click elsewhere, which feels broken.
  useEffect(() => {
    if (!menuOpen) return;
    const onClickAway = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

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

        {/* Right: User Info + Account menu + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>

          {/* Account dropdown. This is the home for self-service account
              actions — Change password now, and where the Permanent delete
              item will live once that endpoint exists. */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-[#81D5FF] flex items-center justify-center text-[#06263D] font-bold text-xs">
                {user?.fullName
                  ? user.fullName.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
                  : '?'}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-40"
              >
                <div className="px-3 py-2 border-b border-gray-100 sm:hidden">
                  <p className="text-sm font-medium text-gray-700 truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); setShowChangePassword(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <KeyRound className="w-4 h-4 text-gray-500" />
                  Change password
                </button>
              </div>
            )}
          </div>

          <LogoutButton />
        </div>
      </div>

      {/* Rendered once, outside the dropdown, so closing the menu doesn't
          unmount the modal mid-use. */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </header>
  );
};
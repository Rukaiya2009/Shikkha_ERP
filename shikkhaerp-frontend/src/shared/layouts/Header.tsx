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

  const initials = user?.fullName
    ? user.fullName.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Logo + Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 transition-colors hover:bg-surfaceinset md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-slatesoft" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-sky">
              <span className="font-display text-sm font-extrabold text-brand">SE</span>
            </div>
            <span className="hidden font-display text-lg font-extrabold tracking-tight text-brand sm:block">
              ShikkhaERP
            </span>
          </Link>
        </div>

        {/* Right: User Info + Account menu + Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink">{user?.fullName}</p>
            <p className="text-xs capitalize text-slatesoft">{user?.role?.replace('_', ' ')}</p>
          </div>

          {/* Account dropdown — home for self-service account actions. */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-surfaceinset"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky font-display text-xs font-bold text-brand">
                {initials}
              </div>
              <ChevronDown className="h-4 w-4 text-slatesoft" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-card-hover"
              >
                <div className="border-b border-line px-3 py-2 sm:hidden">
                  <p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p>
                  <p className="text-xs capitalize text-slatesoft">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); setShowChangePassword(true); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surfaceinset"
                >
                  <KeyRound className="h-4 w-4 text-slatesoft" />
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

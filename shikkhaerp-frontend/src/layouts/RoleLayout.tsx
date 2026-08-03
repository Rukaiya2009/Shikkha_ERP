/**
 * RoleLayout — the shell every signed-in screen renders inside.
 *
 * Structure is identical for all roles (rail · header · content · footer);
 * only the navigation tree and the rail caption change, which is what makes
 * "layout-based and role-based" work without six copies of the same file.
 */
import React, { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppHeader, Notice } from './AppHeader';
import { AppFooter } from './AppFooter';
import { SIDEBAR_VARIANTS, SIDEBAR_DEFAULT, SidebarVariant } from './Sidebars';
import { ChangePasswordModal } from '../features/auth/components/ChangePasswordModal';
import { platformTotals } from '../features/platform/data/mock';

const VARIANT_KEY = 'shikkha.sidebarVariant';

/** Header notifications. Replace with a feed endpoint when one exists. */
const NOTICES: Notice[] = [
  { id: 'n1', kind: 'alert', title: 'Khulna Public School trial ends tomorrow', body: 'No plan selected yet — 88 students at risk of losing access.', at: '20 min ago', unread: true },
  { id: 'n2', kind: 'message', title: 'New demo request', body: 'Comilla Victoria School submitted a request for 500–1000 students.', at: '3 hours ago', unread: true },
  { id: 'n3', kind: 'alert', title: 'SMS gateway degraded', body: 'Provider reporting delays — messages queued, not lost.', at: '5 hours ago', unread: true },
  { id: 'n4', kind: 'message', title: 'Invoice INV-2026-0184 paid', body: 'Havashpur Girls College paid ৳8,200 by Nagad.', at: 'Yesterday', unread: false },
];

export const RoleLayout: React.FC = () => {
  const { user, getUserRole, logout } = useAuth();
  const role = getUserRole();

  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [variant, setVariant] = useState<SidebarVariant>(() => {
    const stored = localStorage.getItem(VARIANT_KEY) as SidebarVariant | null;
    return stored && stored in SIDEBAR_VARIANTS ? stored : SIDEBAR_DEFAULT;
  });

  const chooseVariant = (v: SidebarVariant) => {
    setVariant(v);
    localStorage.setItem(VARIANT_KEY, v);
  };

  const counts = useMemo(() => {
    const t = platformTotals();
    return { approvals: t.pendingApprovals, tickets: t.openTickets, deletions: 2, unread: NOTICES.filter((n) => n.unread).length };
  }, []);

  const { Component: Rail, width } = SIDEBAR_VARIANTS[variant];

  return (
    <div className="min-h-screen bg-canvas">
      <Rail
        role={role}
        userName={user?.fullName}
        isOpen={open}
        onClose={() => setOpen(false)}
        counts={counts}
        onCollapse={() => chooseVariant(variant === 'compact' ? 'grouped' : 'compact')}
      />

      {/* Content sits beside the fixed rail on desktop, full width below lg. */}
      <div className="flex min-h-screen flex-col transition-[padding] duration-300" style={{ paddingLeft: 0 }}>
        <div className="lg:pl-[var(--rail)]" style={{ ['--rail' as any]: `${width}px` }}>
          <AppHeader
            role={role}
            userName={user?.fullName}
            onMenuClick={() => setOpen((o) => !o)}
            notices={NOTICES}
            variant={variant}
            onVariant={chooseVariant}
            onChangePassword={() => setPwOpen(true)}
            onLogout={logout}
          />
          <main className="min-h-[calc(100vh-8rem)] px-4 py-6 md:px-6 lg:px-8">
            <Outlet />
          </main>
          <AppFooter />
        </div>
      </div>

      <ChangePasswordModal isOpen={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
};

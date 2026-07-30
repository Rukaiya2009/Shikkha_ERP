/**
 * Sidebar variants.
 *
 * Three layouts over the SAME navigation data, so the choice is purely visual —
 * switch with the picker in the header (or set SIDEBAR_DEFAULT) and nothing
 * else in the app changes.
 *
 *   A · Grouped   — captioned collapsible groups. Best for the platform console,
 *                   which has 31 screens across 8 groups.
 *   B · Profile   — account card on top, one flat scrolling list (EduDash style).
 *                   Best for school-side roles with shorter menus.
 *   C · Compact   — 72px icon rail that expands on hover. Maximum canvas.
 *
 * All three: navy #08192C → #0B1B2E rail, rounded pills, teal active state.
 */
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, GraduationCap, Radio, PanelLeftClose } from 'lucide-react';
import { navForRole, groupForPath, RAIL_CAPTION, ROLE_LABEL, NavLeaf } from './navConfig';

export type SidebarVariant = 'grouped' | 'profile' | 'compact';
export const SIDEBAR_DEFAULT: SidebarVariant = 'grouped';

export interface RailProps {
  role: string;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
  counts: Record<string, number>;
  onCollapse?: () => void;
}

/* ── shared bits ─────────────────────────────────────────────────────── */

const Brand: React.FC<{ role: string; onCollapse?: () => void }> = ({ role, onCollapse }) => (
  <div className="flex items-center gap-3 border-b border-rail-line px-5 py-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal-gradient">
      <GraduationCap className="h-[18px] w-[18px] text-[#04222B]" />
    </div>
    <div className="min-w-0 flex-1 leading-tight">
      <div className="font-display text-[15px] font-bold tracking-tight text-white">ShikkhaERP</div>
      <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
        {RAIL_CAPTION[role] || 'Portal'}
      </div>
    </div>
    {onCollapse && (
      <button
        onClick={onCollapse}
        aria-label="Collapse sidebar"
        className="hidden rounded-lg p-1.5 text-rail-dim transition-colors hover:bg-white/10 hover:text-white lg:block"
      >
        <PanelLeftClose className="h-4 w-4" />
      </button>
    )}
  </div>
);

const ProfileCard: React.FC<{ name?: string; role: string }> = ({ name, role }) => {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-rail-line bg-rail-soft/60 px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/20 font-display text-xs font-bold text-signal">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-white">{name || 'Signed in'}</p>
        <p className="truncate text-[11px] text-rail-dim">{ROLE_LABEL[role] || role}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-rail-dim" />
    </div>
  );
};

const RailFooter: React.FC<{ note: string }> = ({ note }) => (
  <div className="border-t border-rail-line px-5 py-3.5">
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-rail-dim">
        <Radio className="h-3 w-3 animate-pulse text-signal" />
        {note}
      </span>
      <span className="font-mono text-[10px] text-rail-dim/70">v3.1.0</span>
    </div>
  </div>
);

const Badge: React.FC<{ n: number; hot?: boolean }> = ({ n, hot }) =>
  n > 0 ? (
    <span
      className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
        hot ? 'bg-signal text-[#04222B]' : 'bg-white/12 text-white'
      }`}
    >
      {n}
    </span>
  ) : null;

const itemClasses = (isActive: boolean) =>
  `group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-all
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50
   ${isActive
     ? 'bg-signal/15 font-semibold text-white'
     : 'font-medium text-rail-text hover:bg-white/[0.07] hover:text-white'}`;

const Shell: React.FC<{ isOpen: boolean; onClose: () => void; width: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  width,
  children,
}) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />
    )}
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex ${width} flex-col bg-rail-fade transition-transform duration-300 ease-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {children}
    </aside>
  </>
);

/* ── A · Grouped ─────────────────────────────────────────────────────── */

export const SidebarGrouped: React.FC<RailProps> = ({ role, isOpen, onClose, counts, onCollapse }) => {
  const groups = navForRole(role);
  const { pathname } = useLocation();
  const [open, setOpen] = useState<string[]>(() => {
    const g = groupForPath(role, pathname);
    return g ? [groups[0].label, g] : [groups[0].label];
  });

  useEffect(() => {
    const g = groupForPath(role, pathname);
    if (g) setOpen((p) => (p.includes(g) ? p : [...p, g]));
  }, [pathname, role]);

  const toggle = (l: string) => setOpen((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));

  return (
    <Shell isOpen={isOpen} onClose={onClose} width="w-[264px]">
      <Brand role={role} onCollapse={onCollapse} />
      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
        {groups.map((group) => {
          const expanded = open.includes(group.label);
          const groupCount = group.items.reduce((s, i) => s + (i.badge ? counts[i.badge] || 0 : 0), 0);
          return (
            <div key={group.label} className="mb-0.5">
              <button
                onClick={() => toggle(group.label)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
              >
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-rail-dim">
                  {group.label}
                </span>
                <span className="flex items-center gap-1.5">
                  {!expanded && groupCount > 0 && (
                    <span className="rounded-full bg-signal px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#04222B]">
                      {groupCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-rail-dim transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
                  />
                </span>
              </button>
              {expanded && (
                <div className="mb-1 space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.path} to={item.path} end onClick={onClose} className={({ isActive }) => itemClasses(isActive)}>
                      {({ isActive }) => (
                        <>
                          <span
                            className={`absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-signal transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          />
                          <item.icon className={`h-[15px] w-[15px] shrink-0 ${isActive ? 'text-signal' : ''}`} />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          <Badge n={item.badge ? counts[item.badge] || 0 : 0} hot={item.badge === 'approvals'} />
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <RailFooter note={`${groups.reduce((n, g) => n + g.items.length, 0)} screens`} />
    </Shell>
  );
};

/* ── B · Profile ─────────────────────────────────────────────────────── */

export const SidebarProfile: React.FC<RailProps> = ({ role, userName, isOpen, onClose, counts, onCollapse }) => {
  const groups = navForRole(role);
  return (
    <Shell isOpen={isOpen} onClose={onClose} width="w-[256px]">
      <Brand role={role} onCollapse={onCollapse} />
      <ProfileCard name={userName} role={role} />
      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-3 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-rail-dim">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.path} to={item.path} end onClick={onClose} className={({ isActive }) => itemClasses(isActive)}>
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-[15px] w-[15px] shrink-0 ${isActive ? 'text-signal' : ''}`} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <Badge n={item.badge ? counts[item.badge] || 0 : 0} hot={item.badge === 'approvals'} />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <RailFooter note="All systems normal" />
    </Shell>
  );
};

/* ── C · Compact ─────────────────────────────────────────────────────── */

export const SidebarCompact: React.FC<RailProps> = ({ role, isOpen, onClose, counts }) => {
  const groups = navForRole(role);
  const [hovered, setHovered] = useState(false);
  const wide = hovered;

  return (
    <Shell isOpen={isOpen} onClose={onClose} width={wide ? 'w-[248px]' : 'w-[72px]'}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-full flex-col transition-all duration-200"
      >
        <div className="flex items-center gap-3 border-b border-rail-line px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal-gradient">
            <GraduationCap className="h-[18px] w-[18px] text-[#04222B]" />
          </div>
          {wide && (
            <div className="min-w-0 leading-tight">
              <div className="font-display text-[15px] font-bold text-white">ShikkhaERP</div>
              <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                {RAIL_CAPTION[role]}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3" aria-label="Main navigation">
          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              {wide ? (
                <p className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-rail-dim">
                  {group.label}
                </p>
              ) : (
                <div className="mx-2.5 mb-2 border-t border-rail-line" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const n = item.badge ? counts[item.badge] || 0 : 0;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      onClick={onClose}
                      title={wide ? undefined : item.label}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all
                         ${isActive ? 'bg-signal/15 font-semibold text-white' : 'font-medium text-rail-text hover:bg-white/[0.07] hover:text-white'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="relative shrink-0">
                            <item.icon className={`h-[17px] w-[17px] ${isActive ? 'text-signal' : ''}`} />
                            {!wide && n > 0 && (
                              <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-signal ring-2 ring-rail-deep" />
                            )}
                          </span>
                          {wide && (
                            <>
                              <span className="min-w-0 flex-1 truncate">{item.label}</span>
                              <Badge n={n} hot={item.badge === 'approvals'} />
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </Shell>
  );
};

export const SIDEBAR_VARIANTS: Record<SidebarVariant, { label: string; hint: string; width: number; Component: React.FC<RailProps> }> = {
  grouped: { label: 'Grouped', hint: 'Captioned collapsible groups — best for long menus', width: 264, Component: SidebarGrouped },
  profile: { label: 'Profile top', hint: 'Account card, one flat list — best for school roles', width: 256, Component: SidebarProfile },
  compact: { label: 'Compact icons', hint: 'Icon rail that expands on hover — most canvas', width: 72, Component: SidebarCompact },
};

/**
 * The one header, used by every role layout.
 *
 * Deliberately carries NO logo — the rail owns the brand, so it is never
 * printed twice (that was the duplicate-ShikkhaERP bug on the live build).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, Search, Bell, Maximize2, Minimize2, ChevronDown, KeyRound, User, LogOut,
  LayoutPanelLeft, Check, ChevronRight,
} from 'lucide-react';
import { leafForPath, groupForPath, ROLE_LABEL } from './navConfig';
import { SIDEBAR_VARIANTS, SidebarVariant } from './Sidebars';

export interface Notice {
  id: string;
  kind: 'message' | 'alert';
  title: string;
  body: string;
  at: string;
  unread: boolean;
}

interface Props {
  role: string;
  userName?: string;
  onMenuClick: () => void;
  notices: Notice[];
  variant: SidebarVariant;
  onVariant: (v: SidebarVariant) => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

/** Closes a popover on outside click or Escape. */
function useDismiss<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open, close]);
  return ref;
}

export const AppHeader: React.FC<Props> = ({
  role, userName, onMenuClick, notices, variant, onVariant, onChangePassword, onLogout,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [bell, setBell] = useState(false);
  const [tab, setTab] = useState<'all' | 'message' | 'alert'>('all');
  const [acct, setAcct] = useState(false);
  const [skin, setSkin] = useState(false);
  const [full, setFull] = useState(false);
  const [q, setQ] = useState('');

  const bellRef = useDismiss<HTMLDivElement>(bell, () => setBell(false));
  const acctRef = useDismiss<HTMLDivElement>(acct, () => setAcct(false));
  const skinRef = useDismiss<HTMLDivElement>(skin, () => setSkin(false));

  const leaf = leafForPath(role, pathname);
  const group = groupForPath(role, pathname);
  const unread = notices.filter((n) => n.unread).length;
  const shown = notices.filter((n) => (tab === 'all' ? true : n.kind === tab));

  const initials = (userName || '?')
    .trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const toggleFull = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setFull(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFull(false)).catch(() => {});
    }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    // Platform search targets tenants; school-side search targets people.
    navigate(role === 'super_admin' || role === 'developer' ? '/platform/schools' : `/${role.replace('_', '-')}/dashboard`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slatesoft transition-colors hover:bg-surfaceinset lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb — the section, then the page. */}
        <div className="hidden min-w-0 md:block">
          <nav className="flex items-center gap-1.5 text-xs text-slatesoft" aria-label="Breadcrumb">
            <span>{ROLE_LABEL[role] || 'App'}</span>
            {group && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>{group}</span>
              </>
            )}
          </nav>
          <p className="truncate font-display text-[15px] font-bold leading-tight text-ink">
            {leaf?.label || 'Dashboard'}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slatesoft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={role === 'super_admin' || role === 'developer' ? 'Search schools, users…' : 'Search…'}
              className="w-full rounded-xl border border-line bg-surfacefield py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slatesoft/70 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          {/* Sidebar picker — so a layout can be chosen without a rebuild. */}
          <div className="relative" ref={skinRef}>
            <button
              onClick={() => setSkin((o) => !o)}
              aria-label="Choose sidebar layout"
              aria-expanded={skin}
              className="rounded-lg p-2 text-slatesoft transition-colors hover:bg-surfaceinset"
            >
              <LayoutPanelLeft className="h-[18px] w-[18px]" />
            </button>
            {skin && (
              <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-card-hover">
                <p className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slatesoft">
                  Sidebar layout
                </p>
                {(Object.keys(SIDEBAR_VARIANTS) as SidebarVariant[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => { onVariant(k); setSkin(false); }}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surfaceinset"
                  >
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${variant === k ? 'text-signal' : 'text-transparent'}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{SIDEBAR_VARIANTS[k].label}</span>
                      <span className="block text-xs text-slatesoft">{SIDEBAR_VARIANTS[k].hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleFull}
            aria-label="Toggle fullscreen"
            className="hidden rounded-lg p-2 text-slatesoft transition-colors hover:bg-surfaceinset sm:block"
          >
            {full ? <Minimize2 className="h-[18px] w-[18px]" /> : <Maximize2 className="h-[18px] w-[18px]" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBell((o) => !o)}
              aria-label={`Notifications, ${unread} unread`}
              aria-expanded={bell}
              className="relative rounded-lg p-2 text-slatesoft transition-colors hover:bg-surfaceinset"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-alert px-1 font-mono text-[9px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>

            {bell && (
              <div className="absolute right-0 z-40 mt-2 w-[340px] overflow-hidden rounded-xl border border-line bg-white shadow-card-hover">
                <div className="flex items-center justify-between bg-brand-gradient px-4 py-3">
                  <p className="font-display text-sm font-bold text-white">Notifications</p>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
                    {unread} new
                  </span>
                </div>
                <div className="flex border-b border-line">
                  {([['all', 'All'], ['message', 'Messages'], ['alert', 'Alerts']] as const).map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setTab(k)}
                      className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${
                        tab === k ? 'border-signal text-brand' : 'border-transparent text-slatesoft hover:text-ink'
                      }`}
                    >
                      {l}
                      {k === 'all' && unread > 0 ? ` (${unread})` : ''}
                    </button>
                  ))}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {shown.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-slatesoft">Nothing here yet.</p>
                  ) : (
                    shown.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 border-b border-line px-4 py-3 last:border-0 ${n.unread ? 'bg-brand/[0.03]' : ''}`}
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.kind === 'alert' ? 'bg-alert' : 'bg-signal'}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">{n.title}</p>
                          <p className="mt-0.5 text-xs text-slatesoft">{n.body}</p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slatesoft/80">{n.at}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-line p-2">
                  <Link
                    to={role === 'super_admin' || role === 'developer' ? '/platform/announcements' : '#'}
                    onClick={() => setBell(false)}
                    className="block rounded-lg py-2 text-center text-xs font-bold text-brand hover:bg-surfaceinset"
                  >
                    View all
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative" ref={acctRef}>
            <button
              onClick={() => setAcct((o) => !o)}
              aria-label="Account menu"
              aria-expanded={acct}
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-surfaceinset"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-sky font-display text-xs font-bold text-brand">
                {initials}
              </div>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-[140px] truncate text-[13px] font-semibold text-ink">{userName}</span>
                <span className="block text-[11px] text-slatesoft">{ROLE_LABEL[role] || role}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-slatesoft" />
            </button>

            {acct && (
              <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-card-hover">
                <div className="border-b border-line px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-ink">{userName}</p>
                  <p className="text-xs text-slatesoft">{ROLE_LABEL[role] || role}</p>
                </div>
                <button className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surfaceinset">
                  <User className="h-4 w-4 text-slatesoft" /> My profile
                </button>
                <button
                  onClick={() => { setAcct(false); onChangePassword(); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surfaceinset"
                >
                  <KeyRound className="h-4 w-4 text-slatesoft" /> Change password
                </button>
                <div className="my-1 border-t border-line" />
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-[#B3261E] transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

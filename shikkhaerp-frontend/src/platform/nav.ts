/**
 * The console's navigation model — one source of truth for the sidebar, the
 * page title in the topbar, and the command palette.
 *
 * `minRole` encodes the agreed hierarchy: Super Admin is senior to Developer.
 * A Developer maintains the system; only a Super Admin touches money and
 * decides who else gets in.
 */
import {
  LayoutDashboard, LineChart, Building2, PlusCircle, Inbox, Trash2,
  Users, ShieldCheck, History, ScrollText, CreditCard, Receipt, Layers, TrendingUp,
  Megaphone, LifeBuoy, Mail, Settings, ToggleLeft, MessageSquare, Banknote, Lock,
  Activity, Timer, KeyRound, DatabaseZap, Terminal, BarChart3, PieChart, Table2,
} from 'lucide-react';

export type PlatformRole = 'super_admin' | 'developer';

export interface NavLeaf {
  label: string;
  path: string;
  icon: React.ElementType;
  /** Only Super Admins see this item when set. */
  superAdminOnly?: boolean;
  /** Key into the live badge counts supplied by the shell. */
  badge?: 'approvals' | 'tickets' | 'deletions' | 'expiring';
}

export interface NavGroup {
  label: string;
  items: NavLeaf[];
  superAdminOnly?: boolean;
}

export const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/platform/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', path: '/platform/analytics', icon: LineChart },
    ],
  },
  {
    label: 'Schools',
    items: [
      { label: 'All schools', path: '/platform/schools', icon: Building2 },
      { label: 'Add a school', path: '/platform/schools/new', icon: PlusCircle },
      { label: 'Demo requests', path: '/platform/approvals', icon: Inbox, badge: 'approvals' },
      { label: 'Deletion requests', path: '/platform/schools/deletions', icon: Trash2, badge: 'deletions' },
    ],
  },
  {
    label: 'People & access',
    items: [
      { label: 'All users', path: '/platform/users', icon: Users },
      { label: 'Platform team', path: '/platform/team', icon: ShieldCheck, superAdminOnly: true },
      { label: 'Roles & permissions', path: '/platform/roles', icon: Lock, superAdminOnly: true },
      { label: 'Login history', path: '/platform/login-history', icon: History },
      { label: 'Audit log', path: '/platform/audit-log', icon: ScrollText },
    ],
  },
  {
    label: 'Billing',
    superAdminOnly: true,
    items: [
      { label: 'Plans', path: '/platform/billing/plans', icon: Layers },
      { label: 'Subscriptions', path: '/platform/billing/subscriptions', icon: CreditCard },
      { label: 'Invoices', path: '/platform/billing/invoices', icon: Receipt },
      { label: 'Revenue', path: '/platform/billing/revenue', icon: TrendingUp },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Announcements', path: '/platform/announcements', icon: Megaphone },
      { label: 'Support tickets', path: '/platform/support', icon: LifeBuoy, badge: 'tickets' },
      { label: 'Email log', path: '/platform/email-log', icon: Mail },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'General', path: '/platform/settings/general', icon: Settings },
      { label: 'Feature flags', path: '/platform/settings/features', icon: ToggleLeft },
      { label: 'Email & SMTP', path: '/platform/settings/email', icon: Mail },
      { label: 'SMS gateway', path: '/platform/settings/sms', icon: MessageSquare },
      { label: 'Payment gateways', path: '/platform/settings/payments', icon: Banknote, superAdminOnly: true },
      { label: 'Security', path: '/platform/settings/security', icon: ShieldCheck },
    ],
  },
  {
    label: 'Developer tools',
    items: [
      { label: 'System health', path: '/platform/system/health', icon: Activity },
      { label: 'Background jobs', path: '/platform/system/jobs', icon: Timer },
      { label: 'API keys', path: '/platform/system/api-keys', icon: KeyRound },
      { label: 'Cache', path: '/platform/system/cache', icon: DatabaseZap },
      { label: 'Environment', path: '/platform/system/environment', icon: Terminal },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Platform growth', path: '/platform/reports/growth', icon: BarChart3 },
      { label: 'Feature usage', path: '/platform/reports/usage', icon: PieChart },
      { label: 'School performance', path: '/platform/reports/schools', icon: Building2 },
      { label: 'Saved reports', path: '/platform/reports/saved', icon: Table2 },
    ],
  },
];

/** Filters the tree down to what this role is allowed to see. */
export const navFor = (role: string): NavGroup[] => {
  const senior = role === 'super_admin';
  return NAV.filter((g) => senior || !g.superAdminOnly).map((g) => ({
    ...g,
    items: g.items.filter((i) => senior || !i.superAdminOnly),
  }));
};

/** Every leaf, flattened — used for the topbar title and the palette. */
export const allLeaves = (role: string): NavLeaf[] => navFor(role).flatMap((g) => g.items);

export const leafForPath = (role: string, pathname: string): NavLeaf | undefined => {
  const leaves = allLeaves(role);
  // Longest match wins so /platform/schools/new doesn't resolve to /platform/schools.
  return leaves
    .filter((l) => pathname === l.path || pathname.startsWith(l.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
};

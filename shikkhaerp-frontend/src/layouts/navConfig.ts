/**
 * Navigation, per role.
 *
 * One tree per role, consumed by all three sidebar variants and by the
 * breadcrumb in the header. Adding a page = adding a leaf here; the sidebar,
 * the breadcrumb and the placeholder page all pick it up automatically.
 *
 * `phase` is the delivery phase from the build plan. Any leaf whose phase is
 * still ahead of DELIVERED_THROUGH renders the "planned" page instead of a
 * dead link — so nothing in the rail is ever unclickable.
 */
import {
  LayoutDashboard, LineChart, Building2, PlusCircle, Inbox, Trash2, Users, ShieldCheck,
  History, ScrollText, CreditCard, Receipt, Layers, TrendingUp, Megaphone, LifeBuoy, Mail,
  Settings, ToggleLeft, MessageSquare, Banknote, Lock, Activity, Timer, KeyRound,
  DatabaseZap, Terminal, BarChart3, PieChart, Table2, GraduationCap, UserCog, CalendarCheck,
  BookOpen, Wallet, ClipboardList, Bus, Bed, Library, Award, Bell, FileText, User, Home,
} from 'lucide-react';

/** Phases 1..7 from the build plan. Bump this as phases land. */
export const DELIVERED_THROUGH = 1;

export type AppRole = 'super_admin' | 'developer' | 'school_admin' | 'teacher' | 'student' | 'parent';

export interface NavLeaf {
  label: string;
  path: string;
  icon: React.ElementType;
  /** Which build phase delivers the real screen. */
  phase?: number;
  /** What the finished page will do — shown on the placeholder. */
  blurb?: string;
  badge?: 'approvals' | 'tickets' | 'deletions' | 'unread';
}

export interface NavGroup {
  label: string;
  items: NavLeaf[];
}

/* ══════════════════ PLATFORM (super admin + developer) ══════════════════ */

const PLATFORM_BASE: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/platform/dashboard', icon: LayoutDashboard, phase: 1 },
      { label: 'Analytics', path: '/platform/analytics', icon: LineChart, phase: 1, blurb: 'Daily active users, growth over six months, module usage ranking and district spread.' },
    ],
  },
  {
    label: 'Schools',
    items: [
      { label: 'All schools', path: '/platform/schools', icon: Building2, phase: 2, blurb: 'Every tenant with code, subdomain, plan, trial runway and MRR. Suspend, restore and extend from the row.' },
      { label: 'Add a school', path: '/platform/schools/new', icon: PlusCircle, phase: 2, blurb: 'Three-step manual onboarding: school profile, admin account, plan and trial length.' },
      { label: 'Demo requests', path: '/platform/approvals', icon: Inbox, badge: 'approvals', phase: 2, blurb: 'The approval inbox. Full submission detail, approve with a school-admin email, decline with a reason.' },
      { label: 'Deletion requests', path: '/platform/schools/deletions', icon: Trash2, badge: 'deletions', phase: 2, blurb: 'Schools asking to leave. Forces a data export, then requires the school code to confirm.' },
    ],
  },
  {
    label: 'People & access',
    items: [
      { label: 'All users', path: '/platform/users', icon: Users, phase: 3, blurb: 'Every user across every school, with the full lifecycle: invite, edit, lock, unlock, delete, restore.' },
      { label: 'Platform team', path: '/platform/team', icon: ShieldCheck, phase: 3, blurb: 'The ITDataScience roster. Invite a Developer, promote, force a reset, require 2FA, revoke.' },
      { label: 'Roles & permissions', path: '/platform/roles', icon: Lock, phase: 3, blurb: 'Permission matrix across six modules — none, read, write or full per role.' },
      { label: 'Login history', path: '/platform/login-history', icon: History, phase: 3, blurb: 'Successful and failed sign-ins with IP, device and location. Repeat failures grouped and flagged.' },
      { label: 'Audit log', path: '/platform/audit-log', icon: ScrollText, phase: 3, blurb: 'Who changed what, when and from where. Filter by actor, action and severity, export as CSV.' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Announcements', path: '/platform/announcements', icon: Megaphone, phase: 4, blurb: 'Compose once, target by plan or role, send to email, in-app or both.' },
      { label: 'Support tickets', path: '/platform/support', icon: LifeBuoy, badge: 'tickets', phase: 4, blurb: 'The support queue with priority, school, thread view and assignment.' },
      { label: 'Email log', path: '/platform/email-log', icon: Mail, phase: 4, blurb: 'Every system email with template, provider, delivery status and opens. Resend a failure.' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'General', path: '/platform/settings/general', icon: Settings, phase: 5, blurb: 'Platform name, logo, support address, default language, timezone and date format.' },
      { label: 'Feature flags', path: '/platform/settings/features', icon: ToggleLeft, phase: 5, blurb: 'Transport, hostel, LMS, parent app, BANBEIS export and dropout insights — on or off, per plan or per school.' },
      { label: 'Email & SMTP', path: '/platform/settings/email', icon: Mail, phase: 5, blurb: 'ZeptoMail credentials, sender identity and the editable template behind each system email.' },
      { label: 'SMS gateway', path: '/platform/settings/sms', icon: MessageSquare, phase: 5, blurb: 'Provider, sender ID, credit balance, per-message cost and a test send.' },
      { label: 'Payment gateways', path: '/platform/settings/payments', icon: Banknote, phase: 5, blurb: 'bKash, Nagad and SSLCommerz keys with sandbox / live toggle and a connection test.' },
      { label: 'Security', path: '/platform/settings/security', icon: ShieldCheck, phase: 5, blurb: 'Password policy, lockout thresholds, session lifetime, 2FA enforcement and IP allow-list.' },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Plans', path: '/platform/billing/plans', icon: Layers, phase: 6, blurb: 'Four tiers with pricing, per-student rate, feature list and how many schools sit on each.' },
      { label: 'Subscriptions', path: '/platform/billing/subscriptions', icon: CreditCard, phase: 6, blurb: 'Every school with plan, renewal date and payment state. Change tier or extend.' },
      { label: 'Invoices', path: '/platform/billing/invoices', icon: Receipt, phase: 6, blurb: 'Issue, send and record offline bKash or Nagad payments. Chase overdue accounts.' },
      { label: 'Revenue', path: '/platform/billing/revenue', icon: TrendingUp, phase: 6, blurb: 'MRR trend, new versus churned, revenue by plan and by district, collection rate.' },
    ],
  },
  {
    label: 'Developer tools',
    items: [
      { label: 'System health', path: '/platform/system/health', icon: Activity, phase: 7, blurb: 'Six services with status, latency and notes, plus a 24-hour p50/p95 latency chart.' },
      { label: 'Background jobs', path: '/platform/system/jobs', icon: Timer, phase: 7, blurb: 'Scheduled jobs with last run, duration, queue depth and failures. Run now or pause.' },
      { label: 'API keys', path: '/platform/system/api-keys', icon: KeyRound, phase: 7, blurb: 'Issue a scoped key, see prefix and last use, revoke. Full key shown once.' },
      { label: 'Cache', path: '/platform/system/cache', icon: DatabaseZap, phase: 7, blurb: 'Cache regions with key count, size and hit rate. Clear one or clear all.' },
      { label: 'Environment', path: '/platform/system/environment', icon: Terminal, phase: 7, blurb: 'Version, commit, region, uptime, ddl-auto mode, masked env vars and maintenance mode.' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Platform growth', path: '/platform/reports/growth', icon: BarChart3, phase: 7, blurb: 'Schools, students and users over six months with net-new per month.' },
      { label: 'Feature usage', path: '/platform/reports/usage', icon: PieChart, phase: 7, blurb: 'Which modules are actually used, ranked by sessions, plus daily active users.' },
      { label: 'School performance', path: '/platform/reports/schools', icon: Building2, phase: 7, blurb: 'Tenants ranked by engagement — who is thriving and who is going quiet.' },
      { label: 'Saved reports', path: '/platform/reports/saved', icon: Table2, phase: 7, blurb: 'Named queries with owner, schedule and last run. Run now or export CSV.' },
    ],
  },
];

/** Screens a Developer must not see: money, and granting access to others. */
const DEVELOPER_BLOCKED = new Set([
  '/platform/billing/plans',
  '/platform/billing/subscriptions',
  '/platform/billing/invoices',
  '/platform/billing/revenue',
  '/platform/team',
  '/platform/roles',
  '/platform/settings/payments',
]);

/* ══════════════════════════ SCHOOL ADMIN ══════════════════════════ */

const SCHOOL_ADMIN_NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/school-admin/dashboard', icon: LayoutDashboard, phase: 1 },
      { label: 'Notice board', path: '/school-admin/notices', icon: Bell, phase: 4, blurb: 'Publish notices to staff, students and guardians.' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Students', path: '/school-admin/students', icon: GraduationCap, phase: 3, blurb: 'Enrol, edit, suspend and browse every student with guardian and medical detail.' },
      { label: 'Teachers', path: '/school-admin/teachers', icon: UserCog, phase: 3, blurb: 'Staff records, subject allocation and class assignment.' },
      { label: 'Guardians', path: '/school-admin/guardians', icon: Users, phase: 3, blurb: 'Parent and guardian records linked to their children.' },
      { label: 'All users', path: '/school-admin/users', icon: Users, phase: 3, blurb: 'Everyone with a login in this school, and their access level.' },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Classes & sections', path: '/school-admin/classes', icon: BookOpen, phase: 3, blurb: 'Class list, sections, capacity and class teacher.' },
      { label: 'Attendance', path: '/school-admin/attendance', icon: CalendarCheck, phase: 3, blurb: 'Daily attendance by class with monthly summary and defaulter list.' },
      { label: 'Examinations', path: '/school-admin/exams', icon: ClipboardList, phase: 3, blurb: 'Exam schedule, question papers, marks entry and result publishing.' },
      { label: 'Results', path: '/school-admin/results', icon: Award, phase: 3, blurb: 'Grade sheets, GPA calculation and printable transcripts.' },
      { label: 'Library', path: '/school-admin/library', icon: Library, phase: 7, blurb: 'Book records, issue and return, fine collection.' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Fees collection', path: '/school-admin/fees', icon: Wallet, phase: 6, blurb: 'Fee heads, invoices per student, collection and due tracking.' },
      { label: 'Accounts', path: '/school-admin/accounts', icon: Receipt, phase: 6, blurb: 'Income, expense and ledger for the school.' },
      { label: 'Subscription', path: '/school-admin/subscription', icon: CreditCard, phase: 6, blurb: 'Your ShikkhaERP plan, renewal date and invoices.' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Transport', path: '/school-admin/transport', icon: Bus, phase: 7, blurb: 'Bus routes, stoppages and pickup tracking.' },
      { label: 'Hostel', path: '/school-admin/hostel', icon: Bed, phase: 7, blurb: 'Room allocation, warden roster and hostel fees.' },
      { label: 'Certificates', path: '/school-admin/certificates', icon: FileText, phase: 7, blurb: 'Generate testimonials, transfer and character certificates.' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'School profile', path: '/school-admin/settings/profile', icon: Building2, phase: 5, blurb: 'Name, address, contact, established year and head teacher.' },
      { label: 'Branding', path: '/school-admin/settings/branding', icon: ToggleLeft, phase: 5, blurb: 'Logo, colours and the header on printed documents.' },
      { label: 'Roles & access', path: '/school-admin/settings/roles', icon: Lock, phase: 3, blurb: 'Who can see and change what inside this school.' },
      { label: 'Preferences', path: '/school-admin/settings/preferences', icon: Settings, phase: 5, blurb: 'Academic year, week start, grading scale and notification defaults.' },
    ],
  },
];

/* ══════════════════════════ TEACHER ══════════════════════════ */

const TEACHER_NAV: NavGroup[] = [
  {
    label: 'Teaching',
    items: [
      { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, phase: 1 },
      { label: 'My classes', path: '/teacher/classes', icon: BookOpen, phase: 3, blurb: 'The classes and sections assigned to you, with today’s timetable.' },
      { label: 'Attendance', path: '/teacher/attendance', icon: CalendarCheck, phase: 3, blurb: 'Mark attendance for your classes and review the month.' },
      { label: 'Gradebook', path: '/teacher/gradebook', icon: Award, phase: 3, blurb: 'Enter and moderate marks for your subjects.' },
      { label: 'Lesson plans', path: '/teacher/lessons', icon: ClipboardList, phase: 7, blurb: 'Upload lesson material and homework for your students.' },
    ],
  },
  {
    label: 'Me',
    items: [
      { label: 'Notices', path: '/teacher/notices', icon: Bell, phase: 4, blurb: 'Announcements from the school and the platform.' },
      { label: 'My profile', path: '/teacher/profile', icon: User, phase: 3, blurb: 'Your details, subjects and contact information.' },
    ],
  },
];

/* ══════════════════════════ STUDENT ══════════════════════════ */

const STUDENT_NAV: NavGroup[] = [
  {
    label: 'My school',
    items: [
      { label: 'Dashboard', path: '/student/dashboard', icon: Home, phase: 1 },
      { label: 'Timetable', path: '/student/timetable', icon: CalendarCheck, phase: 3, blurb: 'Your weekly class schedule.' },
      { label: 'Attendance', path: '/student/attendance', icon: ClipboardList, phase: 3, blurb: 'Your attendance record and monthly percentage.' },
      { label: 'Results', path: '/student/results', icon: Award, phase: 3, blurb: 'Exam marks, grades and GPA.' },
      { label: 'Library', path: '/student/library', icon: Library, phase: 7, blurb: 'Books you have issued and what is due back.' },
    ],
  },
  {
    label: 'Me',
    items: [
      { label: 'Notices', path: '/student/notices', icon: Bell, phase: 4, blurb: 'Announcements from your school.' },
      { label: 'My profile', path: '/student/profile', icon: User, phase: 3, blurb: 'Your details, class, section and roll number.' },
    ],
  },
];

/* ══════════════════════════ PARENT ══════════════════════════ */

const PARENT_NAV: NavGroup[] = [
  {
    label: 'My children',
    items: [
      { label: 'Dashboard', path: '/parent/dashboard', icon: Home, phase: 1 },
      { label: 'Children', path: '/parent/children', icon: GraduationCap, phase: 3, blurb: 'Each child you are linked to, with a summary card.' },
      { label: 'Attendance', path: '/parent/attendance', icon: CalendarCheck, phase: 3, blurb: 'Attendance for each child, month by month.' },
      { label: 'Results', path: '/parent/results', icon: Award, phase: 3, blurb: 'Exam marks and grade sheets for each child.' },
      { label: 'Fees', path: '/parent/fees', icon: Wallet, phase: 6, blurb: 'What is due, what is paid, and how to pay by bKash or Nagad.' },
    ],
  },
  {
    label: 'Me',
    items: [
      { label: 'Notices', path: '/parent/notices', icon: Bell, phase: 4, blurb: 'Announcements from the school.' },
      { label: 'My profile', path: '/parent/profile', icon: User, phase: 3, blurb: 'Your contact details and linked children.' },
    ],
  },
];

/* ══════════════════════════ resolution ══════════════════════════ */

export const navForRole = (role: string): NavGroup[] => {
  switch (role) {
    case 'super_admin':
      return PLATFORM_BASE;
    case 'developer':
      return PLATFORM_BASE.map((g) => ({
        ...g,
        items: g.items.filter((i) => !DEVELOPER_BLOCKED.has(i.path)),
      })).filter((g) => g.items.length > 0);
    case 'school_admin':
      return SCHOOL_ADMIN_NAV;
    case 'teacher':
      return TEACHER_NAV;
    case 'student':
      return STUDENT_NAV;
    case 'parent':
      return PARENT_NAV;
    default:
      return STUDENT_NAV;
  }
};

/** How the rail titles itself, per role. */
export const RAIL_CAPTION: Record<string, string> = {
  super_admin: 'Platform console',
  developer: 'Developer console',
  school_admin: 'School administration',
  teacher: 'Teacher portal',
  student: 'Student portal',
  parent: 'Guardian portal',
};

export const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  developer: 'Developer',
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export const allLeaves = (role: string): NavLeaf[] => navForRole(role).flatMap((g) => g.items);

/** Longest-prefix match so /schools/new doesn't resolve to /schools. */
export const leafForPath = (role: string, pathname: string): NavLeaf | undefined =>
  allLeaves(role)
    .filter((l) => pathname === l.path || pathname.startsWith(l.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];

export const groupForPath = (role: string, pathname: string): string | undefined =>
  navForRole(role).find((g) => g.items.some((i) => pathname === i.path || pathname.startsWith(i.path + '/')))?.label;

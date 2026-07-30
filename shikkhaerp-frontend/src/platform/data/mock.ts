/**
 * Demo data for the platform console.
 *
 * Everything here is clearly fake and lives in ONE file on purpose: when a real
 * endpoint lands, you delete the export and swap the page's import for a
 * service call. Nothing else has to change.
 *
 * See API_REQUIREMENTS.md for the endpoints each of these stands in for.
 */

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

/* ─────────────────────────── tenants (schools) ─────────────────────────── */

export interface MockSchool {
  id: string;
  name: string;
  code: string;
  subdomain: string;
  district: string;
  plan: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'PENDING';
  students: number;
  teachers: number;
  trialEnd: string | null;
  mrr: number;
  admin: string;
  adminEmail: string;
  createdAt: string;
  lastActive: string;
  storageMb: number;
}

export const schools: MockSchool[] = [
  { id: 's-1041', name: 'Hammadia Model High School', code: 'HMH-1041', subdomain: 'hammadia', district: 'Dhaka', plan: 'PREMIUM', status: 'ACTIVE', students: 1284, teachers: 62, trialEnd: null, mrr: 18500, admin: 'Reduanul Hasan', adminEmail: 'mdreduanulhasan@gmail.com', createdAt: daysAgo(412), lastActive: hoursAgo(2), storageMb: 4820 },
  { id: 's-1042', name: 'Willes Little Flower School', code: 'WLF-1042', subdomain: 'willeslittleflower', district: 'Dhaka', plan: 'ENTERPRISE', status: 'ACTIVE', students: 2640, teachers: 118, trialEnd: null, mrr: 42000, admin: 'Ayat Rahman', adminEmail: 'humayrabinteshafique2008@gmail.com', createdAt: daysAgo(388), lastActive: hoursAgo(1), storageMb: 11240 },
  { id: 's-1043', name: 'Havashpur Girls College', code: 'HGC-1043', subdomain: 'havashpur', district: 'Faridpur', plan: 'BASIC', status: 'ACTIVE', students: 742, teachers: 34, trialEnd: null, mrr: 8200, admin: 'Md Shafique', adminEmail: 'shafiquehassan68@gmail.com', createdAt: daysAgo(265), lastActive: hoursAgo(9), storageMb: 1960 },
  { id: 's-1044', name: 'Rajshahi Cadet Academy', code: 'RCA-1044', subdomain: 'rajshahicadet', district: 'Rajshahi', plan: 'TRIAL', status: 'TRIAL', students: 318, teachers: 21, trialEnd: inDays(4), mrr: 0, admin: 'Nusrat Jahan', adminEmail: 'farhana88hoqueds@gmail.com', createdAt: daysAgo(26), lastActive: hoursAgo(5), storageMb: 380 },
  { id: 's-1045', name: 'Chattogram Ideal School', code: 'CIS-1045', subdomain: 'ctgideal', district: 'Chattogram', plan: 'TRIAL', status: 'TRIAL', students: 196, teachers: 14, trialEnd: inDays(17), mrr: 0, admin: 'Sajid Hasan', adminEmail: 'sajid.hasan@ctgideal.edu.bd', createdAt: daysAgo(13), lastActive: hoursAgo(21), storageMb: 210 },
  { id: 's-1046', name: 'Sylhet Green Valley College', code: 'SGV-1046', subdomain: 'sylhetgreenvalley', district: 'Sylhet', plan: 'BASIC', status: 'ACTIVE', students: 604, teachers: 29, trialEnd: null, mrr: 8200, admin: 'Nadia Akter', adminEmail: 'nadia.akter@sgv.edu.bd', createdAt: daysAgo(198), lastActive: hoursAgo(31), storageMb: 1420 },
  { id: 's-1047', name: 'Khulna Public School', code: 'KPS-1047', subdomain: 'khulnapublic', district: 'Khulna', plan: 'TRIAL', status: 'TRIAL', students: 88, teachers: 9, trialEnd: inDays(1), mrr: 0, admin: 'Tanvir Ahmed', adminEmail: 'tanvir@kps.edu.bd', createdAt: daysAgo(29), lastActive: daysAgo(6) },
  { id: 's-1048', name: 'Barishal Collegiate School', code: 'BCS-1048', subdomain: 'barishalcollegiate', district: 'Barishal', plan: 'BASIC', status: 'SUSPENDED', students: 431, teachers: 22, trialEnd: null, mrr: 0, admin: 'Farhana Hoque', adminEmail: 'farhanahoque251@gmail.com', createdAt: daysAgo(310), lastActive: daysAgo(48), storageMb: 990 },
  { id: 's-1049', name: 'Mymensingh Science Institute', code: 'MSI-1049', subdomain: 'mymensinghscience', district: 'Mymensingh', plan: 'PREMIUM', status: 'ACTIVE', students: 1102, teachers: 55, trialEnd: null, mrr: 18500, admin: 'Rukaiya Binte Shafique', adminEmail: 'rukaiyabinteshafique2009@gmail.com', createdAt: daysAgo(174), lastActive: hoursAgo(4), storageMb: 3610 },
  { id: 's-1050', name: 'Rangpur Modern Academy', code: 'RMA-1050', subdomain: 'rangpurmodern', district: 'Rangpur', plan: 'TRIAL', status: 'TRIAL', students: 142, teachers: 11, trialEnd: inDays(23), mrr: 0, admin: 'Hasan Tasdeed', adminEmail: 'ispanesecom.224@gmail.com', createdAt: daysAgo(7), lastActive: hoursAgo(14), storageMb: 96 },
].map((s) => ({ storageMb: 0, ...s })) as MockSchool[];

/* ─────────────────────── demo requests awaiting review ─────────────────── */

export interface MockDemoRequest {
  uuid: string;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  requesterName: string;
  requesterRole: string;
  requesterPhone: string;
  studentCount: string;
  submittedAt: string;
  expiresAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const demoRequests: MockDemoRequest[] = [
  { uuid: '8f14e45f-ceea-467a-9c1d-3a4e5b6c7d81', schoolName: 'Comilla Victoria School', schoolAddress: 'Kandirpar, Cumilla 3500', schoolPhone: '+880 1711 204488', schoolEmail: 'office@victoriaschool.edu.bd', requesterName: 'Imran Kabir', requesterRole: 'Head Teacher', requesterPhone: '+880 1711 204488', studentCount: '500–1000', submittedAt: hoursAgo(3), expiresAt: inDays(7), status: 'PENDING' },
  { uuid: 'c9f0f895-fb98-4b4c-8a2e-1f2a3b4c5d92', schoolName: 'Bogura Zilla Model School', schoolAddress: 'Sherpur Road, Bogura 5800', schoolPhone: '+880 1819 663311', schoolEmail: 'info@bzms.edu.bd', requesterName: 'Shirin Sultana', requesterRole: 'Administrator', requesterPhone: '+880 1819 663311', studentCount: '1000–2000', submittedAt: hoursAgo(11), expiresAt: inDays(6), status: 'PENDING' },
  { uuid: '45c48cce-2e2d-4fbd-aa1f-9d3c1e0b7a53', schoolName: 'Narayanganj Preparatory', schoolAddress: 'Chashara, Narayanganj 1400', schoolPhone: '+880 1712 889900', schoolEmail: 'contact@nprep.edu.bd', requesterName: 'Ahsan Habib', requesterRole: 'Principal', requesterPhone: '+880 1712 889900', studentCount: '200–500', submittedAt: daysAgo(1), expiresAt: inDays(6), status: 'PENDING' },
  { uuid: 'd3d94468-02a4-4e1b-9a3f-5c6d7e8f9a04', schoolName: 'Jashore Cantonment College', schoolAddress: 'Jashore Cantonment 7400', schoolPhone: '+880 1913 445566', schoolEmail: 'admin@jcc.edu.bd', requesterName: 'Kamrul Islam', requesterRole: 'Vice Principal', requesterPhone: '+880 1913 445566', studentCount: '2000+', submittedAt: daysAgo(2), expiresAt: inDays(5), status: 'PENDING' },
];

/* ──────────────────────── platform team (ITDataScience) ─────────────────── */

export interface MockStaff {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'DEVELOPER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
  lastLogin: string | null;
  mfa: boolean;
}

export const platformTeam: MockStaff[] = [
  { id: 'p-1', name: 'System Administrator', email: 'hasanhabib2009@gmail.com', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: hoursAgo(1), mfa: true },
  { id: 'p-2', name: 'Rukaiya Binte Shafique', email: 'rukaiyabinteshafique2009@gmail.com', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: hoursAgo(4), mfa: true },
  { id: 'p-3', name: 'Hasan Tasdeed', email: 'ispanesecom.224@gmail.com', role: 'DEVELOPER', status: 'ACTIVE', lastLogin: hoursAgo(7), mfa: false },
  { id: 'p-4', name: 'Reduanul Hasan', email: 'mdreduanulhasan@gmail.com', role: 'DEVELOPER', status: 'INACTIVE', lastLogin: daysAgo(22), mfa: false },
  { id: 'p-5', name: 'Ayat Rahman', email: 'humayrabinteshafique2008@gmail.com', role: 'DEVELOPER', status: 'PENDING_VERIFICATION', lastLogin: null, mfa: false },
];

/* ───────────────────────────── roles & permissions ─────────────────────── */

export const MODULES = ['Schools', 'Users', 'Billing', 'Announcements', 'Settings', 'Developer tools'] as const;
export type Perm = 'none' | 'read' | 'write' | 'full';

export interface MockRole {
  key: string;
  name: string;
  scope: 'Platform' | 'School';
  members: number;
  builtIn: boolean;
  description: string;
  perms: Record<string, Perm>;
}

export const roles: MockRole[] = [
  { key: 'SUPER_ADMIN', name: 'Super Admin', scope: 'Platform', members: 2, builtIn: true, description: 'Owns the platform. Can manage developer accounts and billing.', perms: { Schools: 'full', Users: 'full', Billing: 'full', Announcements: 'full', Settings: 'full', 'Developer tools': 'full' } },
  { key: 'DEVELOPER', name: 'Developer', scope: 'Platform', members: 3, builtIn: true, description: 'Maintains the system. No billing or platform-team access.', perms: { Schools: 'write', Users: 'read', Billing: 'none', Announcements: 'write', Settings: 'write', 'Developer tools': 'full' } },
  { key: 'SCHOOL_ADMIN', name: 'School Admin', scope: 'School', members: 10, builtIn: true, description: "Top administrator inside a single school's tenant.", perms: { Schools: 'read', Users: 'write', Billing: 'read', Announcements: 'read', Settings: 'write', 'Developer tools': 'none' } },
  { key: 'SUPPORT_AGENT', name: 'Support Agent', scope: 'Platform', members: 0, builtIn: false, description: 'Reads tenant data to answer tickets. Cannot change anything.', perms: { Schools: 'read', Users: 'read', Billing: 'read', Announcements: 'read', Settings: 'none', 'Developer tools': 'none' } },
];

/* ──────────────────────────────── audit trail ──────────────────────────── */

export interface MockAudit {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  at: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

export const auditLogs: MockAudit[] = [
  { id: 'a-901', actor: 'hasanhabib2009@gmail.com', action: 'SCHOOL_APPROVED', target: 'Rangpur Modern Academy (RMA-1050)', ip: '103.108.144.21', at: hoursAgo(2), severity: 'INFO' },
  { id: 'a-900', actor: 'ispanesecom.224@gmail.com', action: 'FEATURE_FLAG_ENABLED', target: 'transport_module → Willes Little Flower', ip: '103.108.144.44', at: hoursAgo(5), severity: 'INFO' },
  { id: 'a-899', actor: 'hasanhabib2009@gmail.com', action: 'SCHOOL_SUSPENDED', target: 'Barishal Collegiate School (BCS-1048)', ip: '103.108.144.21', at: daysAgo(2), severity: 'WARN' },
  { id: 'a-898', actor: 'rukaiyabinteshafique2009@gmail.com', action: 'ROLE_PERMISSION_CHANGED', target: 'DEVELOPER → Billing: none', ip: '116.68.200.9', at: daysAgo(3), severity: 'CRITICAL' },
  { id: 'a-897', actor: 'system', action: 'TRIAL_EXPIRY_REMINDER_SENT', target: '3 schools', ip: '—', at: daysAgo(3), severity: 'INFO' },
  { id: 'a-896', actor: 'ispanesecom.224@gmail.com', action: 'API_KEY_REVOKED', target: 'sk_live_…f31a (Result import)', ip: '103.108.144.44', at: daysAgo(5), severity: 'WARN' },
  { id: 'a-895', actor: 'hasanhabib2009@gmail.com', action: 'PLAN_CHANGED', target: 'Havashpur Girls College → BASIC', ip: '103.108.144.21', at: daysAgo(6), severity: 'INFO' },
  { id: 'a-894', actor: 'rukaiyabinteshafique2009@gmail.com', action: 'USER_DELETED', target: 'demo.teacher@kps.edu.bd', ip: '116.68.200.9', at: daysAgo(8), severity: 'WARN' },
];

export interface MockLogin {
  id: string;
  email: string;
  role: string;
  ip: string;
  device: string;
  location: string;
  at: string;
  result: 'SUCCESS' | 'FAILED';
}

export const loginHistory: MockLogin[] = [
  { id: 'l-1', email: 'hasanhabib2009@gmail.com', role: 'SUPER_ADMIN', ip: '103.108.144.21', device: 'Chrome 141 · Windows', location: 'Dhaka, BD', at: hoursAgo(1), result: 'SUCCESS' },
  { id: 'l-2', email: 'mdreduanulhasan@gmail.com', role: 'SCHOOL_ADMIN', ip: '58.145.188.4', device: 'Safari · iPhone', location: 'Dhaka, BD', at: hoursAgo(3), result: 'SUCCESS' },
  { id: 'l-3', email: 'unknown@attacker.ru', role: '—', ip: '45.9.148.112', device: 'curl/8.4', location: 'Moscow, RU', at: hoursAgo(6), result: 'FAILED' },
  { id: 'l-4', email: 'unknown@attacker.ru', role: '—', ip: '45.9.148.112', device: 'curl/8.4', location: 'Moscow, RU', at: hoursAgo(6), result: 'FAILED' },
  { id: 'l-5', email: 'ispanesecom.224@gmail.com', role: 'DEVELOPER', ip: '103.108.144.44', device: 'Firefox 135 · Ubuntu', location: 'Dhaka, BD', at: hoursAgo(7), result: 'SUCCESS' },
  { id: 'l-6', email: 'sajid.hasan@ctgideal.edu.bd', role: 'SCHOOL_ADMIN', ip: '119.30.38.77', device: 'Chrome · Android', location: 'Chattogram, BD', at: hoursAgo(21), result: 'SUCCESS' },
  { id: 'l-7', email: 'farhanahoque251@gmail.com', role: 'SCHOOL_ADMIN', ip: '103.230.105.2', device: 'Edge 141 · Windows', location: 'Barishal, BD', at: daysAgo(2), result: 'FAILED' },
];

/* ───────────────────────────────── email log ──────────────────────────── */

export interface MockEmail {
  id: string;
  subject: string;
  to: string;
  template: string;
  status: 'DELIVERED' | 'BOUNCED' | 'QUEUED' | 'FAILED';
  provider: string;
  at: string;
  opens: number;
}

export const emailLogs: MockEmail[] = [
  { id: 'e-5501', subject: 'Set up your ShikkhaERP super admin login', to: 'hasan.tasdeed@rangpurmodern.edu.bd', template: 'school_admin_setup', status: 'DELIVERED', provider: 'ZeptoMail', at: hoursAgo(2), opens: 3 },
  { id: 'e-5500', subject: 'New demo request: Comilla Victoria School', to: 'developer@shikkhaerp.com', template: 'demo_admin_notify', status: 'DELIVERED', provider: 'ZeptoMail', at: hoursAgo(3), opens: 1 },
  { id: 'e-5499', subject: 'Your trial ends in 1 day', to: 'tanvir@kps.edu.bd', template: 'trial_expiry', status: 'DELIVERED', provider: 'ZeptoMail', at: hoursAgo(8), opens: 0 },
  { id: 'e-5498', subject: 'Your trial ends in 4 days', to: 'farhana88hoqueds@gmail.com', template: 'trial_expiry', status: 'DELIVERED', provider: 'ZeptoMail', at: hoursAgo(9), opens: 2 },
  { id: 'e-5497', subject: 'Password reset request', to: 'teacher@bzms.edu.bd', template: 'password_reset', status: 'BOUNCED', provider: 'ZeptoMail', at: hoursAgo(14), opens: 0 },
  { id: 'e-5496', subject: 'Invoice INV-2026-0184 is ready', to: 'accounts@willeslittleflower.edu.bd', template: 'invoice_ready', status: 'DELIVERED', provider: 'ZeptoMail', at: daysAgo(1), opens: 4 },
  { id: 'e-5495', subject: 'Demo request declined', to: 'contact@nprep.edu.bd', template: 'demo_rejected', status: 'QUEUED', provider: 'ZeptoMail', at: daysAgo(1), opens: 0 },
  { id: 'e-5494', subject: 'Monthly usage summary — July', to: 'office@victoriaschool.edu.bd', template: 'usage_summary', status: 'FAILED', provider: 'ZeptoMail', at: daysAgo(2), opens: 0 },
];

/* ────────────────────────────── billing ───────────────────────────────── */

export interface MockPlan {
  key: string;
  name: string;
  price: number;
  perStudent: number;
  schools: number;
  features: string[];
  highlight?: boolean;
}

export const plans: MockPlan[] = [
  { key: 'TRIAL', name: 'Free trial', price: 0, perStudent: 0, schools: 4, features: ['30 days', 'Up to 300 students', 'Core modules', 'Email support'] },
  { key: 'BASIC', name: 'Basic', price: 8200, perStudent: 12, schools: 2, features: ['Unlimited students', 'Attendance + exams', 'SMS add-on', 'Email support'] },
  { key: 'PREMIUM', name: 'Premium', price: 18500, perStudent: 18, schools: 2, features: ['Everything in Basic', 'Finance + payroll', 'Parent app', 'Priority support'], highlight: true },
  { key: 'ENTERPRISE', name: 'Enterprise', price: 42000, perStudent: 24, schools: 1, features: ['Everything in Premium', 'Own domain + branding', 'BANBEIS reporting', 'Dedicated manager'] },
];

export interface MockInvoice {
  id: string;
  school: string;
  amount: number;
  issued: string;
  due: string;
  status: 'PAID' | 'DUE' | 'OVERDUE' | 'DRAFT';
  method: string;
}

export const invoices: MockInvoice[] = [
  { id: 'INV-2026-0187', school: 'Willes Little Flower School', amount: 42000, issued: daysAgo(3), due: inDays(11), status: 'DUE', method: 'bKash' },
  { id: 'INV-2026-0186', school: 'Mymensingh Science Institute', amount: 18500, issued: daysAgo(4), due: inDays(10), status: 'DUE', method: 'SSLCommerz' },
  { id: 'INV-2026-0185', school: 'Hammadia Model High School', amount: 18500, issued: daysAgo(29), due: daysAgo(1), status: 'OVERDUE', method: 'Bank transfer' },
  { id: 'INV-2026-0184', school: 'Havashpur Girls College', amount: 8200, issued: daysAgo(31), due: daysAgo(3), status: 'PAID', method: 'Nagad' },
  { id: 'INV-2026-0183', school: 'Sylhet Green Valley College', amount: 8200, issued: daysAgo(33), due: daysAgo(5), status: 'PAID', method: 'bKash' },
  { id: 'INV-2026-0182', school: 'Barishal Collegiate School', amount: 8200, issued: daysAgo(60), due: daysAgo(32), status: 'OVERDUE', method: 'bKash' },
];

export const revenueSeries = [
  { month: 'Feb', mrr: 34800, new: 8200, churn: 0 },
  { month: 'Mar', mrr: 43000, new: 8200, churn: 0 },
  { month: 'Apr', mrr: 61500, new: 18500, churn: 0 },
  { month: 'May', mrr: 79000, new: 18500, churn: 1000 },
  { month: 'Jun', mrr: 87200, new: 8200, churn: 0 },
  { month: 'Jul', mrr: 95400, new: 16400, churn: 8200 },
];

/* ─────────────────────── growth / usage analytics ─────────────────────── */

export const growthSeries = [
  { month: 'Feb', schools: 3, students: 1840, users: 210 },
  { month: 'Mar', schools: 4, students: 2610, users: 298 },
  { month: 'Apr', schools: 6, students: 4180, users: 442 },
  { month: 'May', schools: 7, students: 5320, users: 561 },
  { month: 'Jun', schools: 9, students: 6890, users: 704 },
  { month: 'Jul', schools: 10, students: 7527, users: 812 },
];

export const moduleUsage = [
  { module: 'Attendance', sessions: 4820 },
  { module: 'Exams & results', sessions: 3140 },
  { module: 'Fees', sessions: 2470 },
  { module: 'Notices', sessions: 1690 },
  { module: 'Timetable', sessions: 1210 },
  { module: 'Library', sessions: 460 },
];

export const dauSeries = Array.from({ length: 14 }, (_, i) => ({
  day: new Date(Date.now() - (13 - i) * 86_400_000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  dau: [212, 240, 258, 249, 276, 118, 96, 288, 301, 294, 318, 332, 141, 108][i],
}));

export const planMix = [
  { name: 'Trial', value: 4, color: '#3E92CC' },
  { name: 'Basic', value: 2, color: '#12AEA9' },
  { name: 'Premium', value: 2, color: '#BFDBF7' },
  { name: 'Enterprise', value: 1, color: '#E0A800' },
  { name: 'Suspended', value: 1, color: '#D8315B' },
];

/* ──────────────────────── communication ──────────────────────────────── */

export interface MockAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: string;
  channel: 'Email' | 'In-app' | 'Email + In-app';
  status: 'SENT' | 'DRAFT' | 'QUEUED';
  reach: number;
  at: string;
}

export const announcements: MockAnnouncement[] = [
  { id: 'an-31', title: 'Scheduled maintenance — Friday 02:00–04:00', body: 'Attendance and result entry will be read-only for two hours while we upgrade the database.', audience: 'All school admins', channel: 'Email + In-app', status: 'SENT', reach: 10, at: daysAgo(2) },
  { id: 'an-30', title: 'New: bulk result import from Excel', body: 'Exam results can now be imported from a spreadsheet. Premium and Enterprise plans only.', audience: 'Premium + Enterprise', channel: 'In-app', status: 'SENT', reach: 3, at: daysAgo(9) },
  { id: 'an-29', title: 'Eid holiday support hours', body: 'Support replies will be slower between 6–9 June. Emergency line stays open.', audience: 'All users', channel: 'Email', status: 'DRAFT', reach: 0, at: daysAgo(14) },
];

export interface MockTicket {
  id: string;
  subject: string;
  school: string;
  requester: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  at: string;
  replies: number;
}

export const tickets: MockTicket[] = [
  { id: 'T-2291', subject: 'Attendance report shows last month instead of this month', school: 'Hammadia Model High School', requester: 'Reduanul Hasan', priority: 'HIGH', status: 'OPEN', at: hoursAgo(2), replies: 1 },
  { id: 'T-2290', subject: 'SMS balance not updating after top-up', school: 'Willes Little Flower School', requester: 'Ayat Rahman', priority: 'CRITICAL', status: 'OPEN', at: hoursAgo(6), replies: 3 },
  { id: 'T-2289', subject: 'Can we add a second campus under one login?', school: 'Mymensingh Science Institute', requester: 'Rukaiya Binte Shafique', priority: 'NORMAL', status: 'PENDING', at: daysAgo(1), replies: 2 },
  { id: 'T-2288', subject: 'Request to extend trial by 15 days', school: 'Khulna Public School', requester: 'Tanvir Ahmed', priority: 'NORMAL', status: 'OPEN', at: daysAgo(2), replies: 0 },
  { id: 'T-2287', subject: 'Teacher cannot upload profile photo', school: 'Sylhet Green Valley College', requester: 'Nadia Akter', priority: 'LOW', status: 'RESOLVED', at: daysAgo(5), replies: 4 },
];

/* ──────────────────────── system / developer tools ────────────────────── */

export const featureFlags = [
  { key: 'transport_module', name: 'Transport & routes', description: 'Bus routes, stoppages and pickup tracking.', on: true, rollout: 'Premium + Enterprise' },
  { key: 'hostel_module', name: 'Hostel management', description: 'Room allocation, warden roster, hostel fees.', on: false, rollout: 'Off' },
  { key: 'lms_module', name: 'Learning materials (LMS)', description: 'Lesson uploads, homework submission, grading.', on: true, rollout: 'All schools' },
  { key: 'parent_app', name: 'Parent mobile app', description: 'Push notifications and results for guardians.', on: true, rollout: 'Premium + Enterprise' },
  { key: 'banbeis_export', name: 'BANBEIS export', description: 'Government reporting format for annual returns.', on: false, rollout: 'Beta — 2 schools' },
  { key: 'ai_insights', name: 'Dropout risk insights', description: 'Flags students whose attendance is trending down.', on: false, rollout: 'Internal only' },
];

export const jobs = [
  { name: 'email:outbox-drain', schedule: 'every 1 min', lastRun: hoursAgo(0.02), duration: '1.2s', status: 'HEALTHY', queued: 2, failed: 0 },
  { name: 'trial:expiry-reminders', schedule: 'daily 06:00', lastRun: hoursAgo(9), duration: '4.8s', status: 'HEALTHY', queued: 0, failed: 0 },
  { name: 'invoice:monthly-generate', schedule: 'monthly 1st', lastRun: daysAgo(29), duration: '38s', status: 'HEALTHY', queued: 0, failed: 0 },
  { name: 'report:nightly-rollup', schedule: 'daily 01:30', lastRun: hoursAgo(13), duration: '2m 11s', status: 'DEGRADED', queued: 0, failed: 3 },
  { name: 'backup:postgres-dump', schedule: 'daily 03:00', lastRun: hoursAgo(11), duration: '1m 46s', status: 'HEALTHY', queued: 0, failed: 0 },
  { name: 'search:reindex-tenants', schedule: 'weekly Sun', lastRun: daysAgo(4), duration: '52s', status: 'IDLE', queued: 0, failed: 0 },
];

export const apiKeys = [
  { id: 'k-1', label: 'Marketing site — demo form', prefix: 'pk_live_7f2a', scopes: 'demo:write', created: daysAgo(96), lastUsed: hoursAgo(3), status: 'ACTIVE' },
  { id: 'k-2', label: 'Result import (Willes)', prefix: 'sk_live_c41d', scopes: 'students:read exams:write', created: daysAgo(52), lastUsed: daysAgo(1), status: 'ACTIVE' },
  { id: 'k-3', label: 'bKash payment callback', prefix: 'sk_live_9b83', scopes: 'payments:write', created: daysAgo(140), lastUsed: hoursAgo(19), status: 'ACTIVE' },
  { id: 'k-4', label: 'Old result importer', prefix: 'sk_live_f31a', scopes: 'exams:write', created: daysAgo(300), lastUsed: daysAgo(6), status: 'REVOKED' },
];

export const systemHealth = {
  overall: 'HEALTHY',
  services: [
    { name: 'API (Render)', status: 'UP', latency: '182 ms', note: 'Free tier — cold start up to 50s' },
    { name: 'PostgreSQL (Supabase)', status: 'UP', latency: '24 ms', note: '38 / 60 connections' },
    { name: 'ZeptoMail', status: 'UP', latency: '310 ms', note: '4 in outbox' },
    { name: 'SMS gateway', status: 'DEGRADED', latency: '2.4 s', note: 'Provider reporting delays' },
    { name: 'bKash', status: 'UP', latency: '640 ms', note: 'Sandbox credentials' },
    { name: 'Object storage', status: 'UP', latency: '96 ms', note: '24.7 GB of 100 GB' },
  ],
  latency: Array.from({ length: 24 }, (_, i) => ({
    h: `${String(i).padStart(2, '0')}:00`,
    p50: [140, 138, 132, 130, 128, 134, 152, 188, 240, 268, 254, 246, 238, 242, 236, 228, 244, 262, 288, 262, 218, 186, 164, 148][i],
    p95: [320, 312, 298, 290, 286, 302, 348, 420, 560, 640, 590, 560, 540, 552, 528, 512, 548, 604, 690, 612, 500, 420, 372, 336][i],
  })),
  cache: [
    { name: 'Tenant config', keys: 10, size: '48 KB', hitRate: 99.2 },
    { name: 'Permission matrix', keys: 6, size: '12 KB', hitRate: 98.4 },
    { name: 'Dashboard aggregates', keys: 40, size: '1.2 MB', hitRate: 86.1 },
    { name: 'Email templates', keys: 14, size: '210 KB', hitRate: 97.8 },
  ],
};

export const environment = {
  version: 'v3.1.0',
  commit: 'a4f19c2',
  builtAt: daysAgo(1),
  node: 'Java 21.0.4 · Spring Boot 3.3',
  region: 'Singapore (ap-southeast-1)',
  uptime: '11d 04h 22m',
  ddlAuto: 'validate',
  maintenance: false,
  vars: [
    { key: 'SPRING_PROFILES_ACTIVE', value: 'prod', secret: false },
    { key: 'DATABASE_URL', value: 'postgresql://…@db.supabase.co:5432/postgres', secret: true },
    { key: 'JWT_SECRET', value: '••••••••••••••••••••', secret: true },
    { key: 'FRONTEND_URL', value: 'https://shikkha-erp.vercel.app', secret: false },
    { key: 'ZEPTOMAIL_TOKEN', value: '••••••••••••••••••••', secret: true },
    { key: 'TRIAL_DAYS', value: '30', secret: false },
  ],
};

/* ─────────────────────── deletion / data requests ─────────────────────── */

export const deletionRequests = [
  { id: 'dr-7', school: 'Barishal Collegiate School', code: 'BCS-1048', requestedBy: 'farhanahoque251@gmail.com', reason: 'Switching to a government-provided system.', exportReady: true, requestedAt: daysAgo(4), status: 'PENDING' },
  { id: 'dr-6', school: 'Khulna Public School', code: 'KPS-1047', requestedBy: 'tanvir@kps.edu.bd', reason: 'Trial only — no longer needed.', exportReady: false, requestedAt: daysAgo(9), status: 'PENDING' },
  { id: 'dr-5', school: 'Old Demo Academy', code: 'ODA-1002', requestedBy: 'demo@shikkhaerp.com', reason: 'Test tenant cleanup.', exportReady: true, requestedAt: daysAgo(46), status: 'COMPLETED' },
];

/* ──────────────────────────── saved reports ───────────────────────────── */

export const savedReports = [
  { id: 'r-1', name: 'Trials expiring in 7 days', owner: 'hasanhabib2009@gmail.com', lastRun: hoursAgo(2), rows: 3, schedule: 'Daily 07:00' },
  { id: 'r-2', name: 'Schools with attendance below 80%', owner: 'rukaiyabinteshafique2009@gmail.com', lastRun: daysAgo(1), rows: 2, schedule: 'Weekly Mon' },
  { id: 'r-3', name: 'Overdue invoices by district', owner: 'hasanhabib2009@gmail.com', lastRun: daysAgo(3), rows: 2, schedule: 'Manual' },
  { id: 'r-4', name: 'Users who never logged in', owner: 'ispanesecom.224@gmail.com', lastRun: daysAgo(11), rows: 14, schedule: 'Manual' },
];

/* ───────────────────────── derived helpers ────────────────────────────── */

export const trialDaysLeft = (s: MockSchool): number | null =>
  s.trialEnd ? Math.ceil((new Date(s.trialEnd).getTime() - Date.now()) / 86_400_000) : null;

export const platformTotals = () => ({
  schools: schools.length,
  active: schools.filter((s) => s.status === 'ACTIVE').length,
  trials: schools.filter((s) => s.status === 'TRIAL').length,
  suspended: schools.filter((s) => s.status === 'SUSPENDED').length,
  students: schools.reduce((a, s) => a + s.students, 0),
  teachers: schools.reduce((a, s) => a + s.teachers, 0),
  mrr: schools.reduce((a, s) => a + s.mrr, 0),
  storageGb: +(schools.reduce((a, s) => a + (s.storageMb || 0), 0) / 1024).toFixed(1),
  pendingApprovals: demoRequests.filter((d) => d.status === 'PENDING').length,
  openTickets: tickets.filter((t) => t.status !== 'RESOLVED').length,
  expiringSoon: schools.filter((s) => {
    const d = trialDaysLeft(s);
    return d !== null && d <= 7;
  }).length,
});

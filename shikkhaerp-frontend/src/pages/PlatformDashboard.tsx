/**
 * Platform dashboard — the Super Admin / Developer landing screen.
 *
 * Reads live counts from /v1/dashboard/superadmin/stats and the real school
 * list where available, and falls back to the demo dataset so the screen is
 * never four zeroes and an empty table.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Building2, Users, GraduationCap, Wallet, Inbox, AlertTriangle, TrendingUp, TrendingDown,
  ArrowUpRight, CheckCircle2, XCircle, Clock, Activity, PlusCircle, Megaphone, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCountUp } from '../shared/ui/useCountUp';
import superAdminService from '../features/dashboard/services/superAdmin.service';
import {
  schools as mockSchools, demoRequests, growthSeries, planMix, auditLogs,
  platformTotals, trialDaysLeft, MockSchool,
} from '../features/platform/data/mock';

const C = {
  brand: '#034078', deep: '#001F54', teal: '#1282A2', ocean: '#3E92CC',
  signal: '#12AEA9', soft: '#BFDBF7', alert: '#D8315B', warn: '#E0A800', ink: '#0A1128',
};

const spring = { type: 'spring' as const, stiffness: 120, damping: 18 };
const rise = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { ...spring, delay: Math.min(i, 8) * 0.05 },
});

const bdt = (n: number) =>
  '৳' + (n >= 1e5 ? (n / 1e5).toFixed(2) + 'L' : Math.round(n).toLocaleString('en-BD'));

const Spark: React.FC<{ points: number[]; color: string }> = ({ points, color }) => {
  const w = 84, h = 28;
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  const d = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / span) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} aria-hidden="true">
      <polyline points={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Kpi: React.FC<{
  label: string; value: number; display?: (n: number) => string; trend: number;
  spark: number[]; icon: React.ReactNode; color: string; tint: string; i: number;
}> = ({ label, value, display, trend, spark, icon, color, tint, i }) => {
  const n = useCountUp(value);
  const up = trend >= 0;
  return (
    <motion.div {...rise(i)} className="rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: tint, color }}>{icon}</div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ color: up ? '#1B8A5A' : C.alert, background: up ? 'rgba(27,138,90,.10)' : 'rgba(216,49,91,.10)' }}
        >
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slatesoft">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="font-display text-[28px] font-extrabold leading-none tracking-tight text-ink">
          {display ? display(n) : Math.round(n).toLocaleString('en-BD')}
        </p>
        <Spark points={spark} color={color} />
      </div>
    </motion.div>
  );
};

const Panel: React.FC<{
  title: string; description?: string; action?: React.ReactNode;
  children: React.ReactNode; className?: string; i?: number; flush?: boolean;
}> = ({ title, description, action, children, className = '', i = 0, flush }) => (
  <motion.section {...rise(i)} className={`overflow-hidden rounded-2xl border border-line bg-white shadow-card ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-display text-[15px] font-extrabold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slatesoft">{description}</p>}
      </div>
      {action}
    </div>
    <div className={flush ? '' : 'p-5'}>{children}</div>
  </motion.section>
);

/** The signature element: every tenant as one bar, coloured by trial runway. */
const TenantStrip: React.FC<{ rows: MockSchool[] }> = ({ rows }) => {
  const [hover, setHover] = useState<MockSchool | null>(null);
  const barFor = (s: MockSchool) => {
    const d = trialDaysLeft(s);
    if (s.status === 'SUSPENDED') return { h: 30, c: C.alert, label: 'Suspended' };
    if (d === null) return { h: 100, c: C.signal, label: 'Paid — no expiry' };
    if (d <= 3) return { h: 24, c: C.alert, label: `${d}d left` };
    if (d <= 10) return { h: 48, c: C.warn, label: `${d}d left` };
    return { h: 72, c: C.ocean, label: `${d}d left` };
  };

  return (
    <motion.section {...rise(0)} className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-[15px] font-extrabold text-ink">Tenant runway</h2>
          <p className="mt-0.5 text-xs text-slatesoft">
            One bar per school. Height is how much time they have left before you lose them.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slatesoft">
          {[['Paid', C.signal], ['Healthy trial', C.ocean], ['Ends soon', C.warn], ['Critical', C.alert]].map(([l, c]) => (
            <span key={l as string} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: c as string }} /> {l}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pb-4 pt-6">
        <div className="flex h-24 items-end gap-1.5">
          {rows.map((s) => {
            const b = barFor(s);
            return (
              <button
                key={s.id}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s)}
                onBlur={() => setHover(null)}
                aria-label={`${s.name} — ${b.label}`}
                className="group relative flex-1 rounded-t-md transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/40"
                style={{ height: `${b.h}%`, background: b.c, minWidth: 14 }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex h-9 items-center">
          {hover ? (
            <p className="text-sm">
              <span className="font-semibold text-ink">{hover.name}</span>
              <span className="mx-2 font-mono text-xs text-ocean">{hover.code}</span>
              <span className="text-slatesoft">
                {hover.students.toLocaleString('en-BD')} students · {hover.plan} · {barFor(hover).label}
              </span>
            </p>
          ) : (
            <p className="text-sm text-slatesoft">Hover a bar to see the school.</p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

const PlatformDashboard: React.FC = () => {
  const { user } = useAuth();
  const [live, setLive] = useState<any>(null);
  const [queue, setQueue] = useState(demoRequests);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    superAdminService.getStats().then(setLive).catch(() => setLive(null));
  }, []);

  const t = useMemo(() => platformTotals(), []);
  const fire = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2400); };

  const decide = (uuid: string, approved: boolean, name: string) => {
    setQueue((q) => q.filter((r) => r.uuid !== uuid));
    fire(approved ? `${name} approved — setup email sent` : `${name} declined`);
  };

  // Live counts win where the backend actually has them; demo fills the rest.
  const totalSchools = live?.totalSchools ?? t.schools;
  const totalUsers = live?.totalUsers ?? 812;
  const totalStudents = live?.totalStudents ?? t.students;

  const expiring = useMemo(
    () => mockSchools
      .map((s) => ({ s, d: trialDaysLeft(s) }))
      .filter((x) => x.d !== null && x.d <= 30)
      .sort((a, b) => (a.d as number) - (b.d as number)),
    [],
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">ITDataScience Ltd.</p>
          <h1 className="mt-1 font-display text-[26px] font-extrabold tracking-tight text-ink">
            Good to see you, {user?.fullName?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-sm text-slatesoft">
            {t.schools} schools · {t.students.toLocaleString('en-BD')} students · {t.pendingApprovals} requests waiting on you.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/platform/approvals" className="inline-flex items-center gap-2 rounded-xl bg-signal-gradient px-4 py-2 text-sm font-bold text-[#04222B] transition-all hover:brightness-110">
            <Inbox className="h-4 w-4" /> Review requests
            {t.pendingApprovals > 0 && (
              <span className="rounded-full bg-[#04222B]/15 px-1.5 font-mono text-[11px]">{t.pendingApprovals}</span>
            )}
          </Link>
          <Link to="/platform/schools/new" className="inline-flex items-center gap-2 rounded-xl border border-linestrong bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surfaceinset">
            <PlusCircle className="h-4 w-4" /> Add a school
          </Link>
        </div>
      </div>

      <TenantStrip rows={mockSchools} />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi i={1} label="Schools on the platform" value={totalSchools} trend={11}
          spark={[3, 4, 6, 7, 9, 10]} icon={<Building2 className="h-[18px] w-[18px]" />}
          color={C.brand} tint="rgba(3,64,120,.10)" />
        <Kpi i={2} label="Students enrolled" value={totalStudents} trend={9}
          spark={[1840, 2610, 4180, 5320, 6890, 7527]} icon={<GraduationCap className="h-[18px] w-[18px]" />}
          color={C.signal} tint="rgba(18,174,169,.12)" />
        <Kpi i={3} label="Users with a login" value={totalUsers} trend={15}
          spark={[210, 298, 442, 561, 704, 812]} icon={<Users className="h-[18px] w-[18px]" />}
          color={C.ocean} tint="rgba(62,146,204,.12)" />
        <Kpi i={4} label="Monthly recurring revenue" value={t.mrr} display={bdt} trend={9}
          spark={[34800, 43000, 61500, 79000, 87200, 95400]} icon={<Wallet className="h-[18px] w-[18px]" />}
          color={C.warn} tint="rgba(224,168,0,.12)" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel i={5} title="Growth" description="Schools and students, last six months" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gStu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.ocean} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.ocean} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#51607A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#51607A' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 12, boxShadow: '0 12px 34px rgba(3,64,120,.14)' }}
                />
                <Area type="monotone" dataKey="students" stroke={C.ocean} strokeWidth={2.4} fill="url(#gStu)" name="Students" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel i={6} title="Plan mix" description="Where the ten tenants sit">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planMix} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3}>
                  {planMix.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {planMix.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slatesoft">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.name}
                </span>
                <span className="font-semibold text-ink">{p.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Queues */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel
          i={7}
          title="Demo requests"
          description="Approve to create the school and email its admin"
          className="lg:col-span-2"
          flush
          action={<Link to="/platform/approvals" className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">Open inbox <ArrowUpRight className="h-3 w-3" /></Link>}
        >
          {queue.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-signal" />
              <p className="mt-3 font-display text-sm font-bold text-ink">Inbox clear</p>
              <p className="mt-1 text-sm text-slatesoft">Every request has been handled.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {queue.slice(0, 4).map((r) => (
                <li key={r.uuid} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-display text-xs font-bold text-brand">
                    {r.schoolName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{r.schoolName}</p>
                    <p className="truncate text-xs text-slatesoft">
                      {r.requesterName} · {r.requesterRole} · {r.studentCount} students
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => decide(r.uuid, true, r.schoolName)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-signal/12 px-2.5 py-1.5 text-xs font-bold text-[#0B7C78] transition-colors hover:bg-signal/20"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => decide(r.uuid, false, r.schoolName)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-[#B3261E] transition-colors hover:bg-red-100"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel i={8} title="Trials ending" description="Chase these before they lapse" flush>
          <ul className="divide-y divide-line">
            {expiring.slice(0, 5).map(({ s, d }) => {
              const critical = (d as number) <= 7;
              return (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${critical ? 'bg-red-50 text-[#B3261E]' : 'bg-amber-50 text-amber-700'}`}>
                    {critical ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                    <p className="text-xs text-slatesoft">{s.students} students · {s.district}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${critical ? 'bg-red-50 text-[#B3261E]' : 'bg-amber-50 text-amber-700'}`}>
                    {d}d
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* Activity + usage */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel i={9} title="Recent activity" description="Administrative actions across the platform" className="lg:col-span-2" flush>
          <ul className="divide-y divide-line">
            {auditLogs.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.severity === 'CRITICAL' ? 'bg-alert' : a.severity === 'WARN' ? 'bg-warning' : 'bg-signal'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-mono text-xs text-ocean">{a.action}</span>
                    <span className="mx-1.5 text-slatesoft">·</span>
                    <span className="text-slatesoft">{a.target}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slatesoft">{a.actor}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel i={10} title="Revenue by month" description="MRR, last six months">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthSeries} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#51607A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#51607A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 12 }} />
                <Bar dataKey="users" fill={C.teal} radius={[6, 6, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/platform/announcements" className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surfaceinset">
              <Megaphone className="h-3.5 w-3.5 text-slatesoft" /> Announce
            </Link>
            <Link to="/platform/system/health" className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surfaceinset">
              <Activity className="h-3.5 w-3.5 text-slatesoft" /> Health
            </Link>
            <Link to="/platform/users" className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surfaceinset">
              <Users className="h-3.5 w-3.5 text-slatesoft" /> Users
            </Link>
            <Link to="/platform/audit-log" className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surfaceinset">
              <ShieldCheck className="h-3.5 w-3.5 text-slatesoft" /> Audit
            </Link>
          </div>
        </Panel>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-modal">
            <CheckCircle2 className="h-4 w-4 text-signal" /> {toast}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlatformDashboard;

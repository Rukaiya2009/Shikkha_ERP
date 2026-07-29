import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  GraduationCap, Users, CalendarCheck, Wallet, AlertTriangle, Award,
  TrendingUp, TrendingDown, Bell, CalendarDays, CheckCircle2, XCircle,
  Megaphone, Sparkles, UserPlus, Receipt, ClipboardCheck, Send, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCountUp } from '../../shared/ui/useCountUp';
import * as data from './admin/mockData';

/* helpers */
const bdt = (n: number, compact = false) =>
  '৳' + (compact
    ? n >= 1e7 ? (n / 1e7).toFixed(2) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + 'L' : n.toLocaleString('en-BD')
    : Math.round(n).toLocaleString('en-BD'));

const C = {
  brand: '#034078', deep: '#001F54', teal: '#1282A2', ocean: '#3E92CC',
  soft: '#BFDBF7', alert: '#D8315B', success: '#1B8A5A', warn: '#E0A800', ink: '#0A1128',
};

const spring = { type: 'spring' as const, stiffness: 120, damping: 18 };
const rise = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { ...spring, delay: i * 0.05 },
});

const Sparkline: React.FC<{ points: number[]; color: string; w?: number; h?: number }> = ({
  points, color, w = 84, h = 30,
}) => {
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / span) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={d} fill="none" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={1000} className="animate-draw" />
      <circle cx={w} cy={h - ((points[points.length - 1] - min) / span) * (h - 4) - 2} r={2.6} fill={color} />
    </svg>
  );
};

interface KpiProps {
  label: string; value: number; display?: (n: number) => string;
  suffix?: string; trend: number; spark: number[]; icon: React.ReactNode;
  color: string; tint: string; i: number;
}
const Kpi: React.FC<KpiProps> = ({ label, value, display, suffix, trend, spark, icon, color, tint, i }) => {
  const n = useCountUp(value);
  const up = trend >= 0;
  return (
    <motion.div {...rise(i)}
      className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: tint, color }}>{icon}</div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${up ? 'text-success' : 'text-alert'}`}
          style={{ background: up ? 'rgba(27,138,90,.10)' : 'rgba(216,49,91,.10)' }}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{Math.abs(trend)}%
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slatesoft">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="font-display text-3xl font-bold tracking-tight text-ink">
          {display ? display(n) : Math.round(n).toLocaleString('en-BD')}{suffix}
        </p>
        <Sparkline points={spark} color={color} />
      </div>
    </motion.div>
  );
};

const Panel: React.FC<{
  title: string; icon?: React.ReactNode; action?: React.ReactNode;
  children: React.ReactNode; className?: string; i?: number;
}> = ({ title, icon, action, children, className = '', i = 0 }) => (
  <motion.section {...rise(i)}
    className={`overflow-hidden rounded-2xl border border-line bg-white shadow-card ${className}`}>
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-brand">{icon}</span>}
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </motion.section>
);

const toneMap = {
  info: { c: C.ocean }, success: { c: C.success }, warning: { c: C.warn },
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metric, setMetric] = useState<'students' | 'revenue'>('students');
  const [approvals, setApprovals] = useState(data.pendingApprovals);
  const [notices, setNotices] = useState(data.announcements);
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const fire = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 2200); };
  const feePct = Math.round((data.feeStatus.collected / data.feeStatus.target) * 100);
  const today = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [],
  );

  const quickActions = [
    { label: 'Add student', icon: <UserPlus className="h-4 w-4" /> },
    { label: 'Add teacher', icon: <Users className="h-4 w-4" /> },
    { label: 'Collect fee', icon: <Receipt className="h-4 w-4" /> },
    { label: 'Mark attendance', icon: <ClipboardCheck className="h-4 w-4" /> },
    { label: 'Send notice', icon: <Send className="h-4 w-4" /> },
  ];

  const postNotice = () => {
    if (!draft.trim()) return;
    setNotices((p) => [{ title: draft.trim(), body: 'Posted just now', date: 'Now' }, ...p]);
    setDraft(''); fire('Notice posted');
  };

  return (
    <div className="mx-auto max-w-7xl pb-4">
      <motion.div {...rise(0)} className="relative mb-6 overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-teal/30 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> School control center
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-1 text-sm text-white/70">{today}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <button key={a.label} onClick={() => fire(`${a.label} — demo action`)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                {a.icon}{a.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi i={1} label="Total students" value={data.kpis.students} trend={data.kpis.studentsTrend}
          spark={data.kpis.studentsSpark} icon={<GraduationCap className="h-5 w-5" />} color={C.brand} tint="rgba(3,64,120,.10)" />
        <Kpi i={2} label="Teachers" value={data.kpis.teachers} trend={data.kpis.teachersTrend}
          spark={data.kpis.teachersSpark} icon={<Users className="h-5 w-5" />} color={C.teal} tint="rgba(18,130,162,.10)" />
        <Kpi i={3} label="Attendance today" value={data.kpis.attendanceToday} suffix="%" trend={data.kpis.attendanceTrend}
          spark={data.kpis.attendanceSpark} icon={<CalendarCheck className="h-5 w-5" />} color={C.ocean} tint="rgba(62,146,204,.12)" display={(v) => v.toFixed(1)} />
        <Kpi i={4} label="Fee collected" value={data.kpis.feeCollected} trend={data.kpis.feeTrend}
          spark={data.kpis.feeSpark} icon={<Wallet className="h-5 w-5" />} color={C.success} tint="rgba(27,138,90,.10)" display={(v) => bdt(v, true)} />
        <Kpi i={5} label="Outstanding dues" value={data.kpis.outstanding} trend={data.kpis.outstandingTrend}
          spark={data.kpis.outstandingSpark} icon={<AlertTriangle className="h-5 w-5" />} color={C.alert} tint="rgba(216,49,91,.10)" display={(v) => bdt(v, true)} />
        <Kpi i={6} label="Avg performance" value={data.kpis.avgPerformance} suffix="%" trend={data.kpis.performanceTrend}
          spark={data.kpis.performanceSpark} icon={<Award className="h-5 w-5" />} color={C.deep} tint="rgba(0,31,84,.08)" display={(v) => v.toFixed(1)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel i={2} title="Enrolment & revenue" icon={<TrendingUp className="h-4 w-4" />} className="lg:col-span-2"
          action={
            <div className="flex rounded-lg bg-surfaceinset p-0.5">
              {(['students', 'revenue'] as const).map((m) => (
                <button key={m} onClick={() => setMetric(m)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${metric === m ? 'bg-white text-brand shadow-sm' : 'text-slatesoft'}`}>
                  {m === 'revenue' ? 'Revenue' : 'Students'}
                </button>
              ))}
            </div>
          }>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.enrollmentTrend} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.ocean} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.ocean} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8695AB' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8695AB' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 13 }}
                  formatter={(v: any) => metric === 'revenue' ? [`৳${v} Cr`, 'Revenue'] : [v, 'Students']} />
                <Area type="monotone" dataKey={metric} stroke={C.brand} strokeWidth={2.5} fill="url(#gArea)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel i={3} title="Attendance · this week" icon={<CalendarCheck className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyAttendance} margin={{ top: 6, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F8" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8695AB' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8695AB' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 13 }} cursor={{ fill: '#F5F8FC' }} />
                <Bar dataKey="present" radius={[6, 6, 0, 0]} fill={C.teal} animationDuration={900} />
                <Bar dataKey="absent" radius={[6, 6, 0, 0]} fill={C.soft} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel i={2} title="Gender ratio" icon={<Users className="h-4 w-4" />}>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.genderRatio} dataKey="value" innerRadius={44} outerRadius={64} paddingAngle={3} stroke="none">
                    <Cell fill={C.brand} /><Cell fill={C.ocean} />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {data.genderRatio.map((g, idx) => (
                <div key={g.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: idx === 0 ? C.brand : C.ocean }} />
                  <span className="text-sm text-slatesoft">{g.name}</span>
                  <span className="ml-auto font-display text-sm font-bold text-ink">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel i={3} title="Students by class" icon={<GraduationCap className="h-4 w-4" />}>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.classDistribution} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="class" tick={{ fontSize: 11, fill: '#8695AB' }} axisLine={false} tickLine={false} width={58} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 13 }} cursor={{ fill: '#F5F8FC' }} />
                <Bar dataKey="students" radius={[0, 6, 6, 0]} fill={C.teal} animationDuration={900} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel i={4} title="Fee collection" icon={<Wallet className="h-4 w-4" />}>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#EEF3F9" strokeWidth="12" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={C.success} strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - feePct / 100)}
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-ink">{feePct}%</span>
                <span className="text-[11px] text-slatesoft">of target</span>
              </div>
            </div>
            <div className="mt-3 text-center text-sm">
              <span className="font-display font-bold text-ink">{bdt(data.feeStatus.collected, true)}</span>
              <span className="text-slatesoft"> / {bdt(data.feeStatus.target, true)}</span>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel i={2} title="Recent activity" icon={<Bell className="h-4 w-4" />}>
          <ul className="space-y-3">
            {data.recentActivity.map((a, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: toneMap[a.tone].c }} />
                <div>
                  <p className="text-sm text-ink"><span className="font-semibold">{a.who}</span> {a.action}</p>
                  <p className="text-xs text-slatesoft">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel i={3} title="Pending approvals" icon={<ClipboardCheck className="h-4 w-4" />}
          action={<span className="rounded-full bg-alert/10 px-2 py-0.5 text-xs font-bold text-alert">{approvals.length}</span>}>
          {approvals.length === 0 ? (
            <p className="py-8 text-center text-sm text-slatesoft">All caught up. Nothing pending.</p>
          ) : (
            <ul className="space-y-2">
              {approvals.map((a) => (
                <li key={a.id} className="flex items-center gap-2 rounded-xl border border-line bg-surfaceinset p-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slatesoft">{a.type}</span>
                    <p className="mt-1 truncate text-sm text-ink">{a.label}</p>
                  </div>
                  <button aria-label="Approve" onClick={() => { setApprovals((p) => p.filter((x) => x.id !== a.id)); fire('Approved'); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success transition-colors hover:bg-success/20">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button aria-label="Reject" onClick={() => { setApprovals((p) => p.filter((x) => x.id !== a.id)); fire('Dismissed'); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-alert/10 text-alert transition-colors hover:bg-alert/20">
                    <XCircle className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel i={4} title="Upcoming events" icon={<CalendarDays className="h-4 w-4" />}>
          <ul className="space-y-2">
            {data.upcomingEvents.map((e) => (
              <li key={e.title} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <span className="text-[10px] font-bold uppercase leading-none">{e.date.split(' ')[0]}</span>
                  <span className="font-display text-sm font-bold leading-none">{e.date.split(' ')[1]}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{e.title}</p>
                  <p className="text-xs text-slatesoft">{e.tag}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel i={2} title="Announcements" icon={<Megaphone className="h-4 w-4" />}>
          <div className="mb-3 flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Post a quick notice…"
              onKeyDown={(e) => { if (e.key === 'Enter') postNotice(); }}
              className="w-full rounded-lg border border-linestrong bg-surfacefield px-3 py-2 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-ocean/20" />
            <button onClick={postNotice} className="shrink-0 rounded-lg bg-brand px-3 text-white transition-colors hover:bg-brand-deep">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-2">
            {notices.map((n, idx) => (
              <li key={idx} className="rounded-xl border border-line p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <span className="text-xs text-slatesoft">{n.date}</span>
                </div>
                <p className="mt-0.5 text-xs text-slatesoft">{n.body}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel i={3} title="Top performers" icon={<Award className="h-4 w-4" />}>
          <ul className="space-y-3">
            {data.topPerformers.map((s, idx) => (
              <li key={s.name} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold ${idx === 0 ? 'bg-warning/15 text-warning' : 'bg-brand/10 text-brand'}`}>{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                  <p className="text-xs text-slatesoft">{s.class}</p>
                </div>
                <span className="font-display text-sm font-bold text-success">{s.score}%</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel i={4} title="Fee defaulters" icon={<AlertTriangle className="h-4 w-4" />}
          action={<button onClick={() => fire('Reminders sent — demo')} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">Remind all <ArrowUpRight className="h-3 w-3" /></button>}>
          <ul className="space-y-2">
            {data.feeStatus.defaulters.map((d) => (
              <li key={d.name} className="flex items-center justify-between rounded-xl border border-line p-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{d.name}</p>
                  <p className="text-xs text-slatesoft">{d.class}</p>
                </div>
                <span className="rounded-lg bg-alert/10 px-2 py-1 text-sm font-bold text-alert">{bdt(d.due)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-modal">
          {toast}
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;

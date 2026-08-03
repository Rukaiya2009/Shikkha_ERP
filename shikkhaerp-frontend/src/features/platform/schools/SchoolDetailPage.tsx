/**
 * School detail — one tenant in full.
 *
 * The record-page shape: identity block, quick numbers, then tabs across
 * everything attached to the tenant. The Lifecycle tab holds the destructive
 * controls — suspend, extend, change plan, impersonate — kept together and
 * behind confirmation rather than scattered through the page.
 *
 * Data: reads `schools`, `featureFlags`, `auditLogs`, `plans` from
 * platform/data/mock. Lifecycle actions mutate local state only.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  ArrowLeft, Building2, Ban, RotateCcw, CalendarClock, ArrowUpRight, Layers,
  Users2, Wallet, HardDrive, Timer, Mail, Phone, MapPin, Globe, ShieldAlert,
  Activity, ToggleLeft, User, Trash2,
} from 'lucide-react';
import {
  SectionCard, Badge, BadgeTone, EmptyState, Tabs, TabItem, Th,
  ConfirmDialog, Toast, useToast, DemoChip, RowMenu,
} from '../../../shared/ui';
import {
  schools, MockSchool, trialDaysLeft, featureFlags, auditLogs, plans, growthSeries, moduleUsage,
} from '../../../platform/data/mock';
import { taka, timeAgo, shortDate, dateTime, initials, tintFor } from '../format';
import { PLAN_TONE, STATUS_TONE } from './SchoolsListPage';

const SEVERITY_TONE: Record<string, BadgeTone> = { INFO: 'neutral', WARN: 'warning', CRITICAL: 'danger' };

const Row: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ label, children, icon }) => (
  <div className="flex items-start gap-3 border-b border-line py-3 last:border-0">
    {icon && <span className="mt-0.5 text-slatesoft">{icon}</span>}
    <div className="min-w-0 flex-1">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-ink">{children}</dd>
    </div>
  </div>
);

export const SchoolDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast, notify, clear } = useToast();

  const [school, setSchool] = useState<MockSchool | undefined>(() => schools.find((s) => s.id === id));
  const [tab, setTab] = useState('overview');
  const [flags, setFlags] = useState(() => featureFlags.map((f) => ({ ...f })));
  const [dialog, setDialog] = useState<'suspend' | 'restore' | 'delete' | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const activity = useMemo(
    () => auditLogs.filter((a) => (school ? a.target.includes(school.code) || a.target.includes(school.name) : false)),
    [school],
  );

  if (!school) {
    return (
      <SectionCard>
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Tenant not found"
          description="That school may have been removed, or the link is out of date."
          action={
            <Link to="/platform/schools"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep">
              <ArrowLeft className="h-4 w-4" /> Back to all schools
            </Link>
          }
        />
      </SectionCard>
    );
  }

  const days = trialDaysLeft(school);
  const currentPlan = plans.find((p) => p.key === school.plan);

  const run = () => {
    setBusy(true);
    setTimeout(() => {
      if (dialog === 'suspend') { setSchool({ ...school, status: 'SUSPENDED', mrr: 0 }); notify('Tenant suspended'); }
      if (dialog === 'restore') { setSchool({ ...school, status: 'ACTIVE' }); notify('Tenant restored'); }
      if (dialog === 'delete') { notify('Deletion request raised — it now needs an export', 'danger'); navigate('/platform/schools/deletions'); }
      setBusy(false);
      setDialog(null);
    }, 500);
  };

  const changePlan = (key: string) => {
    const p = plans.find((x) => x.key === key);
    setSchool({ ...school, plan: key as MockSchool['plan'], mrr: p?.price ?? 0, status: key === 'TRIAL' ? 'TRIAL' : 'ACTIVE' });
    setPlanOpen(false);
    notify(`Plan changed to ${p?.name}`);
  };

  const TABS: TabItem[] = [
    { key: 'overview', label: 'Overview', icon: <Building2 className="h-4 w-4" /> },
    { key: 'usage', label: 'Usage', icon: <Activity className="h-4 w-4" /> },
    { key: 'flags', label: 'Feature flags', icon: <ToggleLeft className="h-4 w-4" />, count: flags.filter((f) => f.on).length },
    { key: 'lifecycle', label: 'Lifecycle', icon: <ShieldAlert className="h-4 w-4" /> },
    { key: 'activity', label: 'Activity', icon: <Timer className="h-4 w-4" />, count: activity.length },
  ];

  return (
    <>
      <Link to="/platform/schools"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slatesoft transition hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All schools
      </Link>

      <SectionCard className="mb-6">
        <div className="flex flex-wrap items-start gap-5">
          <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-extrabold ${tintFor(school.code)}`}>
            {initials(school.name)}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{school.name}</h1>
              <Badge tone={STATUS_TONE[school.status]} dot>{school.status[0] + school.status.slice(1).toLowerCase()}</Badge>
              <Badge tone={PLAN_TONE[school.plan]}>{school.plan[0] + school.plan.slice(1).toLowerCase()}</Badge>
              <DemoChip />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slatesoft">
              <span className="font-mono text-xs text-ocean">{school.code}</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <Globe className="h-3.5 w-3.5" />{school.subdomain}.shikkha.app
              </span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{school.district}</span>
              <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{school.admin}</span>
              <span className="inline-flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5" />{school.adminEmail}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => notify(`Impersonation session would open as ${school.admin}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep">
              <ArrowUpRight className="h-4 w-4" /> Impersonate admin
            </button>
            <RowMenu items={[
              { label: 'Change plan', icon: <Layers className="h-4 w-4" />, onClick: () => { setTab('lifecycle'); setPlanOpen(true); } },
              { label: 'Email the admin', icon: <Mail className="h-4 w-4" />, onClick: () => notify(`Draft opened for ${school.adminEmail}`) },
              school.status === 'SUSPENDED'
                ? { label: 'Restore tenant', icon: <RotateCcw className="h-4 w-4" />, onClick: () => setDialog('restore'), divider: true }
                : { label: 'Suspend tenant', icon: <Ban className="h-4 w-4" />, onClick: () => setDialog('suspend'), divider: true },
              { label: 'Request deletion', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDialog('delete'), danger: true },
            ]} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-3 xl:grid-cols-5">
          {[
            { label: 'Students', value: school.students.toLocaleString('en-IN'), icon: <Users2 className="h-4 w-4" /> },
            { label: 'Teachers', value: school.teachers, icon: <User className="h-4 w-4" /> },
            { label: 'MRR', value: school.mrr ? taka(school.mrr) : '—', icon: <Wallet className="h-4 w-4" /> },
            { label: 'Storage', value: `${((school.storageMb || 0) / 1024).toFixed(1)} GB`, icon: <HardDrive className="h-4 w-4" /> },
            {
              label: 'Trial runway',
              value: days === null ? 'Paid' : days <= 0 ? 'Expired' : `${days} days`,
              icon: <Timer className="h-4 w-4" />,
              tone: days !== null && days <= 3 ? 'text-alert' : days !== null && days <= 10 ? 'text-[#8A5A00]' : 'text-ink',
            },
          ].map((k: any) => (
            <div key={k.label} className="rounded-xl bg-surfaceinset px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slatesoft">
                {k.icon}{k.label}
              </p>
              <p className={`mt-0.5 font-display text-xl font-extrabold ${k.tone || 'text-ink'}`}>{k.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard flush>
        <Tabs items={TABS} active={tab} onChange={setTab} className="px-2" />

        {/* ── overview ── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">School profile</h3>
              <dl>
                <Row label="Legal name" icon={<Building2 className="h-4 w-4" />}>{school.name}</Row>
                <Row label="Tenant code"><span className="font-mono text-xs">{school.code}</span></Row>
                <Row label="Subdomain" icon={<Globe className="h-4 w-4" />}>
                  <span className="font-mono text-xs text-ocean">{school.subdomain}.shikkha.app</span>
                </Row>
                <Row label="District" icon={<MapPin className="h-4 w-4" />}>{school.district}</Row>
                <Row label="Onboarded">{shortDate(school.createdAt)} · {timeAgo(school.createdAt)}</Row>
                <Row label="Last activity">{timeAgo(school.lastActive)}</Row>
              </dl>
            </div>

            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">Subscription</h3>
              <dl>
                <Row label="Plan" icon={<Layers className="h-4 w-4" />}>
                  {currentPlan?.name ?? school.plan} — {currentPlan ? taka(currentPlan.price) : '—'}/month
                </Row>
                <Row label="Per-student rate">{currentPlan ? taka(currentPlan.perStudent) : '—'}</Row>
                <Row label="Monthly recurring" icon={<Wallet className="h-4 w-4" />}>{school.mrr ? taka(school.mrr) : 'Not billing'}</Row>
                <Row label="Trial ends" icon={<CalendarClock className="h-4 w-4" />}>
                  {school.trialEnd ? `${shortDate(school.trialEnd)} · ${days} days left` : 'Not on a trial'}
                </Row>
                <Row label="Included">{currentPlan?.features.join(' · ') ?? '—'}</Row>
              </dl>
            </div>

            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">School admin</h3>
              <dl>
                <Row label="Name" icon={<User className="h-4 w-4" />}>{school.admin}</Row>
                <Row label="Email" icon={<Mail className="h-4 w-4" />}>{school.adminEmail}</Row>
                <Row label="Role">SCHOOL_ADMIN · scoped to {school.code}</Row>
              </dl>
            </div>

            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">Capacity</h3>
              <dl>
                <Row label="Students enrolled" icon={<Users2 className="h-4 w-4" />}>{school.students.toLocaleString('en-IN')}</Row>
                <Row label="Teaching staff">{school.teachers}</Row>
                <Row label="Storage used" icon={<HardDrive className="h-4 w-4" />}>
                  {((school.storageMb || 0) / 1024).toFixed(2)} GB
                </Row>
                <Row label="Ratio">1 teacher per {Math.round(school.students / Math.max(1, school.teachers))} students</Row>
              </dl>
            </div>
          </div>
        )}

        {/* ── usage ── */}
        {tab === 'usage' && (
          <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
            <div className="h-72 rounded-2xl border border-line bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slatesoft">Students over six months</p>
              <ResponsiveContainer width="100%" height="88%">
                <AreaChart data={growthSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-students" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3E92CC" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3E92CC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#51607A' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#51607A' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 12 }} />
                  <Area type="monotone" dataKey="students" stroke="#3E92CC" strokeWidth={2} fill="url(#g-students)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-72 rounded-2xl border border-line bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slatesoft">Module usage · sessions</p>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={moduleUsage} layout="vertical" margin={{ top: 4, right: 16, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#51607A' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="module" tick={{ fontSize: 11, fill: '#51607A' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{ fill: '#F5F8FC' }} contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 12 }} />
                  <Bar dataKey="sessions" radius={[0, 6, 6, 0]}>
                    {moduleUsage.map((_, i) => <Cell key={i} fill={i === 0 ? '#12AEA9' : '#BFDBF7'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slatesoft lg:col-span-2">
              Both charts read the platform-wide demo series. Per-tenant usage needs
              <code className="mx-1 rounded bg-surfaceinset px-1.5 py-0.5 font-mono text-[11px]">GET /schools/&#123;id&#125;/usage</code>
              before these become real.
            </p>
          </div>
        )}

        {/* ── feature flags ── */}
        {tab === 'flags' && (
          <div className="divide-y divide-line">
            {flags.map((f) => (
              <div key={f.key} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{f.name}</p>
                  <p className="mt-0.5 text-sm text-slatesoft">{f.description}</p>
                  <p className="mt-1 font-mono text-[11px] text-ocean">{f.key} · {f.rollout}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFlags((p) => p.map((x) => (x.key === f.key ? { ...x, on: !x.on } : x)));
                    notify(`${f.name} ${f.on ? 'disabled' : 'enabled'} for ${school.code}`);
                  }}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${f.on ? 'bg-signal' : 'bg-linestrong'}`}
                  aria-label={`Toggle ${f.name}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${f.on ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── lifecycle ── */}
        {tab === 'lifecycle' && (
          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-line bg-white">
              <div className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">Change the plan</p>
                  <p className="mt-0.5 text-sm text-slatesoft">
                    Currently on {currentPlan?.name}. Changing takes effect on the next invoice.
                  </p>
                </div>
                <button type="button" onClick={() => setPlanOpen((o) => !o)}
                  className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand">
                  {planOpen ? 'Close' : 'Change plan'}
                </button>
              </div>

              {planOpen && (
                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                  {plans.map((p) => (
                    <button key={p.key} type="button" onClick={() => changePlan(p.key)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        p.key === school.plan ? 'border-brand bg-brand/5' : 'border-line bg-white hover:border-ocean hover:shadow-card'
                      }`}>
                      <p className="font-display text-sm font-extrabold text-ink">{p.name}</p>
                      <p className="mt-1 font-display text-xl font-extrabold text-brand">{p.price ? taka(p.price) : 'Free'}</p>
                      <p className="text-[11px] text-slatesoft">per month · {taka(p.perStudent)}/student</p>
                      <ul className="mt-3 space-y-1">
                        {p.features.map((f) => (
                          <li key={f} className="text-[11px] text-slatesoft">· {f}</li>
                        ))}
                      </ul>
                      {p.key === school.plan && <p className="mt-3 text-[11px] font-extrabold uppercase text-brand">Current plan</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {school.trialEnd && (
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">Extend the trial</p>
                  <p className="mt-0.5 text-sm text-slatesoft">
                    Ends {shortDate(school.trialEnd)} — {days} days left. Extensions are counted from today.
                  </p>
                </div>
                <div className="flex gap-2">
                  {[7, 14, 30].map((d) => (
                    <button key={d} type="button"
                      onClick={() => {
                        setSchool({ ...school, trialEnd: new Date(Date.now() + d * 86_400_000).toISOString() });
                        notify(`Trial extended by ${d} days`);
                      }}
                      className="rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand">
                      +{d}d
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">Impersonate the school admin</p>
                <p className="mt-0.5 text-sm text-slatesoft">
                  Opens a read-write session as {school.admin}. Every action is written to the audit log under your account.
                </p>
              </div>
              <button type="button" onClick={() => notify('Impersonation session would open')}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand">
                <ArrowUpRight className="h-4 w-4" /> Start session
              </button>
            </div>

            <div className="rounded-2xl border border-alert/30 bg-alert/5">
              <div className="border-b border-alert/20 px-5 py-3">
                <p className="flex items-center gap-2 font-display text-sm font-extrabold text-alert">
                  <ShieldAlert className="h-4 w-4" /> Danger zone
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-b border-alert/20 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">
                    {school.status === 'SUSPENDED' ? 'Restore the tenant' : 'Suspend the tenant'}
                  </p>
                  <p className="mt-0.5 text-sm text-slatesoft">
                    {school.status === 'SUSPENDED'
                      ? 'Users regain access immediately and billing resumes.'
                      : 'Every user loses access immediately. Data is kept and it can be restored at any time.'}
                  </p>
                </div>
                <button type="button" onClick={() => setDialog(school.status === 'SUSPENDED' ? 'restore' : 'suspend')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                    school.status === 'SUSPENDED'
                      ? 'bg-brand text-white hover:bg-brand-deep'
                      : 'border border-alert/40 bg-white text-alert hover:bg-alert/10'
                  }`}>
                  {school.status === 'SUSPENDED' ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  {school.status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">Raise a deletion request</p>
                  <p className="mt-0.5 text-sm text-slatesoft">
                    Nothing is destroyed here. This queues the tenant for deletion, which forces a full data export first.
                  </p>
                </div>
                <button type="button" onClick={() => setDialog('delete')}
                  className="inline-flex items-center gap-2 rounded-xl border border-alert/40 bg-white px-4 py-2 text-sm font-bold text-alert transition hover:bg-alert/10">
                  <Trash2 className="h-4 w-4" /> Request deletion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── activity ── */}
        {tab === 'activity' && (
          <div className="p-5">
            {activity.length === 0 ? (
              <EmptyState icon={<Timer className="h-6 w-6" />} title="No recorded activity"
                description="Administrative actions against this tenant will appear here." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[620px] border-collapse">
                  <thead className="border-b border-line bg-surfaceinset/40">
                    <tr><Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Target</Th><Th>Severity</Th></tr>
                  </thead>
                  <tbody>
                    {activity.map((a) => (
                      <tr key={a.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-2.5 text-xs text-slatesoft">{dateTime(a.at)}</td>
                        <td className="px-4 py-2.5 text-sm text-ink">{a.actor}</td>
                        <td className="px-4 py-2.5"><span className="font-mono text-xs text-ocean">{a.action}</span></td>
                        <td className="px-4 py-2.5 text-sm text-slatesoft">{a.target}</td>
                        <td className="px-4 py-2.5"><Badge tone={SEVERITY_TONE[a.severity]}>{a.severity}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={dialog === 'suspend'}
        title="Suspend this tenant?"
        message="Every user loses access immediately and billing stops. Data is untouched."
        confirmLabel="Suspend tenant"
        busy={busy}
        requireText={school.code}
        onCancel={() => setDialog(null)}
        onConfirm={run}
      />
      <ConfirmDialog
        open={dialog === 'restore'}
        title="Restore this tenant?"
        message="Users regain access straight away and the plan resumes from today."
        confirmLabel="Restore"
        tone="brand"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={run}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        title="Raise a deletion request?"
        message="This queues the tenant for deletion. A full data export must complete before anything is destroyed, and a second confirmation is required."
        confirmLabel="Raise request"
        busy={busy}
        requireText={school.code}
        onCancel={() => setDialog(null)}
        onConfirm={run}
      />

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default SchoolDetailPage;

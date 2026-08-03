/**
 * Demo requests — the approval inbox.
 *
 * Two panes: the queue on the left, the full submission on the right. Approving
 * opens the school-admin details and an editable note; declining offers preset
 * reasons that compose an editable paragraph so nobody has to write the same
 * rejection twice.
 *
 * Data: reads `demoRequests` from platform/data/mock.
 * Blocking endpoint: GET /demo/pending — approve and reject already exist at
 * POST /demo/approve/{uuid} and POST /demo/reject/{uuid}, but nothing lists the
 * queue, so this screen cannot run on live data yet.
 *
 * Security note carried from the build plan: /demo/** is currently permitAll(),
 * which includes the approve endpoint. Submit stays public; approve and reject
 * must move behind authentication and a platform-role check.
 */
import React, { useMemo, useState } from 'react';
import {
  Inbox, Check, X, Clock, Building2, User, Phone, Mail, MapPin, Users2,
  ShieldCheck, AlertTriangle, Search, Send, RefreshCw,
} from 'lucide-react';
import {
  PageHeader, SectionCard, StatCard, Badge, EmptyState, Toast, useToast, DemoChip,
  TextInput, TextArea, Field,
} from '../../../shared/ui';
import { demoRequests, MockDemoRequest } from '../data/mock';
import { timeAgo, untilLabel, dateTime, initials, tintFor, toSubdomain, toCode } from '../format';

const DECLINE_REASONS = [
  { key: 'duplicate', label: 'Duplicate request', text: 'we already have an active account or an open request for this school' },
  { key: 'unverified', label: 'School could not be verified', text: 'we were unable to verify the school against the EIIN register' },
  { key: 'incomplete', label: 'Incomplete contact details', text: 'the contact details supplied were incomplete, so we could not reach anyone to confirm the request' },
  { key: 'outofscope', label: 'Outside our coverage', text: 'the institution type falls outside what ShikkhaERP currently supports' },
  { key: 'spam', label: 'Looks like spam or a test', text: 'the submission appears to be a test or an automated entry rather than a genuine enquiry' },
];

export const DemoRequestsPage: React.FC = () => {
  const { toast, notify, clear } = useToast();

  const [rows, setRows] = useState<MockDemoRequest[]>(demoRequests);
  const [selectedId, setSelectedId] = useState<string>(demoRequests[0]?.uuid ?? '');
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const [query, setQuery] = useState('');

  const [mode, setMode] = useState<'idle' | 'approve' | 'decline'>('idle');
  const [busy, setBusy] = useState(false);

  // approve form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [mustChange, setMustChange] = useState(true);
  const [approvalNote, setApprovalNote] = useState('');

  // decline form
  const [reasons, setReasons] = useState<Set<string>>(new Set());
  const [declineText, setDeclineText] = useState('');
  const [declineTouched, setDeclineTouched] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'PENDING' && r.status !== 'PENDING') return false;
      if (!q) return true;
      return r.schoolName.toLowerCase().includes(q) || r.requesterName.toLowerCase().includes(q) || r.schoolEmail.toLowerCase().includes(q);
    });
  }, [rows, filter, query]);

  const selected = rows.find((r) => r.uuid === selectedId) ?? visible[0];

  const openApprove = (r: MockDemoRequest) => {
    setMode('approve');
    setAdminName(r.requesterName);
    setAdminEmail(r.schoolEmail);
    setMustChange(true);
    setApprovalNote(
      `Welcome to ShikkhaERP. Your school "${r.schoolName}" has been approved and a 30-day trial is now active. ` +
      `Use the link in this email to set your password and sign in for the first time.`,
    );
  };

  const openDecline = () => {
    setMode('decline');
    setReasons(new Set());
    setDeclineText('');
    setDeclineTouched(false);
  };

  const toggleReason = (key: string) => {
    const next = new Set(reasons);
    next.has(key) ? next.delete(key) : next.add(key);
    setReasons(next);
    if (!declineTouched && selected) {
      const picked = DECLINE_REASONS.filter((d) => next.has(d.key));
      setDeclineText(
        picked.length === 0
          ? ''
          : `Thank you for your interest in ShikkhaERP. After reviewing the request for ${selected.schoolName}, ` +
            `we are unable to proceed at this time because ${picked.map((p) => p.text).join(', and ')}. ` +
            `If this is a mistake, please reply to this email and we will take another look.`,
      );
    }
  };

  const approve = () => {
    if (!selected) return;
    setBusy(true);
    // MOCK: POST /demo/approve/{uuid}
    setTimeout(() => {
      setRows((p) => p.map((r) => (r.uuid === selected.uuid ? { ...r, status: 'APPROVED' } : r)));
      notify(`${selected.schoolName} approved — setup email sent to ${adminEmail}`);
      setBusy(false);
      setMode('idle');
    }, 800);
  };

  const decline = () => {
    if (!selected) return;
    setBusy(true);
    // MOCK: POST /demo/reject/{uuid}
    setTimeout(() => {
      setRows((p) => p.map((r) => (r.uuid === selected.uuid ? { ...r, status: 'REJECTED' } : r)));
      notify(`${selected.schoolName} declined`, 'danger');
      setBusy(false);
      setMode('idle');
    }, 800);
  };

  const pending = rows.filter((r) => r.status === 'PENDING');
  const expiringSoon = pending.filter((r) => {
    const d = Math.ceil((new Date(r.expiresAt).getTime() - Date.now()) / 86_400_000);
    return d <= 2;
  }).length;

  return (
    <>
      <PageHeader
        title="Demo requests"
        subtitle="Schools that asked for a trial. Approving creates the tenant and its school admin."
        icon={<Inbox className="h-5 w-5" />}
        actions={
          <>
            <DemoChip label="Needs GET /demo/pending" />
            <button type="button" onClick={() => notify('Queue refreshed')}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Awaiting review" value={pending.length} icon={<Inbox className="h-5 w-5" />}
          hint="Each request expires seven days after submission" />
        <StatCard label="Expiring within 48h" value={expiringSoon} accent="bg-alert/10 text-alert"
          icon={<Clock className="h-5 w-5" />} hint="Review these first" />
        <StatCard label="Approved" value={rows.filter((r) => r.status === 'APPROVED').length}
          accent="bg-success/10 text-success" icon={<Check className="h-5 w-5" />} hint="Records kept for audit" />
        <StatCard label="Declined" value={rows.filter((r) => r.status === 'REJECTED').length}
          accent="bg-warning/15 text-[#8A5A00]" icon={<X className="h-5 w-5" />} hint="Reason stored with each" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        {/* ── queue ── */}
        <SectionCard flush className="h-fit">
          <div className="border-b border-line bg-surfaceinset/60 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slatesoft" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the queue…"
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-ocean focus:shadow-glow" />
            </div>
            <div className="mt-2 flex gap-1 rounded-xl bg-white p-1">
              {(['PENDING', 'ALL'] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFilter(f)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    filter === f ? 'bg-brand text-white' : 'text-slatesoft hover:text-ink'
                  }`}>
                  {f === 'PENDING' ? `Pending (${pending.length})` : `All (${rows.length})`}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon={<Inbox className="h-6 w-6" />} title="Inbox zero"
              description="No requests are waiting. New submissions from the marketing site land here." />
          ) : (
            <ul className="max-h-[640px] divide-y divide-line overflow-y-auto">
              {visible.map((r) => {
                const on = selected?.uuid === r.uuid;
                const daysLeft = Math.ceil((new Date(r.expiresAt).getTime() - Date.now()) / 86_400_000);
                return (
                  <li key={r.uuid}>
                    <button type="button"
                      onClick={() => { setSelectedId(r.uuid); setMode('idle'); }}
                      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition ${
                        on ? 'bg-softblue/30' : 'hover:bg-surfaceinset/60'
                      }`}>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-xs font-extrabold ${tintFor(r.schoolName)}`}>
                        {initials(r.schoolName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{r.schoolName}</span>
                        <span className="block truncate text-xs text-slatesoft">{r.requesterName} · {r.requesterRole}</span>
                        <span className="mt-1 flex items-center gap-2">
                          {r.status === 'PENDING' ? (
                            <Badge tone={daysLeft <= 2 ? 'danger' : 'warning'}>{untilLabel(r.expiresAt)}</Badge>
                          ) : (
                            <Badge tone={r.status === 'APPROVED' ? 'success' : 'neutral'}>
                              {r.status === 'APPROVED' ? 'Approved' : 'Declined'}
                            </Badge>
                          )}
                          <span className="text-[11px] text-slatesoft">{timeAgo(r.submittedAt)}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        {/* ── detail ── */}
        {!selected ? (
          <SectionCard>
            <EmptyState icon={<Inbox className="h-6 w-6" />} title="Nothing selected"
              description="Pick a request from the queue to see the full submission." />
          </SectionCard>
        ) : (
          <div className="space-y-5">
            <SectionCard>
              <div className="flex flex-wrap items-start gap-4">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-extrabold ${tintFor(selected.schoolName)}`}>
                  {initials(selected.schoolName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-xl font-extrabold text-ink">{selected.schoolName}</h2>
                    {selected.status === 'PENDING'
                      ? <Badge tone="warning" dot>Awaiting review</Badge>
                      : <Badge tone={selected.status === 'APPROVED' ? 'success' : 'neutral'} dot>
                          {selected.status === 'APPROVED' ? 'Approved' : 'Declined'}
                        </Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slatesoft">
                    Submitted {dateTime(selected.submittedAt)} · {untilLabel(selected.expiresAt)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-ocean">{selected.uuid}</p>
                </div>

                {selected.status === 'PENDING' && mode === 'idle' && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={openDecline}
                      className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-alert hover:text-alert">
                      <X className="h-4 w-4" /> Decline
                    </button>
                    <button type="button" onClick={() => openApprove(selected)}
                      className="inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-signal-deep">
                      <Check className="h-4 w-4" /> Approve & create
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-8 border-t border-line pt-5 lg:grid-cols-2">
                {[
                  ['School name', selected.schoolName, <Building2 className="h-4 w-4" key="a" />],
                  ['Address', selected.schoolAddress, <MapPin className="h-4 w-4" key="b" />],
                  ['School phone', selected.schoolPhone, <Phone className="h-4 w-4" key="c" />],
                  ['School email', selected.schoolEmail, <Mail className="h-4 w-4" key="d" />],
                  ['Requested by', `${selected.requesterName} — ${selected.requesterRole}`, <User className="h-4 w-4" key="e" />],
                  ['Requester phone', selected.requesterPhone, <Phone className="h-4 w-4" key="f" />],
                  ['Expected students', selected.studentCount, <Users2 className="h-4 w-4" key="g" />],
                  ['Suggested subdomain', `${toSubdomain(selected.schoolName)}.shikkha.app`, <Building2 className="h-4 w-4" key="h" />],
                ].map(([label, value, icon]: any) => (
                  <div key={label} className="flex items-start gap-3 border-b border-line py-3">
                    <span className="mt-0.5 text-slatesoft">{icon}</span>
                    <div className="min-w-0 flex-1">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">{label}</dt>
                      <dd className="mt-0.5 break-words text-sm font-medium text-ink">{value}</dd>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── approve panel ── */}
            {mode === 'approve' && (
              <SectionCard title="Approve and create the tenant"
                description="Check the admin details before confirming. Nothing is created until you press the button.">
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                  <Field label="School admin name" required>
                    <TextInput value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                  </Field>
                  <Field label="School admin email" required hint="Their login and where the setup link goes.">
                    <TextInput type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                  </Field>

                  <Field label="Tenant code" hint="Suggested from the school name.">
                    <TextInput className="font-mono" defaultValue={toCode(selected.schoolName)} />
                  </Field>
                  <Field label="Subdomain">
                    <TextInput className="font-mono" defaultValue={toSubdomain(selected.schoolName)} />
                  </Field>

                  <Field label="Message in the approval email" span={2}>
                    <TextArea rows={4} value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} />
                  </Field>
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surfaceinset/50 p-4">
                  <input type="checkbox" checked={mustChange} onChange={() => setMustChange((m) => !m)}
                    className="mt-0.5 h-4 w-4 rounded border-linestrong accent-[#034078]" />
                  <span>
                    <span className="block text-sm font-bold text-ink">Require a password change on first login</span>
                    <span className="block text-sm text-slatesoft">
                      The account is created at PENDING_VERIFICATION and the setup link is single-use.
                    </span>
                  </span>
                </label>

                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-ocean/30 bg-softblue/25 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <p className="text-sm text-slatesoft">
                    This creates a <b className="text-ink">SCHOOL_ADMIN</b> with a <code className="font-mono text-[11px]">school_id</code> pointing at
                    the new tenant. It must never create a SUPER_ADMIN — that was the bug in
                    <code className="mx-1 font-mono text-[11px]">DemoService.approveRequest()</code>.
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => setMode('idle')}
                    className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-surfaceinset">
                    Cancel
                  </button>
                  <button type="button" onClick={approve} disabled={busy || !adminEmail}
                    className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-signal-deep disabled:opacity-60">
                    <Check className="h-4 w-4" /> {busy ? 'Creating…' : 'Confirm & create'}
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ── decline panel ── */}
            {mode === 'decline' && (
              <SectionCard title="Decline this request"
                description="Pick the reasons and the message writes itself — edit it however you like.">
                <div className="space-y-2">
                  {DECLINE_REASONS.map((d) => (
                    <label key={d.key}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        reasons.has(d.key) ? 'border-brand bg-brand/5' : 'border-line bg-white hover:border-ocean'
                      }`}>
                      <input type="checkbox" checked={reasons.has(d.key)} onChange={() => toggleReason(d.key)}
                        className="mt-0.5 h-4 w-4 rounded border-linestrong accent-[#034078]" />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-ink">{d.label}</span>
                        <span className="block text-xs text-slatesoft">…because {d.text}.</span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-4">
                  <Field label="Message sent to the requester" hint="Editing switches off the auto-generated text.">
                    <TextArea rows={5} value={declineText}
                      onChange={(e) => { setDeclineText(e.target.value); setDeclineTouched(true); }}
                      placeholder="Pick a reason above, or write your own message." />
                  </Field>
                  {declineTouched && (
                    <button type="button" onClick={() => { setDeclineTouched(false); toggleReason(''); }}
                      className="mt-2 text-xs font-bold text-ocean hover:text-brand">
                      Regenerate from the selected reasons
                    </button>
                  )}
                </div>

                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/10 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#8A5A00]" />
                  <p className="text-sm text-slatesoft">
                    The record is kept rather than deleted, so declined requests stay in the audit trail.
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => setMode('idle')}
                    className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-surfaceinset">
                    Cancel
                  </button>
                  <button type="button" onClick={decline} disabled={busy || !declineText.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-alert px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-[#B3264B] disabled:opacity-60">
                    <Send className="h-4 w-4" /> {busy ? 'Sending…' : 'Confirm & decline'}
                  </button>
                </div>
              </SectionCard>
            )}
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default DemoRequestsPage;

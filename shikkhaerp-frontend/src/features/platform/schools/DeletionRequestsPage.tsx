/**
 * Deletion requests — schools asking to leave.
 *
 * Deletion is gated in three stages on purpose: you must see what would be
 * destroyed, a full data export must have completed, and only then does the
 * confirm dialog unlock, which additionally requires typing the tenant code.
 *
 * Data: reads `deletionRequests` and `schools` from platform/data/mock.
 * Needs DELETE /schools/{id} and POST /schools/{id}/export before it is live.
 */
import React, { useMemo, useState } from 'react';
import {
  Trash2, ShieldAlert, Download, Check, X, Database, Users2, GraduationCap,
  FileText, Wallet, Clock, AlertTriangle, Building2,
} from 'lucide-react';
import {
  PageHeader, SectionCard, StatCard, Badge, BadgeTone, EmptyState, Th,
  ConfirmDialog, Toast, useToast, DemoChip,
} from '../../../shared/ui';
import { deletionRequests, schools } from '../../../platform/data/mock';
import { timeAgo, dateTime, taka, initials, tintFor } from '../format';

const STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: 'warning', COMPLETED: 'neutral', CANCELLED: 'neutral',
};

type Request = (typeof deletionRequests)[number] & { exportReady: boolean; status: string };

export const DeletionRequestsPage: React.FC = () => {
  const { toast, notify, clear } = useToast();

  const [rows, setRows] = useState<Request[]>(deletionRequests as Request[]);
  const [openId, setOpenId] = useState<string | null>(deletionRequests[0]?.id ?? null);
  const [confirming, setConfirming] = useState<Request | null>(null);
  const [cancelling, setCancelling] = useState<Request | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pending = rows.filter((r) => r.status === 'PENDING');

  const schoolFor = (code: string) => schools.find((s) => s.code === code);

  /* MOCK: POST /schools/{id}/export then poll until the archive is ready. */
  const runExport = (r: Request) => {
    setExporting(r.id);
    setTimeout(() => {
      setRows((p) => p.map((x) => (x.id === r.id ? { ...x, exportReady: true } : x)));
      setExporting(null);
      notify(`Export ready for ${r.school} — archive kept for 30 days`);
    }, 1400);
  };

  /* MOCK: DELETE /schools/{id} */
  const destroy = () => {
    if (!confirming) return;
    setBusy(true);
    setTimeout(() => {
      setRows((p) => p.map((x) => (x.id === confirming.id ? { ...x, status: 'COMPLETED' } : x)));
      notify(`${confirming.school} deleted`, 'danger');
      setBusy(false);
      setConfirming(null);
    }, 900);
  };

  const cancel = () => {
    if (!cancelling) return;
    setBusy(true);
    setTimeout(() => {
      setRows((p) => p.map((x) => (x.id === cancelling.id ? { ...x, status: 'CANCELLED' } : x)));
      notify(`Request withdrawn — ${cancelling.school} stays active`);
      setBusy(false);
      setCancelling(null);
    }, 600);
  };

  const totals = useMemo(() => {
    const affected = pending.map((r) => schoolFor(r.code)).filter(Boolean);
    return {
      pending: pending.length,
      students: affected.reduce((a, s) => a + (s?.students ?? 0), 0),
      mrr: affected.reduce((a, s) => a + (s?.mrr ?? 0), 0),
      awaitingExport: pending.filter((r) => !r.exportReady).length,
    };
  }, [pending]);

  return (
    <>
      <PageHeader
        title="Deletion requests"
        subtitle="Schools that asked to leave. Nothing is destroyed until an export has completed."
        icon={<Trash2 className="h-5 w-5" />}
        actions={<DemoChip />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open requests" value={totals.pending} icon={<Trash2 className="h-5 w-5" />}
          hint="Awaiting review or export" />
        <StatCard label="Students affected" value={totals.students.toLocaleString('en-IN')}
          accent="bg-warning/15 text-[#8A5A00]" icon={<GraduationCap className="h-5 w-5" />}
          hint="Records that would be destroyed" />
        <StatCard label="Revenue at stake" value={taka(totals.mrr)} accent="bg-alert/10 text-alert"
          icon={<Wallet className="h-5 w-5" />} hint="Monthly recurring, if all complete" />
        <StatCard label="Awaiting export" value={totals.awaitingExport} accent="bg-ocean/15 text-ocean"
          icon={<Download className="h-5 w-5" />} hint="Blocked until the archive is built" />
      </div>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<Trash2 className="h-6 w-6" />} title="No deletion requests"
            description="Schools asking to leave will queue here for review." />
        </SectionCard>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const school = schoolFor(r.code);
            const open = openId === r.id;
            const isPending = r.status === 'PENDING';

            return (
              <SectionCard key={r.id} flush className={isPending ? 'border-alert/30' : ''}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left transition hover:bg-surfaceinset/40"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold ${tintFor(r.code)}`}>
                    {initials(r.school)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-extrabold text-ink">{r.school}</span>
                      <span className="font-mono text-[11px] text-ocean">{r.code}</span>
                      <Badge tone={STATUS_TONE[r.status]} dot>
                        {r.status === 'PENDING' ? 'Awaiting action' : r.status === 'COMPLETED' ? 'Deleted' : 'Withdrawn'}
                      </Badge>
                      {isPending && (
                        <Badge tone={r.exportReady ? 'success' : 'warning'}>
                          {r.exportReady ? 'Export ready' : 'Export required'}
                        </Badge>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-sm text-slatesoft">{r.reason}</span>
                    <span className="mt-0.5 block text-[11px] text-slatesoft">
                      Requested by {r.requestedBy} · {timeAgo(r.requestedAt)}
                    </span>
                  </span>

                  <span className="text-xs font-bold text-ocean">{open ? 'Hide detail' : 'Review'}</span>
                </button>

                {open && (
                  <div className="border-t border-line p-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      {/* what would be destroyed */}
                      <div className="rounded-2xl border border-alert/30 bg-alert/5 p-5">
                        <p className="flex items-center gap-2 font-display text-sm font-extrabold text-alert">
                          <ShieldAlert className="h-4 w-4" /> What would be destroyed
                        </p>
                        <ul className="mt-3 space-y-2.5">
                          {[
                            { icon: <GraduationCap className="h-4 w-4" />, label: 'Student records', value: (school?.students ?? 0).toLocaleString('en-IN') },
                            { icon: <Users2 className="h-4 w-4" />, label: 'Staff and logins', value: (school?.teachers ?? 0) + 4 },
                            { icon: <FileText className="h-4 w-4" />, label: 'Attendance, exams and results', value: 'Full history' },
                            { icon: <Wallet className="h-4 w-4" />, label: 'Fee invoices and payments', value: 'Full history' },
                            { icon: <Database className="h-4 w-4" />, label: 'Uploaded files', value: `${((school?.storageMb ?? 0) / 1024).toFixed(2)} GB` },
                            { icon: <Building2 className="h-4 w-4" />, label: 'Subdomain', value: school ? `${school.subdomain}.shikkha.app` : '—' },
                          ].map((it) => (
                            <li key={it.label} className="flex items-center gap-3 border-b border-alert/15 pb-2.5 last:border-0 last:pb-0">
                              <span className="text-alert">{it.icon}</span>
                              <span className="min-w-0 flex-1 text-sm text-slatesoft">{it.label}</span>
                              <span className="font-display text-sm font-extrabold text-ink">{it.value}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-xs text-slatesoft">
                          Deletion is irreversible. Audit-log entries referencing this tenant are retained.
                        </p>
                      </div>

                      {/* the gate */}
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-line bg-white p-5">
                          <p className="font-display text-sm font-extrabold text-ink">Request detail</p>
                          <dl className="mt-3">
                            {[
                              ['Requested by', r.requestedBy],
                              ['Submitted', dateTime(r.requestedAt)],
                              ['Stated reason', r.reason],
                              ['Current plan', school ? `${school.plan[0]}${school.plan.slice(1).toLowerCase()} · ${school.mrr ? taka(school.mrr) + '/mo' : 'not billing'}` : '—'],
                              ['Last activity', school ? timeAgo(school.lastActive) : '—'],
                            ].map(([k, v]) => (
                              <div key={k} className="flex items-start gap-3 border-b border-line py-2.5 last:border-0">
                                <dt className="w-32 shrink-0 text-[11px] font-bold uppercase tracking-wide text-slatesoft">{k}</dt>
                                <dd className="min-w-0 break-words text-sm font-medium text-ink">{v}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>

                        {isPending && (
                          <div className="rounded-2xl border border-line bg-white p-5">
                            <p className="font-display text-sm font-extrabold text-ink">Step 1 — export their data</p>
                            <p className="mt-1 text-sm text-slatesoft">
                              A complete archive is built and emailed to the requester. Deletion stays locked until it finishes.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={() => runExport(r)}
                                disabled={r.exportReady || exporting === r.id}
                                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand disabled:opacity-50"
                              >
                                <Download className="h-4 w-4" />
                                {r.exportReady ? 'Export complete' : exporting === r.id ? 'Building archive…' : 'Build export'}
                              </button>
                              {r.exportReady && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success">
                                  <Check className="h-4 w-4" /> Archive ready · 30-day retention
                                </span>
                              )}
                              {exporting === r.id && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slatesoft">
                                  <Clock className="h-4 w-4 animate-pulse" /> This takes a moment on a large tenant
                                </span>
                              )}
                            </div>

                            <p className="mt-5 font-display text-sm font-extrabold text-ink">Step 2 — decide</p>
                            <p className="mt-1 text-sm text-slatesoft">
                              Withdrawing keeps the tenant exactly as it is. Deleting asks for the tenant code first.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <button type="button" onClick={() => setCancelling(r)}
                                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand">
                                <X className="h-4 w-4" /> Withdraw request
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirming(r)}
                                disabled={!r.exportReady}
                                title={r.exportReady ? undefined : 'Build the export first'}
                                className="inline-flex items-center gap-2 rounded-xl bg-alert px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-[#B3264B] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" /> Delete tenant
                              </button>
                            </div>
                            {!r.exportReady && (
                              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#8A5A00]">
                                <AlertTriangle className="h-3.5 w-3.5" /> Deletion is locked until the export completes.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Delete this tenant permanently?"
        message={
          <>
            Every record belonging to <b className="text-ink">{confirming?.school}</b> is destroyed: students, staff,
            attendance, results, invoices and files. The exported archive remains available for 30 days. This cannot
            be undone.
          </>
        }
        confirmLabel="Delete permanently"
        busy={busy}
        requireText={confirming?.code}
        onCancel={() => setConfirming(null)}
        onConfirm={destroy}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        title="Withdraw this request?"
        message="The tenant stays exactly as it is and the request is closed. The school can ask again at any time."
        confirmLabel="Withdraw request"
        tone="brand"
        busy={busy}
        onCancel={() => setCancelling(null)}
        onConfirm={cancel}
      />

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default DeletionRequestsPage;

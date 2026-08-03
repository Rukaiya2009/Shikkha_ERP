/**
 * All schools — every tenant on the platform.
 *
 * Search, filter by plan / status / district, sort any column, select rows for
 * bulk actions, export the filtered set, and run the lifecycle actions from the
 * row menu: open, suspend, restore, extend the trial.
 *
 * Data: reads `schools` from platform/data/mock. When
 * GET /v1/dashboard/superadmin/schools is paginated and PATCH
 * /schools/{id}/status exists, swap the two marked blocks.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Eye, Ban, RotateCcw, CalendarClock, ArrowUpRight, SearchX,
  Users2, Wallet, Timer, ExternalLink,
} from 'lucide-react';
import {
  PageHeader, SectionCard, StatCard, Badge, BadgeTone, EmptyState, SkeletonRows,
  TableToolbar, FilterSelect, SortHeader, Th, RowMenu, BulkBar, RowCheckbox,
  Pagination, downloadCsv, ConfirmDialog, Toast, useToast, DemoChip, SortDir,
} from '../../../shared/ui';
import { schools as SEED, MockSchool, trialDaysLeft } from '../data/mock';
import { taka, timeAgo, initials, tintFor } from '../format';

export const PLAN_TONE: Record<string, BadgeTone> = {
  TRIAL: 'warning', BASIC: 'neutral', PREMIUM: 'info', ENTERPRISE: 'purple',
};

export const STATUS_TONE: Record<string, BadgeTone> = {
  ACTIVE: 'success', TRIAL: 'info', SUSPENDED: 'danger', PENDING: 'warning',
};

/** Trial runway as a coloured bar — the churn signal at a glance. */
export const RunwayBar: React.FC<{ school: MockSchool }> = ({ school }) => {
  const days = trialDaysLeft(school);
  if (days === null) {
    return <span className="text-xs font-semibold text-slatesoft">On a paid plan</span>;
  }
  const pct = Math.max(4, Math.min(100, (days / 30) * 100));
  const tone = days <= 3 ? 'bg-alert' : days <= 10 ? 'bg-warning' : 'bg-success';
  const text = days <= 3 ? 'text-alert' : days <= 10 ? 'text-[#8A5A00]' : 'text-success';
  return (
    <div className="flex items-center gap-2">
      <span className={`font-display text-sm font-extrabold ${text}`}>
        {days <= 0 ? 'expired' : `${days}d`}
      </span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
};

type Dialog =
  | { kind: 'suspend' | 'restore'; school: MockSchool }
  | { kind: 'extend'; school: MockSchool }
  | { kind: 'bulk-suspend'; ids: string[] }
  | null;

export const SchoolsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, notify, clear } = useToast();

  const [rows, setRows] = useState<MockSchool[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [district, setDistrict] = useState('');

  const [sort, setSort] = useState('name');
  const [dir, setDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<Dialog>(null);
  const [extendDays, setExtendDays] = useState('14');
  const [busy, setBusy] = useState(false);

  /* MOCK: stands in for GET /v1/dashboard/superadmin/schools */
  useEffect(() => {
    const t = setTimeout(() => { setRows(SEED); setLoading(false); }, 420);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [debounced, plan, status, district, pageSize]);

  const districts = useMemo(
    () => [...new Set(SEED.map((s) => s.district))].sort(),
    [],
  );

  const filtered = useMemo(
    () => rows.filter((s) => {
      if (plan && s.plan !== plan) return false;
      if (status && s.status !== status) return false;
      if (district && s.district !== district) return false;
      if (!debounced) return true;
      return (
        s.name.toLowerCase().includes(debounced) ||
        s.code.toLowerCase().includes(debounced) ||
        s.subdomain.includes(debounced) ||
        s.adminEmail.toLowerCase().includes(debounced)
      );
    }),
    [rows, debounced, plan, status, district],
  );

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case 'students': cmp = a.students - b.students; break;
        case 'teachers': cmp = a.teachers - b.teachers; break;
        case 'mrr': cmp = a.mrr - b.mrr; break;
        case 'plan': cmp = a.plan.localeCompare(b.plan); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'runway': cmp = (trialDaysLeft(a) ?? 9999) - (trialDaysLeft(b) ?? 9999); break;
        case 'lastActive': cmp = +new Date(a.lastActive) - +new Date(b.lastActive); break;
        default: cmp = a.name.localeCompare(b.name);
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [filtered, sort, dir]);

  const paged = useMemo(
    () => sorted.slice(page * pageSize, page * pageSize + pageSize),
    [sorted, page, pageSize],
  );

  const totals = useMemo(() => ({
    count: filtered.length,
    active: filtered.filter((s) => s.status === 'ACTIVE').length,
    trials: filtered.filter((s) => s.status === 'TRIAL').length,
    students: filtered.reduce((a, s) => a + s.students, 0),
    mrr: filtered.reduce((a, s) => a + s.mrr, 0),
    atRisk: filtered.filter((s) => { const d = trialDaysLeft(s); return d !== null && d <= 7; }).length,
  }), [filtered]);

  const onSort = (f: string) => {
    if (f === sort) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSort(f); setDir('asc'); }
  };

  const pageIds = paged.map((s) => s.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allOnPage) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  /* MOCK: replace with PATCH /schools/{id}/status */
  const run = () => {
    if (!dialog) return;
    setBusy(true);
    setTimeout(() => {
      if (dialog.kind === 'suspend') {
        setRows((p) => p.map((s) => (s.id === dialog.school.id ? { ...s, status: 'SUSPENDED', mrr: 0 } : s)));
        notify(`${dialog.school.name} suspended`);
      } else if (dialog.kind === 'restore') {
        setRows((p) => p.map((s) => (s.id === dialog.school.id ? { ...s, status: 'ACTIVE' } : s)));
        notify(`${dialog.school.name} restored`);
      } else if (dialog.kind === 'extend') {
        const days = Number(extendDays) || 0;
        setRows((p) => p.map((s) => (s.id === dialog.school.id
          ? { ...s, trialEnd: new Date(Date.now() + days * 86_400_000).toISOString() }
          : s)));
        notify(`Trial extended by ${days} days`);
      } else if (dialog.kind === 'bulk-suspend') {
        setRows((p) => p.map((s) => (dialog.ids.includes(s.id) ? { ...s, status: 'SUSPENDED', mrr: 0 } : s)));
        notify(`${dialog.ids.length} schools suspended`);
        setSelected(new Set());
      }
      setBusy(false);
      setDialog(null);
    }, 500);
  };

  const exportCsv = () => {
    downloadCsv(
      `schools-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'code', label: 'Code' }, { key: 'name', label: 'School' },
        { key: 'subdomain', label: 'Subdomain' }, { key: 'district', label: 'District' },
        { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' },
        { key: 'students', label: 'Students' }, { key: 'teachers', label: 'Teachers' },
        { key: 'runway', label: 'Trial days left' }, { key: 'mrr', label: 'MRR (BDT)' },
        { key: 'admin', label: 'Admin' }, { key: 'adminEmail', label: 'Admin email' },
      ],
      sorted.map((s) => ({ ...s, runway: trialDaysLeft(s) ?? '' })),
    );
    notify(`Exported ${sorted.length} tenants`);
  };

  const anyFilter = Boolean(debounced || plan || status || district);
  const reset = () => { setSearch(''); setPlan(''); setStatus(''); setDistrict(''); };

  return (
    <>
      <PageHeader
        title="All schools"
        subtitle="Every tenant on ShikkhaERP, with its plan, runway and revenue."
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <>
            <DemoChip />
            <button
              type="button"
              onClick={() => navigate('/platform/schools/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep"
            >
              <Plus className="h-4 w-4" /> Add a school
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tenants shown" value={totals.count} icon={<Building2 className="h-5 w-5" />}
          hint={`${totals.active} active · ${totals.trials} on trial`} />
        <StatCard label="Students served" value={totals.students.toLocaleString('en-IN')}
          accent="bg-teal/10 text-teal" icon={<Users2 className="h-5 w-5" />} hint="Across the filtered tenants" />
        <StatCard label="Monthly recurring" value={taka(totals.mrr)}
          accent="bg-success/10 text-success" icon={<Wallet className="h-5 w-5" />} hint="Sum of plan value" />
        <StatCard label="Trials at risk" value={totals.atRisk}
          accent="bg-alert/10 text-alert" icon={<Timer className="h-5 w-5" />} hint="Seven days or fewer left" />
      </div>

      <SectionCard flush>
        <TableToolbar
          search={search} onSearch={setSearch}
          placeholder="Search by school, code, subdomain or admin email…"
          pageSize={pageSize} onPageSize={setPageSize} onExport={exportCsv}
        >
          <FilterSelect value={plan} onChange={setPlan} options={[
            { value: '', label: 'All plans' },
            ...['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE'].map((p) => ({ value: p, label: p[0] + p.slice(1).toLowerCase() })),
          ]} />
          <FilterSelect value={status} onChange={setStatus} options={[
            { value: '', label: 'All statuses' },
            ...['ACTIVE', 'TRIAL', 'SUSPENDED', 'PENDING'].map((p) => ({ value: p, label: p[0] + p.slice(1).toLowerCase() })),
          ]} />
          <FilterSelect value={district} onChange={setDistrict} options={[
            { value: '', label: 'All districts' },
            ...districts.map((d) => ({ value: d, label: d })),
          ]} />
        </TableToolbar>

        <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
          <button type="button" onClick={() => setDialog({ kind: 'bulk-suspend', ids: [...selected] })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-alert/40 bg-white px-3 py-1.5 text-xs font-bold text-alert transition hover:bg-alert/5">
            <Ban className="h-3.5 w-3.5" /> Suspend
          </button>
          <button type="button" onClick={() => { notify(`Announcement targeted at ${selected.size} tenants`); setSelected(new Set()); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-linestrong bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-ocean">
            Send announcement
          </button>
        </BulkBar>

        {loading ? (
          <div className="p-5"><SkeletonRows rows={6} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={anyFilter ? <SearchX className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
            title={anyFilter ? 'No tenants match those filters' : 'No schools yet'}
            description={anyFilter ? 'Try a different plan, status or district.' : 'Approve a demo request or onboard a school manually.'}
            action={
              anyFilter ? (
                <button type="button" onClick={reset}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand">
                  Clear filters
                </button>
              ) : (
                <button type="button" onClick={() => navigate('/platform/schools/new')}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep">
                  <Plus className="h-4 w-4" /> Add a school
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse">
              <thead className="border-b border-line bg-surfaceinset/40">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <RowCheckbox checked={allOnPage} indeterminate={someOnPage} onChange={toggleAll} label="Select all on page" />
                  </th>
                  <SortHeader label="School" field="name" active={sort} dir={dir} onSort={onSort} />
                  <Th>Subdomain</Th>
                  <SortHeader label="Plan" field="plan" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Status" field="status" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Students" field="students" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Runway" field="runway" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="MRR" field="mrr" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Last active" field="lastActive" active={sort} dir={dir} onSort={onSort} />
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.map((s) => (
                  <tr key={s.id}
                    className={`border-b border-line transition last:border-0 hover:bg-surfaceinset/50 ${selected.has(s.id) ? 'bg-softblue/25' : ''}`}>
                    <td className="px-4 py-3">
                      <RowCheckbox checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} label={`Select ${s.name}`} />
                    </td>

                    <td className="px-4 py-3">
                      <button type="button" onClick={() => navigate(`/platform/schools/${s.id}`)}
                        className="group flex items-center gap-3 text-left">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-xs font-extrabold ${tintFor(s.code)}`}>
                          {initials(s.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-ink group-hover:text-brand">{s.name}</span>
                          <span className="block font-mono text-[11px] text-slatesoft">{s.code} · {s.district}</span>
                        </span>
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-ocean">
                        {s.subdomain}<span className="text-slatesoft">.shikkha.app</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </span>
                    </td>

                    <td className="px-4 py-3"><Badge tone={PLAN_TONE[s.plan]}>{s.plan[0] + s.plan.slice(1).toLowerCase()}</Badge></td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[s.status]} dot>{s.status[0] + s.status.slice(1).toLowerCase()}</Badge></td>

                    <td className="px-4 py-3">
                      <span className="font-display text-sm font-extrabold text-ink">{s.students.toLocaleString('en-IN')}</span>
                      <span className="mt-0.5 block text-[11px] text-slatesoft">{s.teachers} teachers</span>
                    </td>

                    <td className="px-4 py-3"><RunwayBar school={s} /></td>

                    <td className="px-4 py-3 font-mono text-sm text-ink">{s.mrr ? taka(s.mrr) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-slatesoft">{timeAgo(s.lastActive)}</td>

                    <td className="px-4 py-3 text-right">
                      <RowMenu items={[
                        { label: 'Open tenant', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(`/platform/schools/${s.id}`) },
                        { label: 'Impersonate admin', icon: <ArrowUpRight className="h-4 w-4" />, onClick: () => notify(`Impersonation session would open for ${s.admin}`) },
                        ...(s.trialEnd ? [{ label: 'Extend trial', icon: <CalendarClock className="h-4 w-4" />, onClick: () => { setExtendDays('14'); setDialog({ kind: 'extend', school: s }); }, divider: true }] : []),
                        s.status === 'SUSPENDED'
                          ? { label: 'Restore tenant', icon: <RotateCcw className="h-4 w-4" />, onClick: () => setDialog({ kind: 'restore', school: s }), divider: !s.trialEnd }
                          : { label: 'Suspend tenant', icon: <Ban className="h-4 w-4" />, onClick: () => setDialog({ kind: 'suspend', school: s }), danger: true, divider: !s.trialEnd },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <Pagination page={page} pageSize={pageSize} total={sorted.length} onPage={setPage} />
        )}
      </SectionCard>

      <ConfirmDialog
        open={dialog?.kind === 'suspend'}
        title="Suspend this tenant?"
        message={
          <>
            Every user at <b className="text-ink">{dialog && 'school' in dialog ? dialog.school.name : ''}</b> loses
            access immediately and billing stops. Data is untouched and the tenant can be restored at any time.
          </>
        }
        confirmLabel="Suspend tenant"
        busy={busy}
        requireText={dialog && 'school' in dialog ? dialog.school.code : undefined}
        onCancel={() => setDialog(null)}
        onConfirm={run}
      />

      <ConfirmDialog
        open={dialog?.kind === 'restore'}
        title="Restore this tenant?"
        message="Users regain access straight away and the plan resumes from today."
        confirmLabel="Restore"
        tone="brand"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={run}
      />

      <ConfirmDialog
        open={dialog?.kind === 'bulk-suspend'}
        title={`Suspend ${dialog && 'ids' in dialog ? dialog.ids.length : 0} tenants?`}
        message="Every user across the selected schools loses access immediately. Data is retained."
        confirmLabel="Suspend all"
        busy={busy}
        requireText="SUSPEND"
        onCancel={() => setDialog(null)}
        onConfirm={run}
      />

      {/* Extend trial gets its own body because it takes an input. */}
      {dialog?.kind === 'extend' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-modal">
            <div className="p-6">
              <h3 className="font-display text-lg font-extrabold text-ink">Extend the trial</h3>
              <p className="mt-1.5 text-sm text-slatesoft">
                {dialog.school.name} currently has {trialDaysLeft(dialog.school)} days left. The new end date is
                counted from today, not from the current expiry.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['7', '14', '30', '60'].map((d) => (
                  <button key={d} type="button" onClick={() => setExtendDays(d)}
                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                      extendDays === d ? 'border-brand bg-brand/5 text-brand' : 'border-line bg-white text-ink hover:border-ocean'
                    }`}>
                    {d} days
                  </button>
                ))}
              </div>
              <input
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                className="mt-3 w-full rounded-xl border border-line bg-surfacefield px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ocean focus:bg-white focus:shadow-glow"
                placeholder="Custom number of days"
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-line bg-surfaceinset/60 px-6 py-4">
              <button type="button" onClick={() => setDialog(null)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-surfaceinset">
                Cancel
              </button>
              <button type="button" onClick={run} disabled={busy || !extendDays}
                className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep disabled:opacity-50">
                Extend by {extendDays || 0} days
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default SchoolsListPage;

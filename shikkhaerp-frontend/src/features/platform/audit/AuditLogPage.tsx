/**
 * Audit log — LIVE.
 *
 * Reads AuditController (/audit/recent, /audit/all) and SecurityAuditController
 * (/security/events/recent, /security/events/high-severity). Two tabs because
 * they are two different tables in the database and conflating them would hide
 * whichever has fewer rows.
 *
 * What the backend does not give us, and how this screen handles it:
 *   · no pagination        → bounded ?limit= fetch, paged in memory
 *   · no filter params     → severity / category / actor / date filtered here
 *   · severity often null  → inferred from the action verb (see severityOf)
 *   · actionCategory null  → inferred from the action verb (see categoryOf)
 * The window size is visible in the toolbar so nobody mistakes "500 most
 * recent" for "everything".
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import {
  ScrollText, RefreshCw, AlertTriangle, ShieldAlert, Activity, Users2,
  ChevronDown, ChevronRight, ServerCrash, SearchX, Fingerprint, Globe,
  Monitor, ArrowRight, Info, Zap,
} from 'lucide-react';
import {
  PageHeader, SectionCard, StatCard, Badge, BadgeTone, EmptyState, SkeletonRows,
  TableToolbar, FilterSelect, SortHeader, Th, Pagination, downloadCsv,
  Tabs, TabItem, Toast, useToast, LiveChip, SortDir,
} from '../../../shared/ui';
import {
  auditService, securityService, AuditEntry, SecurityEvent,
  severityOf, categoryOf, actorOf, humanAction, parseAgent, whenOf, diffOf,
  errorMessage, Severity,
} from './audit.service';
import { dateTime, timeAgo, initials, tintFor } from '../format';

const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  CRITICAL: 'danger', WARN: 'warning', INFO: 'neutral',
};

const SEVERITY_BAR: Record<Severity, string> = {
  CRITICAL: '#D8315B', WARN: '#E0A800', INFO: '#3E92CC',
};

const WINDOWS = [
  { value: '200', label: 'Last 200 events' },
  { value: '500', label: 'Last 500 events' },
  { value: '2000', label: 'Last 2,000 events' },
  { value: 'all', label: 'Everything' },
];

/** Activity per day for the last fortnight, from whatever we fetched. */
const dailyBuckets = (rows: (AuditEntry | SecurityEvent)[]) => {
  const days: { day: string; label: string; count: number; critical: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    days.push({
      day: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      count: 0,
      critical: 0,
    });
  }
  const index = new Map(days.map((d) => [d.day, d]));
  rows.forEach((r) => {
    const w = whenOf(r);
    if (!w) return;
    const bucket = index.get(String(w).slice(0, 10));
    if (!bucket) return;
    bucket.count += 1;
    if (severityOf(r as AuditEntry) === 'CRITICAL') bucket.critical += 1;
  });
  return days;
};

export const AuditLogPage: React.FC = () => {
  const { toast, notify, clear } = useToast();

  const [tab, setTab] = useState<'audit' | 'security'>('audit');

  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const [windowSize, setWindowSize] = useState('500');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [severity, setSeverity] = useState('');
  const [category, setCategory] = useState('');
  const [actor, setActor] = useState('');
  const [since, setSince] = useState('');

  const [sort, setSort] = useState('when');
  const [dir, setDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [expanded, setExpanded] = useState<string | null>(null);

  /* ───────────────────────────── fetch ───────────────────────────── */

  const load = useCallback(async (announce = false) => {
    setLoading(true);
    setError(null);
    setEventsError(null);

    // Both tabs load together — one refresh, one spinner, no half-stale screen.
    const [a, e] = await Promise.allSettled([
      windowSize === 'all' ? auditService.all() : auditService.recent(Number(windowSize)),
      windowSize === 'all' ? securityService.allEvents() : securityService.recentEvents(Number(windowSize)),
    ]);

    if (a.status === 'fulfilled') setAudit(a.value);
    else setError(errorMessage(a.reason, 'Could not load the audit log.'));

    if (e.status === 'fulfilled') setEvents(e.value);
    else setEventsError(errorMessage(e.reason, 'Could not load security events.'));

    setFetchedAt(new Date());
    setLoading(false);
    if (announce && a.status === 'fulfilled') notify(`Reloaded — ${a.value.length} audit entries`);
  }, [windowSize, notify]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); setExpanded(null); }, [debounced, severity, category, actor, since, tab, pageSize]);

  /* ──────────────────────────── shaping ──────────────────────────── */

  const rows: AuditEntry[] = useMemo(
    () => (tab === 'audit' ? audit : (events as AuditEntry[])),
    [tab, audit, events],
  );

  const categories = useMemo(
    () => [...new Set(rows.map((r) => categoryOf(r)))].sort(),
    [rows],
  );

  const actors = useMemo(
    () => [...new Set(rows.map((r) => actorOf(r)))].filter(Boolean).sort().slice(0, 60),
    [rows],
  );

  const filtered = useMemo(() => rows.filter((r) => {
    if (severity && severityOf(r) !== severity) return false;
    if (category && categoryOf(r) !== category) return false;
    if (actor && actorOf(r) !== actor) return false;
    if (since) {
      const w = whenOf(r);
      if (!w || String(w).slice(0, 10) < since) return false;
    }
    if (!debounced) return true;
    return [
      r.action, r.resource, r.resourceId, actorOf(r), r.email,
      r.ipAddress, r.status, r.errorMessage, r.notes,
      (r as SecurityEvent).eventType, (r as SecurityEvent).description,
    ].some((v) => v && String(v).toLowerCase().includes(debounced));
  }), [rows, debounced, severity, category, actor, since]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    const rank: Record<Severity, number> = { CRITICAL: 3, WARN: 2, INFO: 1 };
    out.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case 'severity': cmp = rank[severityOf(a)] - rank[severityOf(b)]; break;
        case 'actor': cmp = actorOf(a).localeCompare(actorOf(b)); break;
        case 'action': cmp = String(a.action ?? '').localeCompare(String(b.action ?? '')); break;
        case 'category': cmp = categoryOf(a).localeCompare(categoryOf(b)); break;
        default: cmp = +new Date(whenOf(a) ?? 0) - +new Date(whenOf(b) ?? 0);
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [filtered, sort, dir]);

  const paged = useMemo(
    () => sorted.slice(page * pageSize, page * pageSize + pageSize),
    [sorted, page, pageSize],
  );

  const stats = useMemo(() => {
    const bySeverity = { CRITICAL: 0, WARN: 0, INFO: 0 };
    filtered.forEach((r) => { bySeverity[severityOf(r)] += 1; });
    const last24 = filtered.filter((r) => {
      const w = whenOf(r);
      return w ? Date.now() - +new Date(w) < 86_400_000 : false;
    }).length;
    return {
      total: filtered.length,
      critical: bySeverity.CRITICAL,
      warn: bySeverity.WARN,
      actors: new Set(filtered.map((r) => actorOf(r))).size,
      last24,
    };
  }, [filtered]);

  const chart = useMemo(() => dailyBuckets(filtered), [filtered]);

  const onSort = (f: string) => {
    if (f === sort) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSort(f); setDir(f === 'when' ? 'desc' : 'asc'); }
  };

  const exportCsv = () => {
    downloadCsv(
      `${tab === 'audit' ? 'audit-log' : 'security-events'}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'when', label: 'Timestamp' }, { key: 'severity', label: 'Severity' },
        { key: 'category', label: 'Category' }, { key: 'action', label: 'Action' },
        { key: 'actorName', label: 'Actor' }, { key: 'resource', label: 'Resource' },
        { key: 'resourceId', label: 'Resource ID' }, { key: 'status', label: 'Status' },
        { key: 'ipAddress', label: 'IP address' }, { key: 'oldValue', label: 'Before' },
        { key: 'newValue', label: 'After' }, { key: 'errorMessage', label: 'Error' },
      ],
      sorted.map((r) => ({
        ...r,
        when: whenOf(r) ?? '',
        severity: severityOf(r),
        category: categoryOf(r),
        actorName: actorOf(r),
        action: r.action ?? (r as SecurityEvent).eventType ?? '',
      })),
    );
    notify(`Exported ${sorted.length} rows`);
  };

  const anyFilter = Boolean(debounced || severity || category || actor || since);
  const reset = () => { setSearch(''); setSeverity(''); setCategory(''); setActor(''); setSince(''); };

  const TABS: TabItem[] = [
    { key: 'audit', label: 'Administrative actions', icon: <ScrollText className="h-4 w-4" />, count: audit.length },
    { key: 'security', label: 'Security events', icon: <ShieldAlert className="h-4 w-4" />, count: events.length },
  ];

  const activeError = tab === 'audit' ? error : eventsError;

  /* ───────────────────────────── render ───────────────────────────── */

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Who changed what, when, and from where. Every administrative action, and every security event."
        icon={<ScrollText className="h-5 w-5" />}
        actions={
          <>
            <LiveChip />
            <button
              type="button"
              onClick={() => load(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entries in window" value={stats.total.toLocaleString('en-IN')}
          icon={<Activity className="h-5 w-5" />}
          hint={fetchedAt ? `Fetched ${timeAgo(fetchedAt.toISOString())}` : 'Loading…'} />
        <StatCard label="Critical" value={stats.critical} accent="bg-alert/10 text-alert"
          icon={<AlertTriangle className="h-5 w-5" />} hint="Deletions, role and payment changes" />
        <StatCard label="Warnings" value={stats.warn} accent="bg-warning/15 text-[#8A5A00]"
          icon={<ShieldAlert className="h-5 w-5" />} hint="Suspensions, locks, failures" />
        <StatCard label="Distinct actors" value={stats.actors} accent="bg-teal/10 text-teal"
          icon={<Users2 className="h-5 w-5" />} hint={`${stats.last24} entries in the last 24h`} />
      </div>

      {/* activity strip — the shape of the week before you read a single row */}
      <SectionCard className="mb-5" title="Activity over the last fortnight"
        description="Bars turn red on days that recorded a critical action.">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#51607A' }} axisLine={false} tickLine={false} interval={0} />
              <Tooltip
                cursor={{ fill: '#F5F8FC' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 12 }}
                formatter={(v: number, k) => [v, k === 'count' ? 'Entries' : 'Critical']}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {chart.map((d, i) => <Cell key={i} fill={d.critical > 0 ? '#D8315B' : '#BFDBF7'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard flush>
        <Tabs items={TABS} active={tab} onChange={(k) => setTab(k as 'audit' | 'security')} className="px-2" />

        <TableToolbar
          search={search} onSearch={setSearch}
          placeholder="Search action, actor, resource, IP or error…"
          pageSize={pageSize} onPageSize={setPageSize} onExport={exportCsv}
        >
          <FilterSelect value={severity} onChange={setSeverity} options={[
            { value: '', label: 'All severities' },
            { value: 'CRITICAL', label: 'Critical' },
            { value: 'WARN', label: 'Warning' },
            { value: 'INFO', label: 'Info' },
          ]} />
          <FilterSelect value={category} onChange={setCategory} options={[
            { value: '', label: 'All categories' },
            ...categories.map((c) => ({ value: c, label: c })),
          ]} />
          <FilterSelect value={actor} onChange={setActor} options={[
            { value: '', label: 'All actors' },
            ...actors.map((a) => ({ value: a, label: a })),
          ]} />
          <input
            type="date" value={since} onChange={(e) => setSince(e.target.value)}
            aria-label="From date"
            className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-ocean focus:shadow-glow"
          />
          <FilterSelect value={windowSize} onChange={setWindowSize} options={WINDOWS} />
        </TableToolbar>

        {/* honesty strip — the filters above are client-side */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-softblue/20 px-4 py-2 text-[11px] font-semibold text-brand">
          <Info className="h-3.5 w-3.5" />
          <span>
            The controllers expose no filter or page parameters, so severity, category, actor and date are
            applied in the browser across the fetched window
            {windowSize === 'all' ? ' (everything)' : ` (last ${Number(windowSize).toLocaleString('en-IN')})`}.
          </span>
          {!activeError && (
            <span className="ml-auto inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              {tab === 'audit' ? 'GET /audit/' : 'GET /security/events/'}
              <span className="font-mono">{windowSize === 'all' ? 'all' : 'recent'}</span>
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-5"><SkeletonRows rows={8} /></div>
        ) : activeError ? (
          <EmptyState
            icon={<ServerCrash className="h-6 w-6" />}
            title="Could not reach the backend"
            description={activeError}
            action={
              <button type="button" onClick={() => load(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep">
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            }
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={anyFilter ? <SearchX className="h-6 w-6" /> : <ScrollText className="h-6 w-6" />}
            title={anyFilter ? 'Nothing matches those filters' : 'No entries recorded yet'}
            description={
              anyFilter
                ? 'Widen the window, clear a filter, or search a different term.'
                : tab === 'audit'
                  ? 'The audit table is empty. Entries appear as soon as an administrative action is performed.'
                  : 'No security events recorded. Failed logins, lockouts and permission changes land here.'
            }
            action={anyFilter ? (
              <button type="button" onClick={reset}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand">
                Clear filters
              </button>
            ) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead className="border-b border-line bg-surfaceinset/40">
                <tr>
                  <th className="w-8 px-3 py-3" />
                  <SortHeader label="When" field="when" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Severity" field="severity" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Action" field="action" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Actor" field="actor" active={sort} dir={dir} onSort={onSort} />
                  <Th>Resource</Th>
                  <SortHeader label="Category" field="category" active={sort} dir={dir} onSort={onSort} />
                  <Th>Origin</Th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => {
                  const key = r.id ?? `${whenOf(r)}-${i}`;
                  const sev = severityOf(r);
                  const open = expanded === key;
                  const agent = parseAgent(r.userAgent);
                  const diff = diffOf(r.oldValue, r.newValue);
                  const hasDetail = Boolean(r.oldValue || r.newValue || r.errorMessage || r.notes || r.sessionId || (r as SecurityEvent).description);

                  return (
                    <React.Fragment key={key}>
                      <tr
                        onClick={() => hasDetail && setExpanded(open ? null : key)}
                        className={`border-b border-line transition last:border-0 ${
                          hasDetail ? 'cursor-pointer' : ''
                        } ${open ? 'bg-softblue/25' : 'hover:bg-surfaceinset/50'}`}
                      >
                        <td className="px-3 py-3 align-top">
                          {hasDetail && (
                            <span className="text-slatesoft">
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <span className="block font-mono text-xs text-ink">{dateTime(whenOf(r) ?? null)}</span>
                          <span className="block text-[11px] text-slatesoft">{timeAgo(whenOf(r) ?? null)}</span>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <Badge tone={SEVERITY_TONE[sev]} dot>{sev === 'WARN' ? 'Warning' : sev[0] + sev.slice(1).toLowerCase()}</Badge>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <span className="block text-sm font-bold text-ink">
                            {humanAction(r.action ?? (r as SecurityEvent).eventType)}
                          </span>
                          <span className="block font-mono text-[11px] text-ocean">
                            {r.action ?? (r as SecurityEvent).eventType ?? '—'}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <span className="flex items-center gap-2.5">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-[11px] font-extrabold ${tintFor(actorOf(r))}`}>
                              {initials(actorOf(r))}
                            </span>
                            <span className="min-w-0">
                              <span className="block max-w-[190px] truncate text-sm font-semibold text-ink">{actorOf(r)}</span>
                              {r.email && actorOf(r) !== r.email && (
                                <span className="block max-w-[190px] truncate text-[11px] text-slatesoft">{r.email}</span>
                              )}
                            </span>
                          </span>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <span className="block text-sm text-ink">{r.resource ?? '—'}</span>
                          {r.resourceId && (
                            <span className="block max-w-[170px] truncate font-mono text-[11px] text-slatesoft">{r.resourceId}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <Badge tone="info">{categoryOf(r)}</Badge>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <span className="flex items-center gap-1.5 font-mono text-xs text-ink">
                            <Globe className="h-3.5 w-3.5 text-slatesoft" />{r.ipAddress ?? '—'}
                          </span>
                          {r.userAgent && (
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slatesoft">
                              <Monitor className="h-3 w-3" />{agent.browser} · {agent.os}
                            </span>
                          )}
                        </td>
                      </tr>

                      {open && (
                        <tr className="border-b border-line bg-surfaceinset/40">
                          <td colSpan={8} className="px-6 py-5">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                              {/* before → after */}
                              <div>
                                <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slatesoft">
                                  <Fingerprint className="h-3.5 w-3.5" /> What changed
                                </p>

                                {diff && diff.length > 0 ? (
                                  <div className="overflow-hidden rounded-xl border border-line bg-white">
                                    {diff.map((d) => (
                                      <div key={d.field} className="flex flex-wrap items-center gap-2 border-b border-line px-3.5 py-2.5 last:border-0">
                                        <span className="w-32 shrink-0 font-mono text-[11px] font-bold text-ink">{d.field}</span>
                                        <span className="rounded-md bg-alert/10 px-2 py-0.5 font-mono text-[11px] text-alert line-through">{d.before}</span>
                                        <ArrowRight className="h-3.5 w-3.5 text-slatesoft" />
                                        <span className="rounded-md bg-success/10 px-2 py-0.5 font-mono text-[11px] text-success">{d.after}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : r.oldValue || r.newValue ? (
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <div className="rounded-xl border border-alert/25 bg-alert/5 p-3">
                                      <p className="text-[11px] font-extrabold uppercase text-alert">Before</p>
                                      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-ink">{r.oldValue || '—'}</pre>
                                    </div>
                                    <div className="rounded-xl border border-success/25 bg-success/5 p-3">
                                      <p className="text-[11px] font-extrabold uppercase text-success">After</p>
                                      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-ink">{r.newValue || '—'}</pre>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slatesoft">
                                    No before/after values were recorded for this entry.
                                  </p>
                                )}

                                {(r as SecurityEvent).description && (
                                  <p className="mt-3 text-sm text-slatesoft">{(r as SecurityEvent).description}</p>
                                )}
                                {r.errorMessage && (
                                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-alert/30 bg-alert/5 p-3">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alert" />
                                    <p className="font-mono text-[11px] text-ink">{r.errorMessage}</p>
                                  </div>
                                )}
                              </div>

                              {/* raw context */}
                              <div>
                                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slatesoft">Context</p>
                                <dl className="overflow-hidden rounded-xl border border-line bg-white">
                                  {[
                                    ['Entry ID', r.id],
                                    ['Status', r.status],
                                    ['Actor ID', r.userId],
                                    ['Session', r.sessionId],
                                    ['Device ID', r.deviceId],
                                    ['User agent', r.userAgent],
                                    ['Source', r.source],
                                    ['School / tenant', r.schoolId || r.tenantId],
                                    ['Notes', r.notes],
                                  ].filter(([, v]) => v).map(([k, v]) => (
                                    <div key={String(k)} className="flex items-start gap-3 border-b border-line px-3.5 py-2 last:border-0">
                                      <dt className="w-28 shrink-0 text-[11px] font-bold uppercase tracking-wide text-slatesoft">{k}</dt>
                                      <dd className="min-w-0 break-all font-mono text-[11px] text-ink">{String(v)}</dd>
                                    </div>
                                  ))}
                                </dl>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !activeError && sorted.length > 0 && (
          <Pagination page={page} pageSize={pageSize} total={sorted.length} onPage={setPage} />
        )}
      </SectionCard>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default AuditLogPage;

/**
 * Login history — LIVE.
 *
 * Reads LoginHistoryController (/login-history/recent, /all, /email/{email},
 * /range). That controller is NEW — the entity, repository, service and DTO
 * already existed in the backend but nothing exposed them over HTTP. If the
 * controller is not deployed yet this screen says so explicitly rather than
 * showing an empty table, because "no logins recorded" and "no endpoint" are
 * very different problems.
 *
 * The one thing this screen does that a plain table cannot: it groups repeated
 * failures by IP address and flags them. That is the build plan's requirement
 * and it is the only way a brute-force attempt is visible at all — five failed
 * rows scattered through a hundred successes read as noise.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyRound, RefreshCw, CheckCircle2, XCircle, Globe, Monitor, Smartphone,
  Tablet, ShieldAlert, ServerCrash, SearchX, Users2, Clock, MapPin, Info,
  TriangleAlert, Terminal,
} from 'lucide-react';
import {
  PageHeader, SectionCard, StatCard, Badge, BadgeTone, EmptyState, SkeletonRows,
  TableToolbar, FilterSelect, SortHeader, Th, Pagination, downloadCsv,
  Toast, useToast, LiveChip, SortDir,
} from '../../../shared/ui';
import {
  loginHistoryService, LoginEntry, parseAgent, actorOf,
  isMissingEndpoint, errorMessage,
} from './audit.service';
import { dateTime, timeAgo, initials, tintFor } from '../format';

const WINDOWS = [
  { value: '200', label: 'Last 200 sign-ins' },
  { value: '500', label: 'Last 500 sign-ins' },
  { value: '2000', label: 'Last 2,000 sign-ins' },
  { value: 'all', label: 'Everything' },
];

const DEVICE_ICON: Record<string, React.ReactNode> = {
  Mobile: <Smartphone className="h-3.5 w-3.5" />,
  Tablet: <Tablet className="h-3.5 w-3.5" />,
  Desktop: <Monitor className="h-3.5 w-3.5" />,
  Unknown: <Terminal className="h-3.5 w-3.5" />,
};

/** DTO has `success` and also a `status` string; trust whichever is present. */
const succeeded = (e: LoginEntry) => {
  if (typeof e.success === 'boolean') return e.success;
  const s = (e.status ?? '').toUpperCase();
  if (s.includes('SUCCESS')) return true;
  if (s.includes('FAIL') || s.includes('DENIED') || s.includes('LOCK')) return false;
  return !e.failureReason;
};

const placeOf = (e: LoginEntry) =>
  [e.city, e.region, e.country].filter(Boolean).join(', ');

const duration = (secs?: number) => {
  if (!secs || secs <= 0) return null;
  if (secs < 60) return `${secs}s`;
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

export const LoginHistoryPage: React.FC = () => {
  const { toast, notify, clear } = useToast();

  const [rows, setRows] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const [windowSize, setWindowSize] = useState('500');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [result, setResult] = useState('');
  const [device, setDevice] = useState('');
  const [since, setSince] = useState('');
  const [ipFocus, setIpFocus] = useState('');

  const [sort, setSort] = useState('when');
  const [dir, setDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(async (announce = false) => {
    setLoading(true);
    setError(null);
    setMissing(false);
    try {
      const data = windowSize === 'all'
        ? await loginHistoryService.all()
        : await loginHistoryService.recent(Number(windowSize));
      setRows(data);
      setFetchedAt(new Date());
      if (announce) notify(`Reloaded — ${data.length} sign-in records`);
    } catch (err) {
      if (isMissingEndpoint(err)) setMissing(true);
      else setError(errorMessage(err, 'Could not load login history.'));
    } finally {
      setLoading(false);
    }
  }, [windowSize, notify]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [debounced, result, device, since, ipFocus, pageSize]);

  /* ── repeated failures grouped by IP — the actual security signal ── */

  const suspects = useMemo(() => {
    const map = new Map<string, { ip: string; failures: number; successes: number; accounts: Set<string>; last?: string }>();
    rows.forEach((r) => {
      const ip = r.ipAddress;
      if (!ip) return;
      if (!map.has(ip)) map.set(ip, { ip, failures: 0, successes: 0, accounts: new Set(), last: r.loginTime });
      const g = map.get(ip)!;
      if (succeeded(r)) g.successes += 1; else g.failures += 1;
      if (r.email) g.accounts.add(r.email);
      if (r.loginTime && (!g.last || r.loginTime > g.last)) g.last = r.loginTime;
    });
    return [...map.values()]
      .filter((g) => g.failures >= 3)
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 6);
  }, [rows]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (result === 'success' && !succeeded(r)) return false;
    if (result === 'failure' && succeeded(r)) return false;
    if (device && parseAgent(r.userAgent).device !== device) return false;
    if (ipFocus && r.ipAddress !== ipFocus) return false;
    if (since && (!r.loginTime || r.loginTime.slice(0, 10) < since)) return false;
    if (!debounced) return true;
    return [r.email, r.username, r.fullName, r.ipAddress, r.failureReason, placeOf(r), r.userAgent]
      .some((v) => v && String(v).toLowerCase().includes(debounced));
  }), [rows, result, device, ipFocus, since, debounced]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case 'account': cmp = actorOf(a).localeCompare(actorOf(b)); break;
        case 'result': cmp = Number(succeeded(a)) - Number(succeeded(b)); break;
        case 'ip': cmp = String(a.ipAddress ?? '').localeCompare(String(b.ipAddress ?? '')); break;
        default: cmp = +new Date(a.loginTime ?? 0) - +new Date(b.loginTime ?? 0);
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
    const ok = filtered.filter(succeeded).length;
    return {
      total: filtered.length,
      ok,
      failed: filtered.length - ok,
      accounts: new Set(filtered.map((r) => r.email).filter(Boolean)).size,
      ips: new Set(filtered.map((r) => r.ipAddress).filter(Boolean)).size,
      rate: filtered.length ? Math.round((ok / filtered.length) * 100) : 0,
    };
  }, [filtered]);

  const onSort = (f: string) => {
    if (f === sort) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSort(f); setDir(f === 'when' ? 'desc' : 'asc'); }
  };

  const exportCsv = () => {
    downloadCsv(
      `login-history-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'loginTime', label: 'Timestamp' }, { key: 'resultLabel', label: 'Result' },
        { key: 'email', label: 'Email' }, { key: 'fullName', label: 'Name' },
        { key: 'ipAddress', label: 'IP address' }, { key: 'place', label: 'Location' },
        { key: 'browser', label: 'Browser' }, { key: 'os', label: 'OS' },
        { key: 'deviceType', label: 'Device' }, { key: 'failureReason', label: 'Failure reason' },
        { key: 'sessionDuration', label: 'Session (s)' },
      ],
      sorted.map((r) => {
        const a = parseAgent(r.userAgent);
        return {
          ...r,
          resultLabel: succeeded(r) ? 'Success' : 'Failure',
          place: placeOf(r),
          browser: a.browser, os: a.os, deviceType: a.device,
        };
      }),
    );
    notify(`Exported ${sorted.length} rows`);
  };

  const anyFilter = Boolean(debounced || result || device || since || ipFocus);
  const reset = () => { setSearch(''); setResult(''); setDevice(''); setSince(''); setIpFocus(''); };

  /* ───────────────────── missing controller state ───────────────────── */

  if (missing) {
    return (
      <>
        <PageHeader
          title="Login history"
          subtitle="Successful and failed sign-ins with IP, device and location."
          icon={<KeyRound className="h-5 w-5" />}
        />
        <SectionCard>
          <div className="mx-auto max-w-2xl px-2 py-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-[#8A5A00]">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-extrabold text-ink">The endpoint is not deployed yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-slatesoft">
              The backend already has <code className="rounded bg-surfaceinset px-1.5 py-0.5 font-mono text-[11px]">LoginHistory</code>,
              its repository, <code className="rounded bg-surfaceinset px-1.5 py-0.5 font-mono text-[11px]">LoginHistoryService</code> and
              <code className="mx-1 rounded bg-surfaceinset px-1.5 py-0.5 font-mono text-[11px]">LoginHistoryDTO</code> — but no
              controller exposes them, so there is nothing for this screen to read.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-line text-left">
              <p className="border-b border-line bg-surfaceinset/60 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-slatesoft">
                Endpoints this screen expects
              </p>
              <ul className="divide-y divide-line">
                {[
                  ['GET', '/login-history/recent?limit=500'],
                  ['GET', '/login-history/all'],
                  ['GET', '/login-history/user/{userId}'],
                  ['GET', '/login-history/email/{email}'],
                  ['GET', '/login-history/range?start=&end='],
                ].map(([m, path]) => (
                  <li key={path} className="flex items-center gap-3 px-4 py-2.5">
                    <Badge tone="info">{m}</Badge>
                    <span className="font-mono text-xs text-ink">{path}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-sm text-slatesoft">
              Drop <code className="rounded bg-surfaceinset px-1.5 py-0.5 font-mono text-[11px]">LoginHistoryController.java</code> into
              <code className="mx-1 rounded bg-surfaceinset px-1.5 py-0.5 font-mono text-[11px]">modules/auth/api/</code>, restart, and this
              page fills itself in. Nothing here needs changing.
            </p>

            <button type="button" onClick={() => load(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep">
              <RefreshCw className="h-4 w-4" /> Check again
            </button>
          </div>
        </SectionCard>
        <Toast toast={toast} onClose={clear} />
      </>
    );
  }

  /* ───────────────────────────── render ───────────────────────────── */

  return (
    <>
      <PageHeader
        title="Login history"
        subtitle="Every sign-in attempt, with IP, device and location. Repeated failures are grouped and flagged."
        icon={<KeyRound className="h-5 w-5" />}
        actions={
          <>
            <LiveChip />
            <button type="button" onClick={() => load(true)} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Successful sign-ins" value={stats.ok.toLocaleString('en-IN')}
          accent="bg-success/10 text-success" icon={<CheckCircle2 className="h-5 w-5" />}
          hint={`${stats.rate}% of attempts in this window`} />
        <StatCard label="Failed attempts" value={stats.failed.toLocaleString('en-IN')}
          accent="bg-alert/10 text-alert" icon={<XCircle className="h-5 w-5" />}
          hint={suspects.length ? `${suspects.length} address${suspects.length === 1 ? '' : 'es'} flagged below` : 'No address flagged'} />
        <StatCard label="Distinct accounts" value={stats.accounts} accent="bg-teal/10 text-teal"
          icon={<Users2 className="h-5 w-5" />} hint="Unique email addresses seen" />
        <StatCard label="Distinct addresses" value={stats.ips} accent="bg-ocean/15 text-ocean"
          icon={<Globe className="h-5 w-5" />}
          hint={fetchedAt ? `Fetched ${timeAgo(fetchedAt.toISOString())}` : 'Loading…'} />
      </div>

      {/* ── flagged addresses ── */}
      {suspects.length > 0 && (
        <SectionCard
          className="mb-5 border-alert/30"
          title="Addresses with repeated failures"
          description="Three or more failed attempts from one address in this window. Click to filter the table."
          actions={<Badge tone="danger" dot>{suspects.length} flagged</Badge>}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {suspects.map((s) => {
              const on = ipFocus === s.ip;
              return (
                <button
                  key={s.ip}
                  type="button"
                  onClick={() => setIpFocus(on ? '' : s.ip)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    on ? 'border-alert bg-alert/5' : 'border-line bg-white hover:border-alert/50 hover:shadow-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2 font-mono text-sm font-bold text-ink">
                      <ShieldAlert className="h-4 w-4 text-alert" />{s.ip}
                    </span>
                    <Badge tone="danger">{s.failures} failed</Badge>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                    <div>
                      <dt className="text-[10px] font-bold uppercase text-slatesoft">Accounts</dt>
                      <dd className="font-display text-sm font-extrabold text-ink">{s.accounts.size}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase text-slatesoft">Succeeded</dt>
                      <dd className={`font-display text-sm font-extrabold ${s.successes > 0 ? 'text-warning' : 'text-slatesoft'}`}>
                        {s.successes}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase text-slatesoft">Last seen</dt>
                      <dd className="text-[11px] font-bold text-ink">{timeAgo(s.last ?? null)}</dd>
                    </div>
                  </dl>
                  {s.accounts.size > 1 && (
                    <p className="mt-2.5 text-[11px] font-semibold text-alert">
                      Tried {s.accounts.size} different accounts — consistent with credential stuffing.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      <SectionCard flush>
        <TableToolbar
          search={search} onSearch={setSearch}
          placeholder="Search email, name, IP, location or failure reason…"
          pageSize={pageSize} onPageSize={setPageSize} onExport={exportCsv}
        >
          <FilterSelect value={result} onChange={setResult} options={[
            { value: '', label: 'All results' },
            { value: 'success', label: 'Successful only' },
            { value: 'failure', label: 'Failed only' },
          ]} />
          <FilterSelect value={device} onChange={setDevice} options={[
            { value: '', label: 'All devices' },
            { value: 'Desktop', label: 'Desktop' },
            { value: 'Mobile', label: 'Mobile' },
            { value: 'Tablet', label: 'Tablet' },
            { value: 'Unknown', label: 'Unknown / API' },
          ]} />
          <input type="date" value={since} onChange={(e) => setSince(e.target.value)} aria-label="From date"
            className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-ocean focus:shadow-glow" />
          <FilterSelect value={windowSize} onChange={setWindowSize} options={WINDOWS} />
        </TableToolbar>

        {ipFocus && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-alert/5 px-4 py-2 text-[11px] font-bold text-alert">
            <ShieldAlert className="h-3.5 w-3.5" />
            Filtered to <span className="font-mono">{ipFocus}</span>
            <button type="button" onClick={() => setIpFocus('')} className="ml-2 underline hover:no-underline">
              show all addresses
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-softblue/20 px-4 py-2 text-[11px] font-semibold text-brand">
          <Info className="h-3.5 w-3.5" />
          <span>
            Filters apply in the browser across the fetched window
            {windowSize === 'all' ? ' (everything)' : ` (last ${Number(windowSize).toLocaleString('en-IN')})`}.
            Browser, OS and device are parsed from the stored user-agent string.
          </span>
        </div>

        {loading ? (
          <div className="p-5"><SkeletonRows rows={8} /></div>
        ) : error ? (
          <EmptyState
            icon={<ServerCrash className="h-6 w-6" />}
            title="Could not reach the backend"
            description={error}
            action={
              <button type="button" onClick={() => load(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep">
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            }
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={anyFilter ? <SearchX className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
            title={anyFilter ? 'Nothing matches those filters' : 'No sign-ins recorded yet'}
            description={
              anyFilter
                ? 'Widen the window or clear a filter.'
                : 'The endpoint responded but the table is empty. Records appear once LoginHistoryService.recordLogin() is called from the auth flow.'
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
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="border-b border-line bg-surfaceinset/40">
                <tr>
                  <SortHeader label="When" field="when" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Account" field="account" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Result" field="result" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Address" field="ip" active={sort} dir={dir} onSort={onSort} />
                  <Th>Device</Th>
                  <Th>Session</Th>
                  <Th>Reason</Th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => {
                  const ok = succeeded(r);
                  const a = parseAgent(r.userAgent);
                  const place = placeOf(r);
                  const dur = duration(r.sessionDuration);
                  const flagged = suspects.some((s) => s.ip === r.ipAddress);

                  return (
                    <tr key={r.id ?? `${r.loginTime}-${i}`}
                      className={`border-b border-line transition last:border-0 hover:bg-surfaceinset/50 ${
                        !ok ? 'bg-alert/[0.03]' : ''
                      }`}>
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <span className="block font-mono text-xs text-ink">{dateTime(r.loginTime ?? null)}</span>
                        <span className="block text-[11px] text-slatesoft">{timeAgo(r.loginTime ?? null)}</span>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span className="flex items-center gap-2.5">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-[11px] font-extrabold ${tintFor(actorOf(r))}`}>
                            {initials(actorOf(r))}
                          </span>
                          <span className="min-w-0">
                            <span className="block max-w-[210px] truncate text-sm font-semibold text-ink">
                              {r.fullName || r.username || r.email || '—'}
                            </span>
                            {r.email && r.email !== (r.fullName || r.username) && (
                              <span className="block max-w-[210px] truncate text-[11px] text-slatesoft">{r.email}</span>
                            )}
                          </span>
                        </span>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <Badge tone={ok ? 'success' : 'danger'} dot>{ok ? 'Success' : 'Failed'}</Badge>
                        {r.loginType && (
                          <span className="mt-0.5 block font-mono text-[11px] text-slatesoft">{r.loginType}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span className="flex items-center gap-1.5 font-mono text-xs text-ink">
                          <Globe className="h-3.5 w-3.5 text-slatesoft" />
                          {r.ipAddress ?? '—'}
                          {flagged && (
                            <span title="Repeated failures from this address" className="text-alert">
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </span>
                        {place && (
                          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slatesoft">
                            <MapPin className="h-3 w-3" />{place}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span className="flex items-center gap-1.5 text-sm text-ink">
                          {DEVICE_ICON[a.device] ?? DEVICE_ICON.Unknown}{a.browser}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slatesoft">{a.os} · {a.device}</span>
                      </td>

                      <td className="px-4 py-3 align-top">
                        {dur ? (
                          <span className="flex items-center gap-1.5 text-sm text-ink">
                            <Clock className="h-3.5 w-3.5 text-slatesoft" />{dur}
                          </span>
                        ) : (
                          <span className="text-xs text-slatesoft">{r.logoutTime ? '—' : 'open'}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {r.failureReason ? (
                          <span className="text-sm text-alert">{r.failureReason}</span>
                        ) : (
                          <span className="text-xs text-slatesoft">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <Pagination page={page} pageSize={pageSize} total={sorted.length} onPage={setPage} />
        )}
      </SectionCard>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default LoginHistoryPage;

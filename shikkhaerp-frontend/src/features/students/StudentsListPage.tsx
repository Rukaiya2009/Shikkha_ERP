/**
 * Students — the list.
 *
 * Searchable, filterable, sortable table of every student in the school, with
 * bulk selection, a three-dot row menu, CSV export that respects the active
 * filters, and a card grid alternative for browsing.
 *
 * Data: MOCK. Everything comes from ./data/mockStudents and is filtered, sorted
 * and paged in memory. When GET /students lands, replace `loadStudents` with
 * the service call and hand the filter state over as query parameters — the
 * rest of this file does not change.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Plus, Eye, Pencil, Ban, RotateCcw, Trash2, Users2,
  CalendarCheck, Wallet, LayoutGrid, List, Mail, Phone, SearchX,
} from 'lucide-react';
import {
  PageHeader, SectionCard, StatCard, Badge, BadgeTone, EmptyState, SkeletonRows,
  TableToolbar, FilterSelect, SortHeader, Th, RowMenu, BulkBar, RowCheckbox,
  Pagination, downloadCsv, ConfirmDialog, Toast, useToast, DemoChip, SortDir,
} from '../../shared/ui';
import {
  MOCK_STUDENTS, Student, StudentStatus, CLASSES, SECTIONS,
  STATUS_LABEL, FEE_LABEL, studentTotals, taka,
} from './data/mockStudents';
import { StudentAvatar } from './StudentAvatar';

/* ─────────────────────────── presentation helpers ─────────────────────────── */

const STATUS_TONE: Record<StudentStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'danger',
  SUSPENDED: 'warning',
  TRANSFERRED: 'info',
  GRADUATED: 'purple',
};

const FEE_TONE: Record<string, BadgeTone> = {
  PAID: 'success',
  PARTIAL: 'info',
  DUE: 'warning',
  OVERDUE: 'danger',
};

const attendanceTone = (pct: number) =>
  pct >= 90 ? 'text-success' : pct >= 75 ? 'text-[#8A5A00]' : 'text-alert';

/* ──────────────────────────────── the page ──────────────────────────────── */

type Dialog =
  | { kind: 'suspend' | 'restore' | 'delete'; student: Student }
  | { kind: 'bulk-delete' | 'bulk-suspend'; ids: string[] }
  | null;

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, notify, clear } = useToast();

  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');

  const [sort, setSort] = useState('name');
  const [dir, setDir] = useState<SortDir>('asc');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  /* MOCK: stands in for GET /students. Delay kept so skeletons are real. */
  useEffect(() => {
    const t = setTimeout(() => {
      setRows(MOCK_STUDENTS);
      setLoading(false);
    }, 450);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [debounced, classFilter, sectionFilter, statusFilter, feeFilter, pageSize]);

  /* ── filter → sort → page, all in memory for now ── */

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      if (classFilter && s.className !== classFilter) return false;
      if (sectionFilter && s.section !== sectionFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (feeFilter && s.feeStatus !== feeFilter) return false;
      if (!debounced) return true;
      return (
        s.name.toLowerCase().includes(debounced) ||
        s.code.toLowerCase().includes(debounced) ||
        s.guardian.name.toLowerCase().includes(debounced) ||
        s.phone.includes(debounced) ||
        String(s.roll) === debounced
      );
    });
  }, [rows, debounced, classFilter, sectionFilter, statusFilter, feeFilter]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case 'roll': cmp = a.roll - b.roll; break;
        case 'className': cmp = CLASSES.indexOf(a.className) - CLASSES.indexOf(b.className) || a.section.localeCompare(b.section); break;
        case 'attendance': cmp = a.attendance - b.attendance; break;
        case 'avgMarks': cmp = a.avgMarks - b.avgMarks; break;
        case 'dueAmount': cmp = a.dueAmount - b.dueAmount; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
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

  const totals = useMemo(() => studentTotals(filtered), [filtered]);

  const onSort = (field: string) => {
    if (field === sort) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSort(field); setDir('asc'); }
  };

  /* ── selection ── */

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

  /* ── actions (local only until the API exists) ── */

  const applyStatus = (ids: string[], status: StudentStatus) =>
    setRows((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, status } : s)));

  const removeRows = (ids: string[]) =>
    setRows((prev) => prev.filter((s) => !ids.includes(s.id)));

  const runDialog = () => {
    if (!dialog) return;
    setBusy(true);
    // MOCK: replace with PATCH /students/{id}/status or DELETE /students/{id}
    setTimeout(() => {
      if (dialog.kind === 'suspend') {
        applyStatus([dialog.student.id], 'SUSPENDED');
        notify(`${dialog.student.name} suspended`);
      } else if (dialog.kind === 'restore') {
        applyStatus([dialog.student.id], 'ACTIVE');
        notify(`${dialog.student.name} restored to active`);
      } else if (dialog.kind === 'delete') {
        removeRows([dialog.student.id]);
        notify(`${dialog.student.name} removed`, 'danger');
      } else if (dialog.kind === 'bulk-suspend') {
        applyStatus(dialog.ids, 'SUSPENDED');
        notify(`${dialog.ids.length} students suspended`);
        setSelected(new Set());
      } else if (dialog.kind === 'bulk-delete') {
        removeRows(dialog.ids);
        notify(`${dialog.ids.length} students removed`, 'danger');
        setSelected(new Set());
      }
      setBusy(false);
      setDialog(null);
    }, 500);
  };

  const exportCsv = () => {
    downloadCsv(
      `students-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'code', label: 'Student ID' },
        { key: 'name', label: 'Name' },
        { key: 'className', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'roll', label: 'Roll' },
        { key: 'gender', label: 'Gender' },
        { key: 'guardianName', label: 'Guardian' },
        { key: 'phone', label: 'Phone' },
        { key: 'attendance', label: 'Attendance %' },
        { key: 'avgMarks', label: 'Average marks' },
        { key: 'feeStatus', label: 'Fee status' },
        { key: 'dueAmount', label: 'Due (BDT)' },
        { key: 'status', label: 'Status' },
      ],
      sorted.map((s) => ({ ...s, guardianName: s.guardian.name })),
    );
    notify(`Exported ${sorted.length} rows`);
  };

  const resetFilters = () => {
    setSearch(''); setClassFilter(''); setSectionFilter(''); setStatusFilter(''); setFeeFilter('');
  };

  const anyFilter = Boolean(debounced || classFilter || sectionFilter || statusFilter || feeFilter);

  const menuFor = (s: Student) => [
    { label: 'View profile', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(`/school-admin/students/${s.id}`) },
    { label: 'Edit details', icon: <Pencil className="h-4 w-4" />, onClick: () => navigate(`/school-admin/students/${s.id}/edit`) },
    s.status === 'SUSPENDED'
      ? { label: 'Restore to active', icon: <RotateCcw className="h-4 w-4" />, onClick: () => setDialog({ kind: 'restore', student: s }), divider: true }
      : { label: 'Suspend student', icon: <Ban className="h-4 w-4" />, onClick: () => setDialog({ kind: 'suspend', student: s }), divider: true },
    { label: 'Remove student', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDialog({ kind: 'delete', student: s }), danger: true },
  ];

  /* ────────────────────────────── render ────────────────────────────── */

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Enrol, browse and manage every student in the school."
        icon={<GraduationCap className="h-5 w-5" />}
        actions={
          <>
            <DemoChip />
            <button
              type="button"
              onClick={() => navigate('/school-admin/students/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep"
            >
              <Plus className="h-4 w-4" /> Add student
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students shown"
          value={totals.total}
          icon={<Users2 className="h-5 w-5" />}
          hint={`${totals.boys} boys · ${totals.girls} girls`}
        />
        <StatCard
          label="Active enrolment"
          value={totals.active}
          accent="bg-success/10 text-success"
          icon={<GraduationCap className="h-5 w-5" />}
          hint={`${totals.total - totals.active} inactive or suspended`}
        />
        <StatCard
          label="Average attendance"
          value={`${totals.avgAttendance}%`}
          accent="bg-teal/10 text-teal"
          icon={<CalendarCheck className="h-5 w-5" />}
          hint="Across active students, this academic year"
        />
        <StatCard
          label="Outstanding fees"
          value={taka(totals.dueAmount)}
          accent="bg-alert/10 text-alert"
          icon={<Wallet className="h-5 w-5" />}
          hint={`${totals.dueCount} students with dues`}
        />
      </div>

      <SectionCard flush>
        <TableToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search by name, student ID, roll, guardian or phone…"
          pageSize={pageSize}
          onPageSize={setPageSize}
          onExport={exportCsv}
          actions={
            <div className="hidden items-center rounded-xl border border-line bg-white p-0.5 md:flex">
              {([['table', List], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  aria-label={`${mode} view`}
                  className={`rounded-lg p-1.5 transition ${
                    view === mode ? 'bg-brand text-white' : 'text-slatesoft hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          }
        >
          <FilterSelect
            value={classFilter}
            onChange={setClassFilter}
            options={[{ value: '', label: 'All classes' }, ...CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))]}
          />
          <FilterSelect
            value={sectionFilter}
            onChange={setSectionFilter}
            options={[{ value: '', label: 'All sections' }, ...SECTIONS.map((s) => ({ value: s, label: `Section ${s}` }))]}
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'All statuses' },
              ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
            ]}
          />
          <FilterSelect
            value={feeFilter}
            onChange={setFeeFilter}
            options={[
              { value: '', label: 'All fee states' },
              ...Object.entries(FEE_LABEL).map(([value, label]) => ({ value, label })),
            ]}
          />
        </TableToolbar>

        <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
          <button
            type="button"
            onClick={() => setDialog({ kind: 'bulk-suspend', ids: [...selected] })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-linestrong bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-warning"
          >
            <Ban className="h-3.5 w-3.5" /> Suspend
          </button>
          <button
            type="button"
            onClick={() => { notify(`${selected.size} students queued for a notice`); setSelected(new Set()); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-linestrong bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-ocean"
          >
            <Mail className="h-3.5 w-3.5" /> Send notice
          </button>
          <button
            type="button"
            onClick={() => setDialog({ kind: 'bulk-delete', ids: [...selected] })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-alert/40 bg-white px-3 py-1.5 text-xs font-bold text-alert transition hover:bg-alert/5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </BulkBar>

        {loading ? (
          <div className="p-5"><SkeletonRows rows={6} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={anyFilter ? <SearchX className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
            title={anyFilter ? 'No students match those filters' : 'No students enrolled yet'}
            description={
              anyFilter
                ? 'Try a different class, section or status — or clear the filters and start again.'
                : 'Add the first student and their guardian, and they will show up here immediately.'
            }
            action={
              anyFilter ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/school-admin/students/new')}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep"
                >
                  <Plus className="h-4 w-4" /> Add student
                </button>
              )
            }
          />
        ) : view === 'grid' ? (
          /* ── card grid ── */
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {paged.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(`/school-admin/students/${s.id}`)}
                className="group rounded-2xl border border-line bg-white p-4 text-left transition hover:border-ocean hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <StudentAvatar name={s.name} id={s.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-extrabold text-ink group-hover:text-brand">{s.name}</p>
                    <p className="font-mono text-xs text-slatesoft">{s.code}</p>
                  </div>
                  <Badge tone={STATUS_TONE[s.status]} dot>{STATUS_LABEL[s.status]}</Badge>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                  <div>
                    <dt className="text-[11px] font-semibold text-slatesoft">Class</dt>
                    <dd className="font-display text-sm font-extrabold text-ink">{s.className}·{s.section}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold text-slatesoft">Roll</dt>
                    <dd className="font-display text-sm font-extrabold text-ink">{s.roll}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold text-slatesoft">Attend.</dt>
                    <dd className={`font-display text-sm font-extrabold ${attendanceTone(s.attendance)}`}>{s.attendance}%</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="flex items-center gap-1.5 truncate text-xs text-slatesoft">
                    <Phone className="h-3.5 w-3.5 shrink-0" /> {s.guardian.phone}
                  </span>
                  <Badge tone={FEE_TONE[s.feeStatus]}>{FEE_LABEL[s.feeStatus]}</Badge>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* ── table ── */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="border-b border-line bg-surfaceinset/40">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <RowCheckbox checked={allOnPage} indeterminate={someOnPage} onChange={toggleAll} label="Select all on page" />
                  </th>
                  <SortHeader label="Student" field="name" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Class" field="className" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Roll" field="roll" active={sort} dir={dir} onSort={onSort} />
                  <Th>Guardian</Th>
                  <SortHeader label="Attendance" field="attendance" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Avg marks" field="avgMarks" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Fees" field="dueAmount" active={sort} dir={dir} onSort={onSort} />
                  <SortHeader label="Status" field="status" active={sort} dir={dir} onSort={onSort} />
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-line transition last:border-0 hover:bg-surfaceinset/50 ${
                      selected.has(s.id) ? 'bg-softblue/25' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <RowCheckbox checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} label={`Select ${s.name}`} />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/school-admin/students/${s.id}`)}
                        className="group flex items-center gap-3 text-left"
                      >
                        <StudentAvatar name={s.name} id={s.id} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-ink group-hover:text-brand">{s.name}</span>
                          <span className="block font-mono text-[11px] text-slatesoft">{s.code}</span>
                        </span>
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="text-sm font-semibold text-ink">{s.className}</span>
                      <span className="ml-1 rounded-md bg-surfaceinset px-1.5 py-0.5 text-[11px] font-bold text-slatesoft">{s.section}</span>
                      <span className="mt-0.5 block text-[11px] text-slatesoft">{s.shift} · {s.group}</span>
                    </td>

                    <td className="px-4 py-3 font-mono text-sm text-ink">{s.roll}</td>

                    <td className="px-4 py-3">
                      <span className="block truncate text-sm font-medium text-ink">{s.guardian.name}</span>
                      <span className="block text-[11px] text-slatesoft">{s.guardian.relation} · {s.guardian.phone}</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-display text-sm font-extrabold ${attendanceTone(s.attendance)}`}>
                          {s.attendance}%
                        </span>
                        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-line">
                          <span
                            className={`block h-full rounded-full ${
                              s.attendance >= 90 ? 'bg-success' : s.attendance >= 75 ? 'bg-warning' : 'bg-alert'
                            }`}
                            style={{ width: `${s.attendance}%` }}
                          />
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-display text-sm font-extrabold text-ink">{s.avgMarks}</span>
                      <span className="ml-1 text-[11px] text-slatesoft">GPA {s.gpa.toFixed(2)}</span>
                    </td>

                    <td className="px-4 py-3">
                      <Badge tone={FEE_TONE[s.feeStatus]}>{FEE_LABEL[s.feeStatus]}</Badge>
                      {s.dueAmount > 0 && (
                        <span className="mt-0.5 block font-mono text-[11px] text-alert">{taka(s.dueAmount)}</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[s.status]} dot>{STATUS_LABEL[s.status]}</Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <RowMenu items={menuFor(s)} />
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
        title="Suspend this student?"
        message={
          <>
            <b className="text-ink">{dialog && 'student' in dialog ? dialog.student.name : ''}</b> will lose access to
            the student portal and will be excluded from attendance and exam lists until restored. Their record and
            history are kept.
          </>
        }
        confirmLabel="Suspend student"
        tone="warning"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />

      <ConfirmDialog
        open={dialog?.kind === 'restore'}
        title="Restore this student?"
        message="They will be marked active again and reappear in attendance and exam lists."
        confirmLabel="Restore"
        tone="brand"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />

      <ConfirmDialog
        open={dialog?.kind === 'delete'}
        title="Remove this student?"
        message={
          <>
            This removes <b className="text-ink">{dialog && 'student' in dialog ? dialog.student.name : ''}</b> from the
            active roll. Attendance, results and fee history are retained for audit and can be restored by an
            administrator.
          </>
        }
        confirmLabel="Remove student"
        busy={busy}
        requireText={dialog && 'student' in dialog ? dialog.student.code : undefined}
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />

      <ConfirmDialog
        open={dialog?.kind === 'bulk-suspend'}
        title={`Suspend ${dialog && 'ids' in dialog ? dialog.ids.length : 0} students?`}
        message="Each selected student loses portal access until restored. Records are kept."
        confirmLabel="Suspend all"
        tone="warning"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />

      <ConfirmDialog
        open={dialog?.kind === 'bulk-delete'}
        title={`Remove ${dialog && 'ids' in dialog ? dialog.ids.length : 0} students?`}
        message="They are taken off the active roll. History is retained for audit."
        confirmLabel="Remove all"
        busy={busy}
        requireText="REMOVE"
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default StudentsListPage;

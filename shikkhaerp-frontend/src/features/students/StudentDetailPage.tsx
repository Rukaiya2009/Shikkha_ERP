/**
 * Student detail — the record page.
 *
 * Identity card, status, primary actions, then tabs across everything attached
 * to that student. This is the shape the build plan reserves for record pages,
 * so School detail and Teacher detail should be built by copying this file and
 * swapping the tabs.
 *
 * Data: MOCK. Sourced from ./data/mockStudents helpers. Each tab maps to one
 * endpoint listed at the top of that file.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import {
  ArrowLeft, Pencil, Ban, RotateCcw, Trash2, Printer, Mail, Phone, MapPin,
  CalendarCheck, Award, Wallet, FileText, History, User, Droplet, Bus, Home,
  Download, IdCard, ShieldAlert, GraduationCap,
} from 'lucide-react';
import {
  SectionCard, Badge, BadgeTone, EmptyState, Tabs, TabItem,
  Th, RowMenu, ConfirmDialog, Toast, useToast, DemoChip,
} from '../../shared/ui';
import { StudentAvatar } from './StudentAvatar';
import {
  findStudent, attendanceFor, resultsFor, feesFor, documentsFor, timelineFor,
  StudentStatus, STATUS_LABEL, FEE_LABEL, taka, Student,
} from './data/mockStudents';

const STATUS_TONE: Record<StudentStatus, BadgeTone> = {
  ACTIVE: 'success', INACTIVE: 'danger', SUSPENDED: 'warning',
  TRANSFERRED: 'info', GRADUATED: 'purple',
};

const FEE_TONE: Record<string, BadgeTone> = {
  PAID: 'success', PARTIAL: 'info', DUE: 'warning', OVERDUE: 'danger',
};

const GRADE_TONE = (grade: string): BadgeTone =>
  grade === 'A+' ? 'success' : grade === 'F' ? 'danger' : grade.startsWith('A') ? 'info' : 'neutral';

/** A labelled value inside an information block. */
const Row: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ label, children, icon }) => (
  <div className="flex items-start gap-3 border-b border-line py-3 last:border-0">
    {icon && <span className="mt-0.5 text-slatesoft">{icon}</span>}
    <div className="min-w-0 flex-1">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-ink">{children}</dd>
    </div>
  </div>
);

export const StudentDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast, notify, clear } = useToast();

  const [student, setStudent] = useState<Student | undefined>(() => findStudent(id));
  const [tab, setTab] = useState('overview');
  const [dialog, setDialog] = useState<'suspend' | 'restore' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);

  const attendance = useMemo(() => (student ? attendanceFor(student) : []), [student]);
  const results = useMemo(() => (student ? resultsFor(student) : []), [student]);
  const fees = useMemo(() => (student ? feesFor(student) : []), [student]);
  const documents = useMemo(() => (student ? documentsFor(student) : []), [student]);
  const timeline = useMemo(() => (student ? timelineFor(student) : []), [student]);

  const [examIndex, setExamIndex] = useState(0);

  if (!student) {
    return (
      <SectionCard>
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" />}
          title="Student not found"
          description="That record may have been removed, or the link is out of date."
          action={
            <Link
              to="/school-admin/students"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep"
            >
              <ArrowLeft className="h-4 w-4" /> Back to students
            </Link>
          }
        />
      </SectionCard>
    );
  }

  const totalDue = fees.reduce((a, f) => a + (f.amount - f.paid), 0);
  const totalPaid = fees.reduce((a, f) => a + f.paid, 0);
  const currentExam = results[examIndex];

  const runDialog = () => {
    setBusy(true);
    // MOCK: replace with PATCH /students/{id}/status or DELETE /students/{id}
    setTimeout(() => {
      if (dialog === 'suspend') { setStudent({ ...student, status: 'SUSPENDED' }); notify('Student suspended'); }
      if (dialog === 'restore') { setStudent({ ...student, status: 'ACTIVE' }); notify('Student restored to active'); }
      if (dialog === 'delete') { notify('Student removed', 'danger'); navigate('/school-admin/students'); }
      setBusy(false);
      setDialog(null);
    }, 500);
  };

  const TABS: TabItem[] = [
    { key: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
    { key: 'attendance', label: 'Attendance', icon: <CalendarCheck className="h-4 w-4" /> },
    { key: 'results', label: 'Results', icon: <Award className="h-4 w-4" />, count: results.length },
    { key: 'fees', label: 'Fees', icon: <Wallet className="h-4 w-4" />, count: fees.filter((f) => f.status !== 'PAID').length },
    { key: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" />, count: documents.length },
    { key: 'activity', label: 'Activity', icon: <History className="h-4 w-4" /> },
  ];

  return (
    <>
      <Link
        to="/school-admin/students"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slatesoft transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> All students
      </Link>

      {/* ── identity card ── */}
      <SectionCard className="mb-6">
        <div className="flex flex-wrap items-start gap-5">
          <StudentAvatar name={student.name} id={student.id} size="xl" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{student.name}</h1>
              <Badge tone={STATUS_TONE[student.status]} dot>{STATUS_LABEL[student.status]}</Badge>
              <DemoChip />
            </div>
            <p className="mt-0.5 text-sm text-slatesoft">{student.nameBn}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slatesoft">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ocean">
                <IdCard className="h-3.5 w-3.5" /> {student.code}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Class {student.className} · Section {student.section} · Roll {student.roll}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {student.phone}
              </span>
              <span className="inline-flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5" /> {student.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/school-admin/students/${student.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button
              type="button"
              onClick={() => notify('ID card sent to the print queue')}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ocean hover:text-brand"
            >
              <Printer className="h-4 w-4" /> ID card
            </button>
            <RowMenu
              items={[
                { label: 'Email guardian', icon: <Mail className="h-4 w-4" />, onClick: () => notify(`Draft opened for ${student.guardian.name}`) },
                { label: 'Print transcript', icon: <Printer className="h-4 w-4" />, onClick: () => notify('Transcript queued') },
                student.status === 'SUSPENDED'
                  ? { label: 'Restore to active', icon: <RotateCcw className="h-4 w-4" />, onClick: () => setDialog('restore'), divider: true }
                  : { label: 'Suspend student', icon: <Ban className="h-4 w-4" />, onClick: () => setDialog('suspend'), divider: true },
                { label: 'Remove student', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDialog('delete'), danger: true },
              ]}
            />
          </div>
        </div>

        {/* quick numbers */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-4">
          {[
            { label: 'Attendance', value: `${student.attendance}%`, tone: student.attendance >= 90 ? 'text-success' : student.attendance >= 75 ? 'text-[#8A5A00]' : 'text-alert' },
            { label: 'Average marks', value: student.avgMarks, tone: 'text-ink' },
            { label: 'Latest GPA', value: student.gpa.toFixed(2), tone: 'text-ink' },
            { label: 'Outstanding', value: taka(totalDue), tone: totalDue > 0 ? 'text-alert' : 'text-success' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl bg-surfaceinset px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">{k.label}</p>
              <p className={`mt-0.5 font-display text-xl font-extrabold ${k.tone}`}>{k.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard flush>
        <Tabs items={TABS} active={tab} onChange={setTab} className="px-2" />

        {/* ────────────────────────── overview ────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">Personal</h3>
              <dl>
                <Row label="Full name" icon={<User className="h-4 w-4" />}>{student.name}</Row>
                <Row label="Name (Bangla)">{student.nameBn}</Row>
                <Row label="Date of birth">{student.dob}</Row>
                <Row label="Gender">{student.gender}</Row>
                <Row label="Blood group" icon={<Droplet className="h-4 w-4" />}>{student.bloodGroup}</Row>
                <Row label="Religion">{student.religion}</Row>
              </dl>
            </div>

            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">Academic</h3>
              <dl>
                <Row label="Class & section" icon={<GraduationCap className="h-4 w-4" />}>
                  Class {student.className} · Section {student.section}
                </Row>
                <Row label="Roll number">{student.roll}</Row>
                <Row label="Group">{student.group}</Row>
                <Row label="Shift">{student.shift}</Row>
                <Row label="House">{student.house}</Row>
                <Row label="Admitted on">{student.admissionDate}</Row>
              </dl>
            </div>

            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">Guardian</h3>
              <dl>
                <Row label="Name" icon={<User className="h-4 w-4" />}>{student.guardian.name}</Row>
                <Row label="Relation">{student.guardian.relation}</Row>
                <Row label="Phone" icon={<Phone className="h-4 w-4" />}>{student.guardian.phone}</Row>
                <Row label="Email" icon={<Mail className="h-4 w-4" />}>{student.guardian.email}</Row>
                <Row label="Occupation">{student.guardian.occupation}</Row>
                <Row label="NID">
                  <span className="font-mono text-xs">{student.guardian.nid}</span>
                </Row>
              </dl>
            </div>

            <div>
              <h3 className="mb-1 font-display text-sm font-extrabold uppercase tracking-wide text-slatesoft">Contact & other</h3>
              <dl>
                <Row label="Address" icon={<MapPin className="h-4 w-4" />}>{student.address}</Row>
                <Row label="District" icon={<Home className="h-4 w-4" />}>{student.district}</Row>
                <Row label="Transport" icon={<Bus className="h-4 w-4" />}>{student.transport}</Row>
                <Row label="Medical notes" icon={<ShieldAlert className="h-4 w-4" />}>{student.medical}</Row>
                <Row label="Last activity">{student.lastActive}</Row>
              </dl>
            </div>
          </div>
        )}

        {/* ────────────────────────── attendance ────────────────────────── */}
        {tab === 'attendance' && (
          <div className="p-5">
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Present days', value: attendance.reduce((a, m) => a + m.present, 0) },
                { label: 'Absent days', value: attendance.reduce((a, m) => a + m.absent, 0) },
                { label: 'Late arrivals', value: attendance.reduce((a, m) => a + m.late, 0) },
                { label: 'Approved leave', value: attendance.reduce((a, m) => a + m.leave, 0) },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-line bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">{k.label}</p>
                  <p className="mt-0.5 font-display text-xl font-extrabold text-ink">{k.value}</p>
                </div>
              ))}
            </div>

            <div className="h-64 w-full rounded-2xl border border-line bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slatesoft">Monthly attendance rate</p>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={attendance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#51607A' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#51607A' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#F5F8FC' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E6ECF4', fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, 'Attendance']}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                    {attendance.map((m, i) => (
                      <Cell key={i} fill={m.pct >= 90 ? '#1B8A5A' : m.pct >= 75 ? '#E0A800' : '#D8315B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[520px] border-collapse">
                <thead className="border-b border-line bg-surfaceinset/40">
                  <tr><Th>Month</Th><Th>Present</Th><Th>Absent</Th><Th>Late</Th><Th>Leave</Th><Th>Rate</Th></tr>
                </thead>
                <tbody>
                  {attendance.map((m) => (
                    <tr key={m.month} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 text-sm font-bold text-ink">{m.month} 2026</td>
                      <td className="px-4 py-2.5 text-sm text-ink">{m.present}</td>
                      <td className="px-4 py-2.5 text-sm text-ink">{m.absent}</td>
                      <td className="px-4 py-2.5 text-sm text-ink">{m.late}</td>
                      <td className="px-4 py-2.5 text-sm text-ink">{m.leave}</td>
                      <td className="px-4 py-2.5">
                        <Badge tone={m.pct >= 90 ? 'success' : m.pct >= 75 ? 'warning' : 'danger'}>{m.pct}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────────────────────── results ────────────────────────── */}
        {tab === 'results' && currentExam && (
          <div className="p-5">
            <div className="mb-5 flex flex-wrap gap-2">
              {results.map((r, i) => (
                <button
                  key={r.exam}
                  type="button"
                  onClick={() => setExamIndex(i)}
                  className={`rounded-xl border px-4 py-2.5 text-left transition ${
                    i === examIndex ? 'border-brand bg-brand/5' : 'border-line bg-white hover:border-ocean'
                  }`}
                >
                  <p className={`text-sm font-bold ${i === examIndex ? 'text-brand' : 'text-ink'}`}>{r.exam}</p>
                  <p className="text-[11px] text-slatesoft">{r.year} · published {r.published}</p>
                </button>
              ))}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-brand/5 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">GPA</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-brand">{currentExam.gpa.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-surfaceinset px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">Class position</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-ink">{currentExam.position} / {currentExam.outOf}</p>
              </div>
              <div className="rounded-xl bg-surfaceinset px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">Subjects</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-ink">{currentExam.subjects.length}</p>
              </div>
              <div className="rounded-xl bg-surfaceinset px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">Highest mark</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-ink">
                  {Math.max(...currentExam.subjects.map((s) => s.total))}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[600px] border-collapse">
                <thead className="border-b border-line bg-surfaceinset/40">
                  <tr><Th>Subject</Th><Th>Written</Th><Th>MCQ</Th><Th>Practical</Th><Th>Total</Th><Th>Grade</Th><Th>Point</Th></tr>
                </thead>
                <tbody>
                  {currentExam.subjects.map((s) => (
                    <tr key={s.subject} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 text-sm font-bold text-ink">{s.subject}</td>
                      <td className="px-4 py-2.5 text-sm text-ink">{s.written}</td>
                      <td className="px-4 py-2.5 text-sm text-ink">{s.mcq}</td>
                      <td className="px-4 py-2.5 text-sm text-ink">{s.practical}</td>
                      <td className="px-4 py-2.5 font-display text-sm font-extrabold text-ink">{s.total}</td>
                      <td className="px-4 py-2.5"><Badge tone={GRADE_TONE(s.grade)}>{s.grade}</Badge></td>
                      <td className="px-4 py-2.5 font-mono text-sm text-slatesoft">{s.point.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────────────────────── fees ────────────────────────── */}
        {tab === 'fees' && (
          <div className="p-5">
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-white px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">Billed this session</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-ink">{taka(fees.reduce((a, f) => a + f.amount, 0))}</p>
              </div>
              <div className="rounded-xl border border-line bg-white px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">Collected</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-success">{taka(totalPaid)}</p>
              </div>
              <div className="rounded-xl border border-line bg-white px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slatesoft">Outstanding</p>
                <p className={`mt-0.5 font-display text-xl font-extrabold ${totalDue > 0 ? 'text-alert' : 'text-success'}`}>{taka(totalDue)}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="border-b border-line bg-surfaceinset/40">
                  <tr><Th>Invoice</Th><Th>Head</Th><Th>Period</Th><Th>Amount</Th><Th>Paid</Th><Th>Due date</Th><Th>Method</Th><Th>Status</Th></tr>
                </thead>
                <tbody>
                  {fees.map((f) => (
                    <tr key={f.invoice} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-mono text-xs text-ocean">{f.invoice}</td>
                      <td className="px-4 py-2.5 text-sm font-bold text-ink">{f.head}</td>
                      <td className="px-4 py-2.5 text-sm text-slatesoft">{f.period}</td>
                      <td className="px-4 py-2.5 font-mono text-sm text-ink">{taka(f.amount)}</td>
                      <td className="px-4 py-2.5 font-mono text-sm text-slatesoft">{taka(f.paid)}</td>
                      <td className="px-4 py-2.5 text-sm text-slatesoft">{f.dueDate}</td>
                      <td className="px-4 py-2.5 text-sm text-slatesoft">{f.method}</td>
                      <td className="px-4 py-2.5"><Badge tone={FEE_TONE[f.status]}>{FEE_LABEL[f.status]}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-slatesoft">
              Collecting a payment is a Phase 6 screen — this tab is read-only until the fees module lands.
            </p>
          </div>
        )}

        {/* ────────────────────────── documents ────────────────────────── */}
        {tab === 'documents' && (
          <div className="p-5">
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[520px] border-collapse">
                <thead className="border-b border-line bg-surfaceinset/40">
                  <tr><Th>File</Th><Th>Type</Th><Th>Uploaded</Th><Th>Size</Th><th className="w-16 px-4 py-3" /></tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.name} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2.5 text-sm font-bold text-ink">
                          <FileText className="h-4 w-4 text-slatesoft" /> {d.name}
                        </span>
                      </td>
                      <td className="px-4 py-3"><Badge tone="neutral">{d.type}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slatesoft">{d.uploadedAt}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slatesoft">{d.size}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => notify(`${d.name} — download starts once file storage is wired`)}
                          className="rounded-lg p-1.5 text-slatesoft transition hover:bg-surfaceinset hover:text-brand"
                          aria-label={`Download ${d.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────────────────────── activity ────────────────────────── */}
        {tab === 'activity' && (
          <div className="p-5">
            <ol className="relative ml-3 border-l border-line pl-6">
              {timeline.map((e, i) => (
                <li key={i} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-ocean" />
                  <p className="text-sm font-bold text-ink">{e.action}</p>
                  <p className="mt-0.5 text-sm text-slatesoft">{e.detail}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slatesoft">
                    {e.at} · {e.actor}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={dialog === 'suspend'}
        title="Suspend this student?"
        message="They lose portal access and drop out of attendance and exam lists until restored. The record is kept."
        confirmLabel="Suspend student"
        tone="warning"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />
      <ConfirmDialog
        open={dialog === 'restore'}
        title="Restore this student?"
        message="They will be marked active again and reappear in attendance and exam lists."
        confirmLabel="Restore"
        tone="brand"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        title="Remove this student?"
        message="They come off the active roll. Attendance, results and fee history are retained for audit."
        confirmLabel="Remove student"
        busy={busy}
        requireText={student.code}
        onCancel={() => setDialog(null)}
        onConfirm={runDialog}
      />

      <Toast toast={toast} onClose={clear} />
    </>
  );
};

export default StudentDetailPage;

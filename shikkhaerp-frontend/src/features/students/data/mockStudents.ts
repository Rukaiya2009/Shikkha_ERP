/**
 * ── MOCK DATA · Students ──────────────────────────────────────────────────
 *
 * Every value in this file is invented. No student here is real and nothing
 * reads from or writes to a database. The screens that consume it are fully
 * built and interactive so the module can be reviewed before the backend
 * lands.
 *
 * When the endpoints below exist, delete this file and point the three
 * student screens at a `student.service.ts` with the same shapes:
 *
 *   GET    /students?page&size&q&class&section&status   → Page<Student>
 *   GET    /students/{id}                               → Student
 *   POST   /students                                    → Student
 *   PUT    /students/{id}                               → Student
 *   DELETE /students/{id}                               → soft delete
 *   PATCH  /students/{id}/status                        → suspend / restore
 *   GET    /students/{id}/attendance?year               → AttendanceMonth[]
 *   GET    /students/{id}/results                       → ExamResult[]
 *   GET    /students/{id}/fees                          → FeeInvoice[]
 *
 * The list screen filters, sorts and pages in memory here; against the real
 * API those four become query parameters and the component stops slicing.
 */

/* ══════════════════════════════ types ══════════════════════════════ */

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRANSFERRED' | 'GRADUATED';
export type FeeStatus = 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE';
export type Gender = 'Male' | 'Female';

export interface Guardian {
  name: string;
  relation: string;
  phone: string;
  email: string;
  occupation: string;
  nid: string;
}

export interface Student {
  id: string;
  /** Human-facing admission code, e.g. SHK-2026-0142. */
  code: string;
  roll: number;
  name: string;
  nameBn: string;
  className: string;
  section: string;
  shift: 'Morning' | 'Day';
  group: string;
  gender: Gender;
  dob: string;
  bloodGroup: string;
  religion: string;
  admissionDate: string;
  status: StudentStatus;
  /** Attendance percentage this academic year. */
  attendance: number;
  /** Average marks across the last three exams. */
  avgMarks: number;
  gpa: number;
  feeStatus: FeeStatus;
  dueAmount: number;
  phone: string;
  email: string;
  address: string;
  district: string;
  guardian: Guardian;
  medical: string;
  house: string;
  transport: string;
  lastActive: string;
}

export interface AttendanceMonth {
  month: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  pct: number;
}

export interface SubjectMark {
  subject: string;
  written: number;
  mcq: number;
  practical: number;
  total: number;
  grade: string;
  point: number;
}

export interface ExamResult {
  exam: string;
  year: number;
  published: string;
  subjects: SubjectMark[];
  gpa: number;
  position: number;
  outOf: number;
}

export interface FeeInvoice {
  invoice: string;
  head: string;
  period: string;
  amount: number;
  paid: number;
  status: FeeStatus;
  dueDate: string;
  method: string;
}

export interface DocumentRow {
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
}

export interface TimelineEvent {
  at: string;
  actor: string;
  action: string;
  detail: string;
}

/* ═══════════════════════════ reference lists ═══════════════════════════ */

export const CLASSES = ['Six', 'Seven', 'Eight', 'Nine', 'Ten'];
export const SECTIONS = ['A', 'B', 'C'];
export const GROUPS = ['General', 'Science', 'Business Studies', 'Humanities'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
export const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism'];
export const RELATIONS = ['Father', 'Mother', 'Uncle', 'Aunt', 'Grandfather', 'Legal guardian'];
export const DISTRICTS = ['Dhaka', 'Gazipur', 'Narayanganj', 'Savar', 'Munshiganj', 'Manikganj'];
export const HOUSES = ['Shapla', 'Doel', 'Rojonigondha', 'Kingfisher'];
export const TRANSPORT_ROUTES = ['Not using', 'Route 1 · Mirpur', 'Route 2 · Uttara', 'Route 3 · Dhanmondi', 'Route 4 · Motijheel'];

export const STATUS_LABEL: Record<StudentStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  TRANSFERRED: 'Transferred',
  GRADUATED: 'Graduated',
};

export const FEE_LABEL: Record<FeeStatus, string> = {
  PAID: 'Paid',
  PARTIAL: 'Partial',
  DUE: 'Due',
  OVERDUE: 'Overdue',
};

/* ═════════════════════════════ seed pools ═════════════════════════════ */

const FIRST = [
  'Tanvir', 'Nusrat', 'Rakib', 'Sumaiya', 'Arif', 'Farhana', 'Sabbir', 'Mim',
  'Rezaul', 'Anika', 'Shakil', 'Tasnim', 'Imran', 'Jarin', 'Naimul', 'Sadia',
  'Fahim', 'Ishrat', 'Mahdi', 'Raisa', 'Sohan', 'Nabila', 'Ratul', 'Oishi',
  'Zubayer', 'Prithila', 'Adnan', 'Maliha', 'Sifat', 'Rumana', 'Tahsin', 'Lamia',
  'Emon', 'Sharmin', 'Rifat', 'Nowshin', 'Mahim', 'Tanha', 'Siam', 'Afia',
  'Junaid', 'Samira', 'Nayeem', 'Rubaiya', 'Toha', 'Meherun', 'Asif', 'Prapti',
];

const LAST = [
  'Ahmed', 'Rahman', 'Islam', 'Hossain', 'Chowdhury', 'Karim', 'Akter', 'Sultana',
  'Mahmud', 'Siddique', 'Bhuiyan', 'Talukder', 'Sarker', 'Mondal', 'Kabir', 'Haque',
];

const FIRST_BN = [
  'তানভীর', 'নুসরাত', 'রাকিব', 'সুমাইয়া', 'আরিফ', 'ফারহানা', 'সাব্বির', 'মিম',
  'রেজাউল', 'আনিকা', 'শাকিল', 'তাসনিম', 'ইমরান', 'জারিন', 'নাইমুল', 'সাদিয়া',
];

const LAST_BN = ['আহমেদ', 'রহমান', 'ইসলাম', 'হোসেন', 'চৌধুরী', 'করিম', 'আক্তার', 'সুলতানা'];

const AREAS = [
  'Mirpur DOHS', 'Uttara Sector 7', 'Dhanmondi 27', 'Bashundhara R/A', 'Mohammadpur',
  'Banasree Block C', 'Shantinagar', 'Rampura TV Road', 'Kallyanpur', 'Malibagh',
];

const OCCUPATIONS = ['Businessman', 'Govt. service', 'Teacher', 'Doctor', 'Engineer', 'Homemaker', 'Banker', 'Farmer'];

const SUBJECTS_BY_GROUP: Record<string, string[]> = {
  General: ['Bangla', 'English', 'Mathematics', 'Science', 'Social Science', 'Religion', 'ICT'],
  Science: ['Bangla', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'ICT'],
  'Business Studies': ['Bangla', 'English', 'Mathematics', 'Accounting', 'Business Entrepreneurship', 'Finance', 'ICT'],
  Humanities: ['Bangla', 'English', 'Mathematics', 'Geography', 'Civics', 'History', 'ICT'],
};

/* ═════════════════════ deterministic pseudo-random ═════════════════════ */

/** Same seed → same value, so the demo never reshuffles between renders. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const pick = <T,>(arr: T[], seed: number): T => arr[Math.floor(rand(seed) * arr.length) % arr.length];
const between = (seed: number, min: number, max: number) => Math.floor(rand(seed) * (max - min + 1)) + min;

const pad = (n: number, width = 4) => String(n).padStart(width, '0');

/* ══════════════════════════ grade helpers ══════════════════════════ */

/** Standard Bangladeshi secondary grading scale. */
export const gradeFor = (marks: number): { grade: string; point: number } => {
  if (marks >= 80) return { grade: 'A+', point: 5.0 };
  if (marks >= 70) return { grade: 'A', point: 4.0 };
  if (marks >= 60) return { grade: 'A-', point: 3.5 };
  if (marks >= 50) return { grade: 'B', point: 3.0 };
  if (marks >= 40) return { grade: 'C', point: 2.0 };
  if (marks >= 33) return { grade: 'D', point: 1.0 };
  return { grade: 'F', point: 0.0 };
};

/* ════════════════════════════ the dataset ════════════════════════════ */

const TOTAL = 96;

const buildStudent = (i: number): Student => {
  const s = i + 7;
  const first = pick(FIRST, s * 3);
  const last = pick(LAST, s * 5);
  const className = CLASSES[i % CLASSES.length];
  const section = SECTIONS[Math.floor(i / CLASSES.length) % SECTIONS.length];
  const isSenior = className === 'Nine' || className === 'Ten';
  const group = isSenior ? pick(GROUPS.slice(1), s * 11) : 'General';
  const gender: Gender = rand(s * 13) > 0.48 ? 'Male' : 'Female';

  // Status: mostly active, with a realistic tail.
  const statusRoll = rand(s * 17);
  const status: StudentStatus =
    statusRoll > 0.93 ? 'SUSPENDED'
      : statusRoll > 0.88 ? 'INACTIVE'
        : statusRoll > 0.85 ? 'TRANSFERRED'
          : 'ACTIVE';

  const attendance = Number((between(s * 19, 62, 99) + rand(s * 23)).toFixed(1));
  const avgMarks = between(s * 29, 38, 94);
  const { point } = gradeFor(avgMarks);

  const dueRoll = rand(s * 31);
  const feeStatus: FeeStatus =
    dueRoll > 0.82 ? 'OVERDUE' : dueRoll > 0.66 ? 'DUE' : dueRoll > 0.52 ? 'PARTIAL' : 'PAID';
  const dueAmount = feeStatus === 'PAID' ? 0 : between(s * 37, 1, 9) * 500;

  const guardianRelation = pick(RELATIONS, s * 41);
  const guardianFirst = pick(FIRST, s * 43);
  const guardianLast = last; // family name usually carries

  return {
    id: `stu_${pad(i + 1)}`,
    code: `SHK-2026-${pad(i + 1)}`,
    roll: (i % 40) + 1,
    name: `${first} ${last}`,
    nameBn: `${pick(FIRST_BN, s * 3)} ${pick(LAST_BN, s * 5)}`,
    className,
    section,
    shift: i % 2 === 0 ? 'Morning' : 'Day',
    group,
    gender,
    dob: `${2009 + (i % 5)}-${pad(between(s * 47, 1, 12), 2)}-${pad(between(s * 53, 1, 28), 2)}`,
    bloodGroup: pick(BLOOD_GROUPS, s * 59),
    religion: pick(RELIGIONS, s * 61),
    admissionDate: `${2021 + (i % 4)}-01-${pad(between(s * 67, 5, 25), 2)}`,
    status,
    attendance,
    avgMarks,
    gpa: point,
    feeStatus,
    dueAmount,
    phone: `01${between(s * 71, 3, 9)}${pad(between(s * 73, 10000000, 99999999), 8)}`.slice(0, 11),
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@student.shikkha.edu.bd`,
    address: `House ${between(s * 79, 1, 90)}, Road ${between(s * 83, 1, 22)}, ${pick(AREAS, s * 89)}`,
    district: pick(DISTRICTS, s * 97),
    guardian: {
      name: `${guardianFirst} ${guardianLast}`,
      relation: guardianRelation,
      phone: `01${between(s * 101, 3, 9)}${pad(between(s * 103, 10000000, 99999999), 8)}`.slice(0, 11),
      email: `${guardianFirst.toLowerCase()}.${guardianLast.toLowerCase()}@gmail.com`,
      occupation: pick(OCCUPATIONS, s * 107),
      nid: `${between(s * 109, 1000, 9999)} ${between(s * 113, 100000, 999999)}`,
    },
    medical: rand(s * 127) > 0.85 ? 'Mild asthma — inhaler kept with the class teacher.' : 'No known conditions.',
    house: pick(HOUSES, s * 131),
    transport: pick(TRANSPORT_ROUTES, s * 137),
    lastActive: `${between(s * 139, 1, 28)} Jul 2026`,
  };
};

export const MOCK_STUDENTS: Student[] = Array.from({ length: TOTAL }, (_, i) => buildStudent(i));

export const findStudent = (id: string): Student | undefined =>
  MOCK_STUDENTS.find((s) => s.id === id);

/* ═══════════════════════ per-student detail data ═══════════════════════ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

export const attendanceFor = (student: Student): AttendanceMonth[] =>
  MONTHS.map((month, i) => {
    const seed = Number(student.id.replace(/\D/g, '')) * (i + 3);
    const working = 22;
    const absent = between(seed, 0, Math.max(1, Math.round((100 - student.attendance) / 4)));
    const late = between(seed * 3, 0, 3);
    const leave = between(seed * 5, 0, 2);
    const present = working - absent - leave;
    return {
      month,
      present,
      absent,
      late,
      leave,
      pct: Number(((present / working) * 100).toFixed(1)),
    };
  });

export const resultsFor = (student: Student): ExamResult[] => {
  const subjects = SUBJECTS_BY_GROUP[student.group] ?? SUBJECTS_BY_GROUP.General;
  const exams = [
    { exam: 'Half-yearly Examination', year: 2026, published: '12 Jul 2026' },
    { exam: 'First Terminal Examination', year: 2026, published: '18 Apr 2026' },
    { exam: 'Annual Examination', year: 2025, published: '20 Dec 2025' },
  ];

  return exams.map((e, ei) => {
    const rows: SubjectMark[] = subjects.map((subject, si) => {
      const seed = Number(student.id.replace(/\D/g, '')) * (si + 2) * (ei + 3);
      const base = Math.min(98, Math.max(30, student.avgMarks + between(seed, -12, 12)));
      const written = Math.round(base * 0.7);
      const mcq = Math.round(base * 0.2);
      const practical = base - written - mcq;
      const total = written + mcq + practical;
      const { grade, point } = gradeFor(total);
      return { subject, written, mcq, practical, total, grade, point };
    });

    const gpa = Number((rows.reduce((a, r) => a + r.point, 0) / rows.length).toFixed(2));
    return {
      ...e,
      subjects: rows,
      gpa: Math.min(5, gpa),
      position: between(Number(student.id.replace(/\D/g, '')) * (ei + 11), 1, 38),
      outOf: 40,
    };
  });
};

export const feesFor = (student: Student): FeeInvoice[] => {
  const heads = [
    { head: 'Tuition fee', period: 'July 2026', amount: 2500, dueDate: '10 Jul 2026' },
    { head: 'Tuition fee', period: 'June 2026', amount: 2500, dueDate: '10 Jun 2026' },
    { head: 'Examination fee', period: 'Half-yearly 2026', amount: 1200, dueDate: '01 Jun 2026' },
    { head: 'Tuition fee', period: 'May 2026', amount: 2500, dueDate: '10 May 2026' },
    { head: 'Library & lab', period: 'Session 2026', amount: 1800, dueDate: '15 Feb 2026' },
    { head: 'Admission renewal', period: 'Session 2026', amount: 3500, dueDate: '20 Jan 2026' },
  ];

  const n = Number(student.id.replace(/\D/g, ''));
  return heads.map((h, i) => {
    const seed = n * (i + 7);
    const unpaidTop = student.feeStatus !== 'PAID' && i === 0;
    const partial = student.feeStatus === 'PARTIAL' && i === 1;
    const paid = unpaidTop ? 0 : partial ? Math.round(h.amount / 2) : h.amount;
    const status: FeeStatus =
      paid === 0 ? (student.feeStatus === 'OVERDUE' ? 'OVERDUE' : 'DUE')
        : paid < h.amount ? 'PARTIAL'
          : 'PAID';
    return {
      invoice: `INV-26-${pad(n * 6 + i, 5)}`,
      ...h,
      paid,
      status,
      method: paid === 0 ? '—' : pick(['bKash', 'Nagad', 'Cash', 'Bank transfer'], seed),
    };
  });
};

export const documentsFor = (student: Student): DocumentRow[] => [
  { name: 'Birth certificate.pdf', type: 'Identity', uploadedAt: student.admissionDate, size: '412 KB' },
  { name: 'Previous school TC.pdf', type: 'Transfer', uploadedAt: student.admissionDate, size: '288 KB' },
  { name: 'Guardian NID.jpg', type: 'Identity', uploadedAt: student.admissionDate, size: '1.1 MB' },
  { name: 'Passport photo.jpg', type: 'Photo', uploadedAt: student.admissionDate, size: '96 KB' },
];

export const timelineFor = (student: Student): TimelineEvent[] => [
  { at: '28 Jul 2026 · 09:14', actor: 'Nasrin Akter', action: 'Attendance marked', detail: 'Present — period 1, Bangla' },
  { at: '12 Jul 2026 · 16:40', actor: 'System', action: 'Result published', detail: `Half-yearly examination · GPA ${student.gpa.toFixed(2)}` },
  { at: '10 Jul 2026 · 11:02', actor: 'Rukaiya S.', action: 'Fee invoice issued', detail: 'Tuition fee · July 2026 · ৳2,500' },
  { at: '02 Jun 2026 · 10:20', actor: 'Md. Salim', action: 'Guardian contact updated', detail: `Phone changed to ${student.guardian.phone}` },
  { at: student.admissionDate, actor: 'Rukaiya S.', action: 'Student enrolled', detail: `Admitted to Class ${student.className}, Section ${student.section}` },
];

/* ═════════════════════════ list-level summaries ═════════════════════════ */

export const studentTotals = (rows: Student[] = MOCK_STUDENTS) => {
  const active = rows.filter((r) => r.status === 'ACTIVE');
  const avgAttendance = active.length
    ? active.reduce((a, r) => a + r.attendance, 0) / active.length
    : 0;
  const due = rows.reduce((a, r) => a + r.dueAmount, 0);
  return {
    total: rows.length,
    active: active.length,
    boys: rows.filter((r) => r.gender === 'Male').length,
    girls: rows.filter((r) => r.gender === 'Female').length,
    avgAttendance: Number(avgAttendance.toFixed(1)),
    dueCount: rows.filter((r) => r.feeStatus === 'DUE' || r.feeStatus === 'OVERDUE').length,
    dueAmount: due,
  };
};

/** ৳ with thousands separators, used across the module. */
export const taka = (n: number) => `৳${n.toLocaleString('en-IN')}`;

/**
 * MOCK DATA for the Admin dashboard.
 * Every value here is placeholder/demo data. Each block maps to a backend
 * endpoint listed in API_REQUIREMENTS.md — swap these for live calls once the
 * backend team ships them. Nothing here writes to or reads from a real database.
 */

export const kpis = {
  students: 1284,
  studentsTrend: 4.2,
  studentsSpark: [1180, 1195, 1210, 1224, 1240, 1255, 1268, 1284],

  teachers: 86,
  teachersTrend: 1.1,
  teachersSpark: [80, 81, 82, 82, 83, 84, 85, 86],

  attendanceToday: 94.6, // percent
  attendanceTrend: 0.8,
  attendanceSpark: [92, 93, 91, 94, 95, 93, 94, 94.6],

  feeCollected: 1875000, // this month (BDT)
  feeTrend: 6.4,
  feeSpark: [1.2, 1.35, 1.4, 1.55, 1.62, 1.7, 1.78, 1.875],

  outstanding: 420000, // dues (BDT)
  outstandingTrend: -3.1,
  outstandingSpark: [0.52, 0.5, 0.49, 0.47, 0.45, 0.44, 0.43, 0.42],

  avgPerformance: 82.4, // percent
  performanceTrend: 2.0,
  performanceSpark: [78, 79, 80, 80, 81, 81, 82, 82.4],
};

export const enrollmentTrend = [
  { month: 'Aug', students: 1120, revenue: 1.42 },
  { month: 'Sep', students: 1155, revenue: 1.5 },
  { month: 'Oct', students: 1190, revenue: 1.55 },
  { month: 'Nov', students: 1210, revenue: 1.6 },
  { month: 'Dec', students: 1224, revenue: 1.58 },
  { month: 'Jan', students: 1240, revenue: 1.66 },
  { month: 'Feb', students: 1255, revenue: 1.72 },
  { month: 'Mar', students: 1262, revenue: 1.75 },
  { month: 'Apr', students: 1270, revenue: 1.8 },
  { month: 'May', students: 1276, revenue: 1.84 },
  { month: 'Jun', students: 1280, revenue: 1.86 },
  { month: 'Jul', students: 1284, revenue: 1.875 },
];

export const weeklyAttendance = [
  { day: 'Sat', present: 1180, absent: 104 },
  { day: 'Sun', present: 1205, absent: 79 },
  { day: 'Mon', present: 1168, absent: 116 },
  { day: 'Tue', present: 1224, absent: 60 },
  { day: 'Wed', present: 1198, absent: 86 },
  { day: 'Thu', present: 1215, absent: 69 },
  { day: 'Fri', present: 0, absent: 0 },
];

export const genderRatio = [
  { name: 'Boys', value: 712 },
  { name: 'Girls', value: 572 },
];

export const classDistribution = [
  { class: 'Class 6', students: 168 },
  { class: 'Class 7', students: 182 },
  { class: 'Class 8', students: 176 },
  { class: 'Class 9', students: 205 },
  { class: 'Class 10', students: 214 },
  { class: 'Class 11', students: 168 },
  { class: 'Class 12', students: 171 },
];

export const feeStatus = {
  target: 2_300_000,
  collected: 1_875_000,
  defaulters: [
    { name: 'Tanvir Ahmed', class: 'Class 9', due: 12500 },
    { name: 'Nusrat Jahan', class: 'Class 7', due: 9800 },
    { name: 'Rifat Hasan', class: 'Class 10', due: 15000 },
    { name: 'Sadia Islam', class: 'Class 8', due: 7200 },
  ],
};

export const recentActivity = [
  { who: 'Md Shafique', action: 'enrolled a new student in Class 9', when: '12m ago', tone: 'info' as const },
  { who: 'Abdullah', action: 'submitted Class 7 mid-term results', when: '38m ago', tone: 'success' as const },
  { who: 'Accounts', action: 'received ৳12,500 fee payment', when: '1h ago', tone: 'success' as const },
  { who: 'Nadia Akter', action: 'requested leave for 2 days', when: '2h ago', tone: 'warning' as const },
  { who: 'System', action: 'generated monthly attendance report', when: '3h ago', tone: 'info' as const },
];

export const announcements = [
  { title: 'Annual Sports Day', body: 'Scheduled for 15 August. All classes to participate.', date: 'Jul 28' },
  { title: 'Parent-Teacher Meeting', body: 'Class 9–10 guardians, Saturday 10 AM.', date: 'Jul 26' },
  { title: 'Fee Reminder', body: 'July fees due by end of month.', date: 'Jul 24' },
];

export const upcomingEvents = [
  { title: 'Mid-term Exams', date: 'Aug 04', tag: 'Exam' },
  { title: 'Science Fair', date: 'Aug 12', tag: 'Event' },
  { title: 'Sports Day', date: 'Aug 15', tag: 'Event' },
  { title: 'Result Publication', date: 'Aug 22', tag: 'Academic' },
];

export const pendingApprovals = [
  { id: 1, type: 'Admission', label: 'New admission — Ayesha Siddiqua (Class 6)' },
  { id: 2, type: 'Leave', label: 'Leave request — Nadia Akter (2 days)' },
  { id: 3, type: 'Transfer', label: 'Transfer certificate — Rakib Hossain (Class 10)' },
];

export const topPerformers = [
  { name: 'Fahmida Rahman', class: 'Class 10', score: 96.5 },
  { name: 'Arif Chowdhury', class: 'Class 9', score: 95.2 },
  { name: 'Sumaiya Akter', class: 'Class 12', score: 94.8 },
];

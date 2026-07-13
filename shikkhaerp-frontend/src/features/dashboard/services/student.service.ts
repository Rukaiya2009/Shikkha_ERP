import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

const BASE_URL = API_ENDPOINTS.DASHBOARD.STUDENT;

export interface StudentSummary {
  attendancePercentage: number;
  averageGrade: number;
  pendingAssignments: number;
  upcomingExams: number;
  completedAssignments: number;
  totalClasses: number;
}

export interface TodayClass {
  id: string;
  subject: string;
  teacherName: string;
  time: string;
  room: string;
  duration: number;
}

export interface WeeklyTimetable {
  day: string;
  classes: TodayClass[];
}

export interface AttendanceRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  subject: string;
  teacherName: string;
}

export interface AcademicPerformance {
  subject: string;
  assignments: number;
  midTerm: number;
  finalTerm: number;
  total: number;
  grade: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  marks?: number;
  feedback?: string;
}

export interface FeeDetails {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: string;
  transactionId?: string;
}

export interface ExamSchedule {
  id: string;
  examName: string;
  subject: string;
  date: string;
  time: string;
  room: string;
  duration: number;
  totalMarks: number;
}

export interface ExamResult {
  id: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
}

const studentService = {
  // Get Student Dashboard Summary
  getSummary: async (token: string): Promise<{ success: boolean; data: StudentSummary }> => {
    const response = await axiosInstance.get(`${BASE_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Today's Classes
  getTodayClasses: async (token: string): Promise<{ success: boolean; data: TodayClass[] }> => {
    const response = await axiosInstance.get(`${BASE_URL}/today-classes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Weekly Timetable
  getWeeklyTimetable: async (token: string): Promise<{ success: boolean; data: WeeklyTimetable[] }> => {
    const response = await axiosInstance.get(`${BASE_URL}/weekly-timetable`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Attendance Records
  getAttendanceRecords: async (token: string, month?: string, year?: string): Promise<{ success: boolean; data: AttendanceRecord[] }> => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const url = params.toString() ? `${BASE_URL}/attendance?${params.toString()}` : `${BASE_URL}/attendance`;
    const response = await axiosInstance.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Attendance Summary by Subject
  getAttendanceBySubject: async (token: string): Promise<{ success: boolean; data: { subject: string; percentage: number }[] }> => {
    const response = await axiosInstance.get(`${BASE_URL}/attendance/by-subject`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Academic Performance
  getAcademicPerformance: async (token: string, examType?: string): Promise<{ success: boolean; data: AcademicPerformance[] }> => {
    const url = examType ? `${BASE_URL}/performance?examType=${examType}` : `${BASE_URL}/performance`;
    const response = await axiosInstance.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Assignments
  getAssignments: async (token: string, status?: string): Promise<{ success: boolean; data: Assignment[] }> => {
    const url = status ? `${BASE_URL}/assignments?status=${status}` : `${BASE_URL}/assignments`;
    const response = await axiosInstance.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Assignment by ID
  getAssignmentById: async (token: string, assignmentId: string): Promise<{ success: boolean; data: Assignment }> => {
    const response = await axiosInstance.get(`${BASE_URL}/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Submit Assignment
  submitAssignment: async (
    token: string, 
    assignmentId: string, 
    data: { fileUrl: string; fileName: string; comments?: string }
  ): Promise<{ success: boolean; message: string; submissionId?: string }> => {
    const response = await axiosInstance.post(`${BASE_URL}/assignments/${assignmentId}/submit`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Fee Details
  getFeeDetails: async (token: string): Promise<{ success: boolean; data: FeeDetails[] }> => {
    const response = await axiosInstance.get(`${BASE_URL}/fees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Fee Summary
  getFeeSummary: async (token: string): Promise<{ success: boolean; data: { total: number; paid: number; pending: number; overdue: number } }> => {
    const response = await axiosInstance.get(`${BASE_URL}/fees/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Exam Schedule
  getExamSchedule: async (token: string, examId?: string): Promise<{ success: boolean; data: ExamSchedule[] }> => {
    const url = examId ? `${BASE_URL}/exams/schedule?examId=${examId}` : `${BASE_URL}/exams/schedule`;
    const response = await axiosInstance.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Results
  getResults: async (token: string, examId?: string): Promise<{ success: boolean; data: ExamResult[] }> => {
    const url = examId ? `${BASE_URL}/results?examId=${examId}` : `${BASE_URL}/results`;
    const response = await axiosInstance.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Overall Result Summary
  getResultSummary: async (token: string): Promise<{ success: boolean; data: { totalMarks: number; obtainedMarks: number; percentage: number; grade: string; rank?: number } }> => {
    const response = await axiosInstance.get(`${BASE_URL}/results/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Notifications
  getNotifications: async (token: string, limit?: number): Promise<{ success: boolean; data: { id: string; title: string; message: string; date: string; isRead: boolean }[] }> => {
    const url = limit ? `${BASE_URL}/notifications?limit=${limit}` : `${BASE_URL}/notifications`;
    const response = await axiosInstance.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Mark Notification as Read
  markNotificationAsRead: async (token: string, notificationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.put(`${BASE_URL}/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get Profile
  getProfile: async (token: string): Promise<{ success: boolean; data: { id: string; name: string; email: string; phone: string; address: string; profileImage: string; className: string; rollNumber: string; fatherName: string; motherName: string } }> => {
    const response = await axiosInstance.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update Profile
  updateProfile: async (token: string, data: { phone?: string; address?: string; profileImage?: string }): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await axiosInstance.put(`${BASE_URL}/profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default studentService;
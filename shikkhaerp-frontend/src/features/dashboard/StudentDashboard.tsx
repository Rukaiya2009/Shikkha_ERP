
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import studentService from './services/student.service';
import { DashboardLayout } from './components/DashboardLayout';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendance: 0,
    averageGrade: 0,
    pendingAssignments: 0,
    upcomingExams: 0,
  });

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const summary = await studentService.getSummary(token);
        setStats({
          attendance: summary.data?.attendancePercentage || 0,
          averageGrade: summary.data?.averageGrade || 0,
          pendingAssignments: summary.data?.pendingAssignments || 0,
          upcomingExams: summary.data?.upcomingExams || 0,
        });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="mb-6">
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Attendance</p>
          <p className="text-2xl font-bold text-green-600">{stats.attendance}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Average Grade</p>
          <p className="text-2xl font-bold text-blue-600">{stats.averageGrade}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Pending Assignments</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingAssignments}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Upcoming Exams</p>
          <p className="text-2xl font-bold text-purple-600">{stats.upcomingExams}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
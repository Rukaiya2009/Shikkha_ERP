import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import teacherService from './services/teacher.service';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayClasses: 0,
    pendingGrading: 0,
    attendanceToday: 0,
  });

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const summary = await teacherService.getSummary(token);
        setStats({
          totalStudents: summary.data?.totalStudents || 0,
          todayClasses: summary.data?.todayClasses || 0,
          pendingGrading: summary.data?.pendingGrading || 0,
          attendanceToday: summary.data?.attendanceToday || 0,
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
      <DashboardLayout title="Teacher Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="mb-6">
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">My Students</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Today's Classes</p>
          <p className="text-2xl font-bold text-gray-800">{stats.todayClasses}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Pending Grading</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingGrading}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Attendance Today</p>
          <p className="text-2xl font-bold text-green-600">{stats.attendanceToday}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Today's Classes</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-500 text-center">No classes today</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Pending Assignments to Grade</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-500 text-center">No pending assignments</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
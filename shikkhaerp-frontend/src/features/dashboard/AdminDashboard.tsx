import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import adminService from './services/admin.service';
import { DashboardLayout } from './components/DashboardLayout';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
  });

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const summary = await adminService.getSummary(token);
        setStats({
          totalStudents: summary.data?.totalStudents || 0,
          totalTeachers: summary.data?.totalTeachers || 0,
          totalClasses: summary.data?.totalClasses || 0,
          attendanceRate: summary.data?.attendanceRate || 0,
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
      <DashboardLayout title="School Admin Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="School Admin Dashboard">
      <div className="mb-6">
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Teachers</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalTeachers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Classes</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalClasses}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Attendance Rate</p>
          <p className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
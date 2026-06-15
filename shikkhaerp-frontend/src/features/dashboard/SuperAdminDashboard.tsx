import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import superAdminService from './services/superAdmin.service';
import { DashboardLayout } from './components/DashboardLayout';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalUsers: 0,
    totalRevenue: 0,
    growth: 0,
  });

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const summary = await superAdminService.getSummary(token);
        setStats({
          totalSchools: summary.data?.totalSchools || 0,
          totalUsers: summary.data?.totalUsers || 0,
          totalRevenue: summary.data?.totalRevenue || 0,
          growth: summary.data?.growth || 0,
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
      <DashboardLayout title="Super Admin Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Super Admin Dashboard">
      <div className="mb-6">
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Schools</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalSchools}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">${stats.totalRevenue}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Growth Rate</p>
          <p className="text-2xl font-bold text-green-600">+{stats.growth}%</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;

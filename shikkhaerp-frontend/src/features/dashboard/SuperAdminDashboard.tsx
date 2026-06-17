import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import superAdminService from './services/superAdmin.service';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      superAdminService.getStats(token)
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Schools</p>
          <p className="text-2xl font-bold">{stats?.totalSchools || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Active Schools</p>
          <p className="text-2xl font-bold">{stats?.activeSchools || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold">${stats?.revenue || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
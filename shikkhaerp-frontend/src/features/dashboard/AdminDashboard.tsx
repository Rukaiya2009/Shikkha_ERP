import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import adminService from './services/admin.service';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      adminService.getSummary(token)
        .then((data) => {
          setSummary(data);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">School Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold">{summary?.totalStudents || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Teachers</p>
          <p className="text-2xl font-bold">{summary?.totalTeachers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Classes</p>
          <p className="text-2xl font-bold">{summary?.totalClasses || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
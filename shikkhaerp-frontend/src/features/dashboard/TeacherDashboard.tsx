import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from './services/teacher.service';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      teacherService.getSummary(token)  // ✅ CORRECTED
        .then((res) => {
          setData(res);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">My Classes</p>
          <p className="text-2xl font-bold">{data?.classes || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold">{data?.students || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Pending Assignments</p>
          <p className="text-2xl font-bold">{data?.pending || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
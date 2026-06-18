import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import studentService from './services/student.service';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      studentService.getProfile(token)
        .then((data) => {
          setProfile(data);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Attendance</p>
          <p className="text-2xl font-bold">{profile?.attendance || 'N/A'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Overall Marks</p>
          <p className="text-2xl font-bold">{profile?.grade || 'N/A'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Upcoming Exams</p>
          <p className="text-2xl font-bold">{profile?.exams || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
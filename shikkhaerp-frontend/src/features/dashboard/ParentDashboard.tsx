import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import parentService from './services/parent.service';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      parentService.getMyChildren(token)  // ✅ CORRECTED
        .then((data) => {
          setChildren(data);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Parent Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => (
          <div key={child.id} className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-lg">{child.name}</h3>
            <p className="text-sm text-gray-500">Class: {child.class}</p>
            <p className="text-sm text-gray-500">Attendance: {child.attendance}%</p>
          </div>
        ))}
        {children.length === 0 && (
          <p className="text-gray-500 col-span-2">No children found.</p>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
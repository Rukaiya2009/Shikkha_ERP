import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import parentService from './services/parent.service';
import { DashboardLayout } from './components/DashboardLayout';

interface Child {
  id: string;
  name: string;
  className: string;
  attendance: number;
  averageGrade: number;
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [childrenData, notificationsData] = await Promise.all([
          parentService.getMyChildren(token),
          parentService.getNotifications(token),
        ]);
        
        setChildren(childrenData.data || []);
        setNotifications(notificationsData.data || []);
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
      <DashboardLayout title="Parent Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Parent Dashboard">
      <div className="mb-6">
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      {/* Children Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Children</h2>
        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No children found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {children.map((child) => (
              <div key={child.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{child.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {child.className}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Attendance</p>
                    <p className="text-2xl font-bold text-green-600">{child.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Average Grade</p>
                    <p className="text-2xl font-bold text-blue-600">{child.averageGrade}%</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    View Performance
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                    Pay Fees
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="p-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center">No notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
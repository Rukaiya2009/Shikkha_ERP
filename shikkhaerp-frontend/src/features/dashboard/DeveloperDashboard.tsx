import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const DeveloperDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              👨‍💻 Developer Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.fullName || 'Developer'}!</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              🔐 Developer Role
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Approvals Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">📋 Pending Approvals</h3>
              <p className="text-gray-500 text-sm mt-1">
                Review and approve new school demo requests
              </p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              New
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm border-b pb-2">
              <span className="text-gray-600">ABC School</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between text-sm border-b pb-2">
              <span className="text-gray-600">Dhaka Model School</span>
              <span className="text-xs text-gray-400">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">+ 3 more pending</span>
            </div>
          </div>
          <Link
            to="/app/approve"
            className="mt-4 inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            View All Pending Requests
          </Link>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800">⚡ Quick Actions</h3>
          <p className="text-gray-500 text-sm mt-1">
            Common tasks for developers
          </p>
          <div className="mt-4 space-y-3">
            <Link
              to="/app/approve"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
            >
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Review Demo Requests</p>
                <p className="text-xs text-gray-500">Approve or reject pending schools</p>
              </div>
            </Link>
            <Link
              to="/super-admin/dashboard"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
            >
              <span className="text-xl">🏫</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Manage Schools</p>
                <p className="text-xs text-gray-500">View all schools in the system</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">📧</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Email Logs</p>
                <p className="text-xs text-gray-500">Check email delivery status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800">🖥️ System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-800">API Status</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-800">Database</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-800">Email Service</p>
              <p className="text-xs text-yellow-600">Configured</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
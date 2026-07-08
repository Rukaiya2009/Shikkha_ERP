import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { axiosInstance } from '../../core/api/axiosInstance.ts.bak';
import { API_ENDPOINTS } from '../../core/api/apiEndpoints';
import { Button } from '../../shared/components/Button';

interface TrialInfo {
  schoolName: string;
  trialStart: string;
  trialEnd: string;
  daysRemaining: number;
  totalDays: number;
}

const WelcomeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrialInfo = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.TRIAL.INFO);
        setTrialInfo(response.data);
        setError(null);
      } catch (err: any) {
        setError('Could not load trial information.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrialInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !trialInfo) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error || 'No trial information available.'}</p>
      </div>
    );
  }

  const progress = ((trialInfo.totalDays - trialInfo.daysRemaining) / trialInfo.totalDays) * 100;
  const isExpiring = trialInfo.daysRemaining <= 7;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              👋 Welcome, {user?.fullName || 'Admin'}!
            </h1>
            <p className="text-gray-500 mt-1">{trialInfo.schoolName}</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              🕐 Free Trial
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{trialInfo.daysRemaining} days left</span>
            <span>Expires: {new Date(trialInfo.trialEnd).toLocaleDateString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isExpiring ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {isExpiring && (
            <p className="text-red-600 text-sm mt-2 font-semibold">
              ⚠️ Your trial ends in {trialInfo.daysRemaining} days. Please upgrade to continue.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800">👤 Add Staff</h3>
          <p className="text-gray-500 text-sm mt-1">Invite teachers and administrators</p>
          <Button variant="primary" size="sm" className="mt-4">
            Get Started
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800">📚 Add Students</h3>
          <p className="text-gray-500 text-sm mt-1">Enroll students in your school</p>
          <Button variant="primary" size="sm" className="mt-4">
            Get Started
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800">📊 Explore Dashboard</h3>
          <p className="text-gray-500 text-sm mt-1">View insights and reports</p>
          <Button variant="primary" size="sm" className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
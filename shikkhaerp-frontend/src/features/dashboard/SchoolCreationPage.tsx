import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../core/api/apiEndpoints';
import { Button } from '../../shared/components/Button';
import { useAuth } from '../../hooks/useAuth';

interface PendingRequest {
  id: string;
  schoolName: string;
  schoolType: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  numberOfStudents: number;
  numberOfTeachers: number;
  superAdminName: string;
  superAdminEmail: string;
  superAdminPhone: string;
  submittedAt: string;
  expiresAt: string;
}

const SchoolCreationPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<PendingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.DEMO.PENDING}/${uuid}`);
        setRequest(response.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Request not found or already processed.');
        } else if (err.response?.status === 410) {
          setError('This approval link has expired (7 days limit). Please ask the requester to submit a new demo request.');
        } else {
          setError('Failed to load request details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchRequest();
    }
  }, [uuid]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.post(`${API_ENDPOINTS.DEMO.APPROVE}/${uuid}`);
      alert('School approved successfully! The super admin will receive their login email.');
      navigate('/super-admin/dashboard'); // or go to a list of pending requests
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    setSubmitting(true);
    try {
      await axiosInstance.post(`${API_ENDPOINTS.DEMO.REJECT}/${uuid}`);
      alert('Request rejected.');
      navigate('/super-admin/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading request details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700">Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">🏫 New School Request</h1>
          <p className="text-blue-100 text-sm">
            Submitted {new Date(request.submittedAt).toLocaleDateString()} · Expires in{' '}
            {Math.ceil((new Date(request.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">School Information</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium">{request.schoolName}</dd>
              <dt className="text-sm text-gray-500">Type</dt>
              <dd className="text-sm font-medium">{request.schoolType}</dd>
              <dt className="text-sm text-gray-500">Address</dt>
              <dd className="text-sm font-medium">{request.schoolAddress}</dd>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium">{request.schoolPhone}</dd>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">{request.schoolEmail}</dd>
              <dt className="text-sm text-gray-500">Students</dt>
              <dd className="text-sm font-medium">{request.numberOfStudents}</dd>
              <dt className="text-sm text-gray-500">Teachers</dt>
              <dd className="text-sm font-medium">{request.numberOfTeachers}</dd>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Super Admin Information</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium">{request.superAdminName}</dd>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">{request.superAdminEmail}</dd>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium">{request.superAdminPhone}</dd>
            </dl>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              variant="primary"
              className="flex-1"
              loading={submitting}
              onClick={handleApprove}
            >
              ✅ Approve & Create School
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={submitting}
              onClick={handleReject}
            >
              ❌ Reject Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCreationPage;
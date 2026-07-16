import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../core/api/apiEndpoints';
import { Button } from '../../shared/components/Button';

interface PendingRequest {
  uuid: string;
  schoolName: string;
  schoolType: string;
  branch: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  createdAt: string;
  expiresAt: string;
}

const APPROVAL_PRESET =
  'Congratulations! Your school has been approved for a 30-day free trial of ShikkhaERP. ' +
  'Please check your email for login instructions.';

const REJECTION_PRESET =
  'Thank you for your interest in ShikkhaERP. After reviewing your application, we are unable ' +
  'to proceed at this time. Please contact us if you have any questions.';

const SchoolCreationPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<PendingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Developer inputs
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [notePreset, setNotePreset] = useState<'approval' | 'rejection' | 'custom'>('approval');
  const [notes, setNotes] = useState(APPROVAL_PRESET);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await axiosInstance.get(`${API_ENDPOINTS.DEMO.PENDING}/${uuid}`);
        // Backend wraps the entity as { success, data }
        setRequest(res.data?.data ?? res.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Request not found or already processed.');
        } else if (err.response?.status === 410) {
          setError('This approval link has expired (7-day limit). Ask the requester to submit a new demo request.');
        } else {
          setError('Failed to load request details.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (uuid) fetchRequest();
  }, [uuid]);

  const onPresetChange = (value: 'approval' | 'rejection' | 'custom') => {
    setNotePreset(value);
    if (value === 'approval') setNotes(APPROVAL_PRESET);
    else if (value === 'rejection') setNotes(REJECTION_PRESET);
    else setNotes('');
  };

  const handleApprove = async () => {
    if (!superAdminEmail.trim()) {
      alert('Please enter the super admin email (obtained after calling the school).');
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post(`${API_ENDPOINTS.DEMO.APPROVE}/${uuid}`, {
        superAdminEmail: superAdminEmail.trim(),
        notes,
      });
      alert('School created! The super admin will receive a login email.');
      navigate('/developer/approvals');
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
      await axiosInstance.post(`${API_ENDPOINTS.DEMO.REJECT}/${uuid}`, {
        reason: notePreset === 'rejection' || notePreset === 'custom' ? notes : 'No reason provided',
      });
      alert('Request rejected. The requester has been notified.');
      navigate('/developer/approvals');
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
          <Button variant="primary" className="mt-4" onClick={() => navigate('/developer/approvals')}>
            Back to Approvals
          </Button>
        </div>
      </div>
    );
  }

  if (!request) return null;

  const expiresInDays = Math.ceil(
    (new Date(request.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">🏫 New School Request</h1>
          <p className="text-blue-100 text-sm">
            Submitted {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'} ·
            Expires in {isNaN(expiresInDays) ? '—' : expiresInDays} days
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* School info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">School Information</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium">{request.schoolName}</dd>
              <dt className="text-sm text-gray-500">Type</dt>
              <dd className="text-sm font-medium">{request.schoolType || 'HIGH_SCHOOL'}</dd>
              <dt className="text-sm text-gray-500">Branch</dt>
              <dd className="text-sm font-medium">{request.branch || '—'}</dd>
              <dt className="text-sm text-gray-500">Address</dt>
              <dd className="text-sm font-medium">{request.schoolAddress}</dd>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium">{request.schoolPhone}</dd>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">{request.schoolEmail}</dd>
            </dl>
          </div>

          {/* Requester info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Requester Information</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium">{request.requesterName}</dd>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">{request.requesterEmail}</dd>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium">{request.requesterPhone || '—'}</dd>
            </dl>
          </div>

          {/* Super admin email — entered after calling the school */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              ✏️ Super Admin Email
            </h2>
            <p className="text-xs text-gray-500 mt-1 mb-2">
              Call the school at {request.schoolPhone} to obtain this, then enter it below.
            </p>
            <input
              type="email"
              value={superAdminEmail}
              onChange={(e) => setSuperAdminEmail(e.target.value)}
              placeholder="superadmin@school.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Notes / message */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              📝 Notes / Message
            </h2>
            <select
              value={notePreset}
              onChange={(e) => onPresetChange(e.target.value as 'approval' | 'rejection' | 'custom')}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="approval">Approval preset</option>
              <option value="rejection">Rejection preset</option>
              <option value="custom">Custom message</option>
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              placeholder="Message included in the email to the super admin..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button variant="primary" className="flex-1" loading={submitting} onClick={handleApprove}>
              ✅ Create School
            </Button>
            <Button variant="danger" className="flex-1" loading={submitting} onClick={handleReject}>
              ❌ Reject Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCreationPage;

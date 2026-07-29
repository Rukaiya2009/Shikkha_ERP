import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../core/api/apiEndpoints';
import { Button } from '../../shared/components/Button';
import { PageHeader, SectionCard, Badge } from '../../shared/ui';
import { Building2, User, Mail, Phone, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';

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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-2 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <XCircle className="mx-auto h-10 w-10 text-[#B3261E]" />
          <h2 className="mt-3 font-display text-xl font-bold text-[#B3261E]">Something went wrong</h2>
          <p className="mt-2 text-sm text-[#B3261E]">{error}</p>
          <Button variant="primary" className="mt-5" onClick={() => navigate('/developer/approvals')}>
            Back to approvals
          </Button>
        </div>
      </div>
    );
  }

  if (!request) return null;

  const expiresInDays = Math.ceil(
    (new Date(request.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 border-b border-line py-3 last:border-0">
      <div className="mt-0.5 text-slatesoft">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-slatesoft">{label}</p>
        <p className="text-sm font-semibold text-ink">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New school request"
        subtitle="Review the demo request, then approve to create the school or reject it."
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <Badge tone={expiresInDays <= 2 ? 'danger' : 'info'} dot>
            <Clock className="mr-1 inline h-3 w-3" />
            {isNaN(expiresInDays) ? '—' : `Expires in ${expiresInDays}d`}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="School information">
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Name" value={request.schoolName} />
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Type" value={request.schoolType || 'HIGH_SCHOOL'} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Branch" value={request.branch} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={request.schoolAddress} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={request.schoolPhone} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={request.schoolEmail} />
        </SectionCard>

        <SectionCard title="Requester">
          <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={request.requesterName} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={request.requesterEmail} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={request.requesterPhone} />
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Super admin email" description={`Call the school at ${request.schoolPhone} to obtain this, then enter it below.`}>
          <input
            type="email"
            value={superAdminEmail}
            onChange={(e) => setSuperAdminEmail(e.target.value)}
            placeholder="superadmin@school.com"
            className="w-full rounded-xl border border-linestrong bg-surfacefield px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand-sky/30"
          />
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Message to send">
          <select
            value={notePreset}
            onChange={(e) => onPresetChange(e.target.value as 'approval' | 'rejection' | 'custom')}
            className="w-full rounded-xl border border-linestrong bg-surfacefield px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand-sky/30"
          >
            <option value="approval">Approval preset</option>
            <option value="rejection">Rejection preset</option>
            <option value="custom">Custom message</option>
          </select>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Message included in the email to the super admin…"
            className="mt-3 w-full resize-y rounded-xl border border-linestrong bg-surfacefield px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand-sky/30"
          />
        </SectionCard>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" className="flex-1" loading={submitting} onClick={handleApprove}>
          <CheckCircle2 className="h-4 w-4" /> Create school
        </Button>
        <Button variant="danger" className="flex-1" loading={submitting} onClick={handleReject}>
          <XCircle className="h-4 w-4" /> Reject request
        </Button>
      </div>
    </div>
  );
};

export default SchoolCreationPage;

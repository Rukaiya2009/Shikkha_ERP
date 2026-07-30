import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { axiosInstance } from '../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../core/api/apiEndpoints';
import { Button } from '../../shared/components/Button';
import { PageHeader, SectionCard, Badge } from '../../shared/ui';
import { UserPlus, GraduationCap, LayoutDashboard, Clock, AlertTriangle } from 'lucide-react';

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
      } catch {
        setError('Could not load trial information.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrialInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !trialInfo) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-[#B3261E]">{error || 'No trial information available.'}</p>
      </div>
    );
  }

  const progress = ((trialInfo.totalDays - trialInfo.daysRemaining) / trialInfo.totalDays) * 100;
  const isExpiring = trialInfo.daysRemaining <= 7;

  const quickCards = [
    { icon: <UserPlus className="h-5 w-5" />, title: 'Add staff', desc: 'Invite teachers and administrators', cta: 'Get started' },
    { icon: <GraduationCap className="h-5 w-5" />, title: 'Add students', desc: 'Enrol students in your school', cta: 'Get started' },
    { icon: <LayoutDashboard className="h-5 w-5" />, title: 'Explore dashboard', desc: 'View insights and reports', cta: 'Go to dashboard' },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`Welcome${user?.fullName ? ', ' + user.fullName : ''}!`}
        subtitle={trialInfo.schoolName}
        actions={<Badge tone="info" dot><Clock className="mr-1 inline h-3 w-3" /> Free trial</Badge>}
      />

      <SectionCard className="mb-6">
        <div className="flex items-center justify-between text-sm text-slatesoft">
          <span className="font-semibold text-ink">{trialInfo.daysRemaining} days left</span>
          <span>Expires {new Date(trialInfo.trialEnd).toLocaleDateString()}</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${isExpiring ? 'bg-red-500' : 'bg-brand'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {isExpiring && (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#B3261E]">
            <AlertTriangle className="h-4 w-4" />
            Your trial ends in {trialInfo.daysRemaining} days — upgrade to keep your data and access.
          </p>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickCards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:shadow-card-hover">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">{c.icon}</div>
            <h3 className="mt-4 font-display text-base font-bold text-ink">{c.title}</h3>
            <p className="mt-1 text-sm text-slatesoft">{c.desc}</p>
            <Button variant="primary" size="sm" className="mt-4">{c.cta}</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeDashboard;

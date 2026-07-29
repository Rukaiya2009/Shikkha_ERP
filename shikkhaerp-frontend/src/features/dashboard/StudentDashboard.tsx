import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import studentService from './services/student.service';
import { PageHeader, StatCard, SectionCard, SkeletonStatCards, Skeleton, Badge } from '../../shared/ui';
import type { BadgeTone } from '../../shared/ui';
import { CalendarCheck, Award, BookOpen, Wallet } from 'lucide-react';

const feesTone = (status?: string): BadgeTone => {
  const s = (status || '').toLowerCase();
  if (s.includes('paid')) return 'success';
  if (s.includes('pending')) return 'warning';
  if (s.includes('overdue')) return 'danger';
  return 'neutral';
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    studentService.getProfile(token)
      // service returns the { success, data } envelope — unwrap to the payload
      .then((res: any) => setProfile(res?.data ?? res))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const infoRows: { label: string; value?: string }[] = [
    { label: 'Class', value: profile?.className },
    { label: 'Roll number', value: profile?.rollNumber },
    { label: 'Student ID', value: profile?.studentId },
    { label: 'Blood group', value: profile?.bloodGroup },
    { label: "Father's name", value: profile?.fatherName },
    { label: "Mother's name", value: profile?.motherName },
    { label: 'Phone', value: profile?.phone },
    { label: 'Address', value: profile?.address },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Hi${profile?.name ? ', ' + profile.name : user?.fullName ? ', ' + user.fullName : ''}`}
        subtitle="Your academic snapshot for this term."
      />

      {loading ? (
        <SkeletonStatCards count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Attendance" value={`${profile?.attendanceRate ?? 0}%`}
            icon={<CalendarCheck className="h-5 w-5" />} accent="bg-emerald-500/10 text-emerald-600" />
          <StatCard label="Average grade" value={profile?.averageGrade ?? 'N/A'}
            icon={<Award className="h-5 w-5" />} accent="bg-brand/10 text-brand" />
          <StatCard label="Courses" value={profile?.coursesCount ?? 0}
            icon={<BookOpen className="h-5 w-5" />} accent="bg-violet-500/10 text-violet-600" />
          <StatCard label="Fees" value={profile?.feesStatus ?? '—'}
            icon={<Wallet className="h-5 w-5" />} accent="bg-amber-500/10 text-amber-600" />
        </div>
      )}

      <div className="mt-6">
        <SectionCard title="My profile" description="Details on record with your school">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {infoRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-4 border-b border-line pb-3">
                  <dt className="text-sm text-slatesoft">{r.label}</dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {r.label === 'Fees'
                      ? <Badge tone={feesTone(profile?.feesStatus)}>{r.value || '—'}</Badge>
                      : (r.value || '—')}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default StudentDashboard;

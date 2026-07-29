import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import adminService from './services/admin.service';
import { PageHeader, StatCard, SectionCard, EmptyState, SkeletonStatCards, SkeletonRows, Badge } from '../../shared/ui';
import { Users, GraduationCap, BookOpen, CalendarCheck, Wallet, TrendingUp, Activity } from 'lucide-react';

const currency = (n: number) =>
  '৳' + Number(n || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 });

const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return '';
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || undefined;
    Promise.allSettled([adminService.getSummary(token), adminService.getRecentActivities(token)])
      .then(([s, a]) => {
        if (s.status === 'fulfilled') setSummary(s.value);
        if (a.status === 'fulfilled' && Array.isArray(a.value)) setActivities(a.value);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="School Admin"
        subtitle={`Welcome back${user?.fullName ? ', ' + user.fullName : ''} — here's your school at a glance.`}
        actions={<Badge tone="info" dot>Live overview</Badge>}
      />

      {loading ? (
        <SkeletonStatCards count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Students" value={summary?.totalStudents ?? 0}
            icon={<GraduationCap className="h-5 w-5" />} accent="bg-brand/10 text-brand" />
          <StatCard label="Total Teachers" value={summary?.totalTeachers ?? 0}
            icon={<Users className="h-5 w-5" />} accent="bg-emerald-500/10 text-emerald-600" />
          <StatCard label="Classes" value={summary?.totalClasses ?? 0}
            icon={<BookOpen className="h-5 w-5" />} accent="bg-violet-500/10 text-violet-600" />
          <StatCard label="Attendance today" value={`${summary?.attendancePercentage ?? 0}%`}
            icon={<CalendarCheck className="h-5 w-5" />} accent="bg-sky-500/10 text-sky-600" />
        </div>
      )}

      {!loading && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Monthly revenue" value={currency(summary?.monthlyRevenue)}
            icon={<Wallet className="h-5 w-5" />} accent="bg-amber-500/10 text-amber-600" />
          <StatCard label="Total revenue" value={currency(summary?.totalRevenue)}
            icon={<TrendingUp className="h-5 w-5" />} accent="bg-emerald-500/10 text-emerald-600" />
          <StatCard label="Pending fees" value={summary?.pendingFees ?? 0}
            icon={<Wallet className="h-5 w-5" />} accent="bg-red-500/10 text-red-600" hint="Awaiting collection" />
        </div>
      )}

      <div className="mt-6">
        <SectionCard title="Recent activity" description="Latest changes across your school" flush>
          {loading ? (
            <div className="p-5"><SkeletonRows rows={4} /></div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-6 w-6" />}
              title="No recent activity"
              description="New enrolments, staff changes, and updates will appear here as they happen."
            />
          ) : (
            <ul className="divide-y divide-line">
              {activities.slice(0, 8).map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky font-display text-xs font-bold text-brand">
                      {(a.user || '?').split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{a.user || 'Someone'}</p>
                      <p className="text-xs text-slatesoft">{a.details || a.action}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-slatesoft">{timeAgo(a.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminDashboard;

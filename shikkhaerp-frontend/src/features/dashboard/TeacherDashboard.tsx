import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from './services/teacher.service';
import { PageHeader, StatCard, SectionCard, EmptyState, SkeletonStatCards } from '../../shared/ui';
import { GraduationCap, Users, ClipboardList, CalendarClock } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || undefined;
    teacherService.getSummary(token)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Teacher"
        subtitle={`Welcome back${user?.fullName ? ', ' + user.fullName : ''}.`}
      />

      {loading ? (
        <SkeletonStatCards count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="My classes" value={data?.classes ?? 0}
            icon={<GraduationCap className="h-5 w-5" />} accent="bg-brand/10 text-brand" />
          <StatCard label="Total students" value={data?.students ?? 0}
            icon={<Users className="h-5 w-5" />} accent="bg-emerald-500/10 text-emerald-600" />
          <StatCard label="Pending assignments" value={data?.pending ?? 0}
            icon={<ClipboardList className="h-5 w-5" />} accent="bg-amber-500/10 text-amber-600" />
        </div>
      )}

      {!loading && !data && (
        <div className="mt-6">
          <SectionCard flush>
            <EmptyState
              icon={<CalendarClock className="h-6 w-6" />}
              title="Your teaching workspace is being connected"
              description="Classes, timetable, attendance, gradebook, and assignments will appear here once the teacher data service is live. Use the sidebar to explore each area."
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

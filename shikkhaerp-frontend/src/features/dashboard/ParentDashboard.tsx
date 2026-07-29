import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import parentService from './services/parent.service';
import { PageHeader, SectionCard, EmptyState, Badge, SkeletonRows } from '../../shared/ui';
import { Users, GraduationCap } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || undefined;
    parentService.getMyChildren(token)
      .then((data) => setChildren(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Parent"
        subtitle={`Welcome back${user?.fullName ? ', ' + user.fullName : ''} — track your children's progress.`}
      />

      <SectionCard
        title="My children"
        actions={!loading && children.length > 0 && <Badge tone="neutral">{children.length} linked</Badge>}
        flush
      >
        {loading ? (
          <div className="p-5"><SkeletonRows rows={2} /></div>
        ) : children.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No children linked yet"
            description="Once your school links a student to your account, they'll appear here with attendance, grades, and fee status."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            {children.map((child) => (
              <div key={child.id} className="rounded-xl border border-line bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sky font-display text-sm font-bold text-brand">
                    {(child.name || '?').split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{child.name}</h3>
                    <p className="text-xs text-slatesoft">Class: {child.class ?? '—'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slatesoft" />
                  <span className="text-sm text-slatesoft">Attendance</span>
                  <span className="ml-auto text-sm font-semibold text-ink">{child.attendance ?? '—'}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default ParentDashboard;

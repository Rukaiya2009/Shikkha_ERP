import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import superAdminService from './services/superAdmin.service';
import { PageHeader, StatCard, SectionCard, EmptyState, SkeletonStatCards, SkeletonRows, Badge } from '../../shared/ui';
import type { BadgeTone } from '../../shared/ui';
import { Building2, Users, GraduationCap, UserCog, School } from 'lucide-react';

const statusTone = (status: string): BadgeTone => {
  const s = (status || '').toUpperCase();
  if (s.includes('ACTIVE')) return 'success';
  if (s.includes('PENDING')) return 'info';
  if (s.includes('SUSPEND') || s.includes('INACTIVE')) return 'warning';
  return 'neutral';
};

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || undefined;
    Promise.allSettled([superAdminService.getStats(token), superAdminService.getSchools(token)])
      .then(([st, sc]) => {
        if (st.status === 'fulfilled') setStats(st.value);
        if (sc.status === 'fulfilled' && Array.isArray(sc.value)) setSchools(sc.value);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Super Admin"
        subtitle={`Platform-wide overview${user?.fullName ? ' for ' + user.fullName : ''}.`}
        actions={<Badge tone="success" dot>All systems normal</Badge>}
      />

      {loading ? (
        <SkeletonStatCards count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Schools" value={stats?.totalSchools ?? 0}
            icon={<Building2 className="h-5 w-5" />} accent="bg-brand/10 text-brand" />
          <StatCard label="Total Users" value={stats?.totalUsers ?? 0}
            icon={<Users className="h-5 w-5" />} accent="bg-sky-500/10 text-sky-600" />
          <StatCard label="Students" value={stats?.totalStudents ?? 0}
            icon={<GraduationCap className="h-5 w-5" />} accent="bg-emerald-500/10 text-emerald-600" />
          <StatCard label="Teachers" value={stats?.totalTeachers ?? 0}
            icon={<UserCog className="h-5 w-5" />} accent="bg-violet-500/10 text-violet-600" />
        </div>
      )}

      <div className="mt-6">
        <SectionCard
          title="Schools"
          description="Every school registered on the platform"
          actions={!loading && <Badge tone="neutral">{schools.length} total</Badge>}
          flush
        >
          {loading ? (
            <div className="p-5"><SkeletonRows rows={4} /></div>
          ) : schools.length === 0 ? (
            <EmptyState
              icon={<School className="h-6 w-6" />}
              title="No schools yet"
              description="Approved demo requests become schools and will show up here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-surfaceinset text-left text-[11px] uppercase tracking-wider text-slatesoft">
                    <th className="px-5 py-3 font-bold">School</th>
                    <th className="px-5 py-3 font-bold">Code</th>
                    <th className="px-5 py-3 font-bold">Contact</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((s, i) => (
                    <tr key={s.id ?? i} className="border-t border-line">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{s.name}</p>
                            <p className="text-xs text-slatesoft">{s.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slatesoft">{s.code || '—'}</td>
                      <td className="px-5 py-3.5 text-slatesoft">{s.phone || '—'}</td>
                      <td className="px-5 py-3.5"><Badge tone={statusTone(s.status)}>{s.status || 'Unknown'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

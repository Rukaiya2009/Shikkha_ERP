import React from 'react';
import { PageHeader, SectionCard, Badge } from '../../shared/ui';
import type { BadgeTone } from '../../shared/ui';
import { Building2 } from 'lucide-react';

const schools: { name: string; admin: string; status: string; tone: BadgeTone }[] = [
  { name: 'ABC School', admin: 'Rahim Uddin', status: 'Active', tone: 'success' },
  { name: 'Dhaka Model School', admin: 'Nadia Akter', status: 'Active', tone: 'success' },
  { name: 'Green Valley College', admin: 'Sajid Hasan', status: 'Pending', tone: 'info' },
];

const DeveloperSchoolsPage: React.FC = () => (
  <div className="mx-auto max-w-5xl">
    <PageHeader
      title="All schools"
      subtitle="Browse and manage every school on the platform."
      icon={<Building2 className="h-5 w-5" />}
      actions={<Badge tone="neutral">{schools.length} schools</Badge>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {schools.map((s) => (
        <div key={s.name} className="rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Building2 className="h-4 w-4" /></div>
              <div>
                <h3 className="font-display text-base font-bold text-ink">{s.name}</h3>
                <p className="text-xs text-slatesoft">Admin: {s.admin}</p>
              </div>
            </div>
            <Badge tone={s.tone}>{s.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DeveloperSchoolsPage;

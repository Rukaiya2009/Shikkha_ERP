import React from 'react';
import { PageHeader, SectionCard, Badge } from '../../shared/ui';
import type { BadgeTone } from '../../shared/ui';
import { CheckSquare } from 'lucide-react';

const requests: { name: string; submitted: string; status: string; tone: BadgeTone }[] = [
  { name: 'ABC School', submitted: '2 hours ago', status: 'New', tone: 'info' },
  { name: 'Dhaka Model School', submitted: '5 hours ago', status: 'In review', tone: 'warning' },
  { name: 'Green Valley College', submitted: 'Yesterday', status: 'Pending', tone: 'neutral' },
];

const DeveloperApprovalsPage: React.FC = () => (
  <div className="mx-auto max-w-5xl">
    <PageHeader
      title="Pending approvals"
      subtitle="Review school demo requests and approval workflows."
      icon={<CheckSquare className="h-5 w-5" />}
      actions={<Badge tone="info">{requests.length + 1} pending</Badge>}
    />
    <SectionCard title="Requests" flush>
      <ul className="divide-y divide-line">
        {requests.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 font-display text-sm font-bold text-brand">
                {item.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="text-xs text-slatesoft">Submitted {item.submitted}</p>
              </div>
            </div>
            <Badge tone={item.tone}>{item.status}</Badge>
          </li>
        ))}
      </ul>
    </SectionCard>
  </div>
);

export default DeveloperApprovalsPage;

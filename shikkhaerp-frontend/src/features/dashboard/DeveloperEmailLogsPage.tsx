import React from 'react';
import { PageHeader, SectionCard, Badge } from '../../shared/ui';
import type { BadgeTone } from '../../shared/ui';
import { Mail } from 'lucide-react';

const logs: { subject: string; recipient: string; status: string; tone: BadgeTone }[] = [
  { subject: 'Welcome email', recipient: 'admin@school.com', status: 'Delivered', tone: 'success' },
  { subject: 'Password reset', recipient: 'teacher@school.com', status: 'Failed', tone: 'danger' },
  { subject: 'Demo request', recipient: 'developer@shikkhaerp.com', status: 'Delivered', tone: 'success' },
];

const DeveloperEmailLogsPage: React.FC = () => (
  <div className="mx-auto max-w-5xl">
    <PageHeader
      title="Email logs"
      subtitle="Monitor recent email activity and delivery status."
      icon={<Mail className="h-5 w-5" />}
    />
    <SectionCard title="Recent emails" flush>
      <ul className="divide-y divide-line">
        {logs.map((log) => (
          <li key={log.subject} className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surfaceinset text-slatesoft"><Mail className="h-4 w-4" /></div>
              <div>
                <p className="font-semibold text-ink">{log.subject}</p>
                <p className="text-xs text-slatesoft">To: {log.recipient}</p>
              </div>
            </div>
            <Badge tone={log.tone} dot>{log.status}</Badge>
          </li>
        ))}
      </ul>
    </SectionCard>
  </div>
);

export default DeveloperEmailLogsPage;

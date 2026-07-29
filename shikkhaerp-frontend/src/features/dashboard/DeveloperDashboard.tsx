import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { PageHeader, StatCard, SectionCard, Badge } from '../../shared/ui';
import { Code2, CheckSquare, Building2, Mail, ArrowRight, Server, Database, MailCheck } from 'lucide-react';

const pending = [
  { name: 'ABC School', when: '2 hours ago' },
  { name: 'Dhaka Model School', when: '5 hours ago' },
];

const DeveloperDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Developer"
        subtitle={`Welcome back${user?.fullName ? ', ' + user.fullName : ''}.`}
        icon={<Code2 className="h-5 w-5" />}
        actions={<Badge tone="purple" dot>Developer role</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending approvals" value={pending.length + 3}
          icon={<CheckSquare className="h-5 w-5" />} accent="bg-brand/10 text-brand" />
        <StatCard label="Active schools" value={12}
          icon={<Building2 className="h-5 w-5" />} accent="bg-emerald-500/10 text-emerald-600" />
        <StatCard label="Emails today" value={38}
          icon={<Mail className="h-5 w-5" />} accent="bg-sky-500/10 text-sky-600" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard
          title="Pending approvals"
          description="New school demo requests awaiting review"
          actions={<Badge tone="info">New</Badge>}
          flush
        >
          <ul className="divide-y divide-line">
            {pending.map((p) => (
              <li key={p.name} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-semibold text-ink">{p.name}</span>
                <span className="text-xs text-slatesoft">{p.when}</span>
              </li>
            ))}
            <li className="px-5 py-3.5 text-sm text-slatesoft">+ 3 more pending</li>
          </ul>
          <div className="border-t border-line p-4">
            <Link
              to="/developer/approvals"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              View all requests <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Quick actions" description="Common developer tasks">
          <div className="space-y-2">
            <Link to="/developer/approvals" className="flex items-center gap-3 rounded-xl bg-surfaceinset p-3 transition-colors hover:bg-brand/5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand"><CheckSquare className="h-4 w-4" /></div>
              <div>
                <p className="text-sm font-semibold text-ink">Review demo requests</p>
                <p className="text-xs text-slatesoft">Approve or reject pending schools</p>
              </div>
            </Link>
            <Link to="/developer/schools" className="flex items-center gap-3 rounded-xl bg-surfaceinset p-3 transition-colors hover:bg-brand/5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Building2 className="h-4 w-4" /></div>
              <div>
                <p className="text-sm font-semibold text-ink">Manage schools</p>
                <p className="text-xs text-slatesoft">View all schools in the system</p>
              </div>
            </Link>
            <Link to="/developer/email-logs" className="flex items-center gap-3 rounded-xl bg-surfaceinset p-3 transition-colors hover:bg-brand/5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600"><Mail className="h-4 w-4" /></div>
              <div>
                <p className="text-sm font-semibold text-ink">Email logs</p>
                <p className="text-xs text-slatesoft">Check email delivery status</p>
              </div>
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="System status">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: <Server className="h-4 w-4" />, label: 'API', value: 'Operational', tone: 'success' as const },
              { icon: <Database className="h-4 w-4" />, label: 'Database', value: 'Connected', tone: 'success' as const },
              { icon: <MailCheck className="h-4 w-4" />, label: 'Email service', value: 'Configured', tone: 'warning' as const },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-line bg-surfaceinset p-3">
                <div className="text-slatesoft">{s.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-ink">{s.label}</p>
                  <Badge tone={s.tone} dot>{s.value}</Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default DeveloperDashboard;

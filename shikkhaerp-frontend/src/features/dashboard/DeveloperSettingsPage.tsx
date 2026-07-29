import React from 'react';
import { PageHeader, SectionCard, Badge } from '../../shared/ui';
import { Settings, Server, Bell } from 'lucide-react';

const DeveloperSettingsPage: React.FC = () => (
  <div className="mx-auto max-w-5xl">
    <PageHeader
      title="Developer settings"
      subtitle="Configure developer-level preferences and system utilities."
      icon={<Settings className="h-5 w-5" />}
    />
    <div className="space-y-4">
      <SectionCard>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Server className="h-4 w-4" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink">Environment</h3>
              <Badge tone="success" dot>Production</Badge>
            </div>
            <p className="mt-1 text-sm text-slatesoft">Production configuration is active.</p>
          </div>
        </div>
      </SectionCard>
      <SectionCard>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"><Bell className="h-4 w-4" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink">Notifications</h3>
              <Badge tone="success" dot>Enabled</Badge>
            </div>
            <p className="mt-1 text-sm text-slatesoft">Email and system alerts are enabled.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
);

export default DeveloperSettingsPage;

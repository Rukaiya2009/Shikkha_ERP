import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned actions (buttons, badges). */
  actions?: React.ReactNode;
  /** Optional leading icon element (e.g. a lucide icon). */
  icon?: React.ReactNode;
}

/**
 * The single header used at the top of every dashboard and page, so titles,
 * spacing, and type are identical across roles.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, icon }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      {icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
          {icon}
        </div>
      )}
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slatesoft">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

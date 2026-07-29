import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** An empty screen is an invitation to act — never just a blank. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
    {icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surfaceinset text-slatesoft">
        {icon}
      </div>
    )}
    <h3 className="font-display text-base font-bold text-ink">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slatesoft">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

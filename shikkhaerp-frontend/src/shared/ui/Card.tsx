import React from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Remove inner padding when the child manages its own (e.g. tables). */
  flush?: boolean;
}

/** A white surface with an optional header row. Matches the user-management card. */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  actions,
  children,
  className = '',
  flush = false,
}) => (
  <section className={`overflow-hidden rounded-2xl border border-line bg-white shadow-card ${className}`}>
    {(title || actions) && (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          {title && <h2 className="font-display text-base font-extrabold text-ink">{title}</h2>}
          {description && <p className="mt-0.5 text-sm text-slatesoft">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className={flush ? '' : 'p-5'}>{children}</div>
  </section>
);

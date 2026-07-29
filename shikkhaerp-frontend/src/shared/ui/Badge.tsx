import React from 'react';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'neutral';

const TONES: Record<BadgeTone, { color: string; bg: string }> = {
  success: { color: '#1B8A5A', bg: '#E4F5EC' },
  danger:  { color: '#B3261E', bg: '#FBEAE9' },
  warning: { color: '#8A5A00', bg: '#FBF0DA' },
  info:    { color: '#1D4ED8', bg: '#E3EDFB' },
  purple:  { color: '#6B21A8', bg: '#F3E8FD' },
  neutral: { color: '#4A5A6B', bg: '#EEF3F8' },
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'neutral', dot = false, className = '' }) => {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}
      style={{ color: t.color, background: t.bg }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />}
      {children}
    </span>
  );
};

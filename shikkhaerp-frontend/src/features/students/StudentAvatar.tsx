import React from 'react';

/**
 * Initials avatar. No photo endpoint exists yet, so identity is carried by
 * initials on a stable tint — stable meaning the same student always gets the
 * same colour, in the list and on their record page.
 */
const TINTS = [
  'bg-brand/10 text-brand',
  'bg-teal/10 text-teal',
  'bg-ocean/15 text-ocean',
  'bg-warning/15 text-[#8A5A00]',
  'bg-alert/10 text-alert',
  'bg-success/10 text-success',
];

export const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export const tintFor = (id: string) => TINTS[Number(id.replace(/\D/g, '') || 0) % TINTS.length];

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

export const StudentAvatar: React.FC<{
  name: string;
  id: string;
  size?: keyof typeof SIZES;
  className?: string;
}> = ({ name, id, size = 'sm', className = '' }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-xl font-display font-extrabold ${SIZES[size]} ${tintFor(id)} ${className}`}
  >
    {initials(name)}
  </span>
);

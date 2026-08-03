/** Small formatters shared by every platform console screen. */

export const taka = (n: number) => `৳${n.toLocaleString('en-IN')}`;

export const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const dateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

/** "3 hours ago", "yesterday", "6 days ago" — the console reads in relative time. */
export const timeAgo = (iso: string | null) => {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
};

/** Countdown the other way — "in 4 days", "expires today", "3 days overdue". */
export const untilLabel = (iso: string | null) => {
  if (!iso) return '—';
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'expires today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

export const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const TINTS = [
  'bg-brand/10 text-brand',
  'bg-teal/10 text-teal',
  'bg-ocean/15 text-ocean',
  'bg-warning/15 text-[#8A5A00]',
  'bg-success/10 text-success',
  'bg-alert/10 text-alert',
];

export const tintFor = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
};

/** A school name → a URL-safe subdomain suggestion. */
export const toSubdomain = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('');

/** A school name → a suggested tenant code, e.g. "Hammadia Model High" → HMH. */
export const toCode = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 4);

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, FlaskConical, Radio, X } from 'lucide-react';

/* ═════════════════════════════════ tabs ═════════════════════════════════ */

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

/** Underlined tab strip used on record pages (student detail, school detail). */
export const Tabs: React.FC<{
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}> = ({ items, active, onChange, className = '' }) => (
  <div className={`flex gap-1 overflow-x-auto border-b border-line ${className}`}>
    {items.map((t) => {
      const on = t.key === active;
      return (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-bold transition ${
            on ? 'text-brand' : 'text-slatesoft hover:text-ink'
          }`}
        >
          {t.icon}
          {t.label}
          {t.count !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-extrabold ${
                on ? 'bg-brand/10 text-brand' : 'bg-surfaceinset text-slatesoft'
              }`}
            >
              {t.count}
            </span>
          )}
          {on && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />}
        </button>
      );
    })}
  </div>
);

/* ═══════════════════════════════ demo chip ═══════════════════════════════ */

/**
 * Marks a screen or panel as running on invented data. The build plan promises
 * demo data is always *labelled* demo data — this is that label, so nobody
 * mistakes a mock number for a real one in a review.
 */
export const DemoChip: React.FC<{ label?: string; className?: string }> = ({
  label = 'Demo data',
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#8A5A00] ${className}`}
    title="Placeholder data — no backend endpoint yet"
  >
    <FlaskConical className="h-3 w-3" />
    {label}
  </span>
);

/**
 * The opposite of DemoChip: this screen is reading the real backend. Worth
 * saying out loud, because in a console that is half mock and half live the
 * only thing more dangerous than an unlabelled mock is an unlabelled real one.
 */
export const LiveChip: React.FC<{ label?: string; className?: string }> = ({
  label = 'Live API',
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-success ${className}`}
    title="Reading the Spring Boot backend"
  >
    <Radio className="h-3 w-3" />
    {label}
  </span>
);

/* ═════════════════════════════════ toast ═════════════════════════════════ */

export interface ToastState {
  id: number;
  message: string;
  tone?: 'success' | 'danger';
}

/** Bottom-centre confirmation, auto-dismissing. */
export const Toast: React.FC<{ toast: ToastState | null; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const danger = toast.tone === 'danger';
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className={`pointer-events-auto flex animate-fade-up items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-modal ${
          danger ? 'bg-alert' : 'bg-ink'
        }`}
      >
        {!danger && <CheckCircle2 className="h-4 w-4 text-signal" />}
        {toast.message}
        <button type="button" onClick={onClose} className="ml-1 opacity-70 transition hover:opacity-100" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

/** `const { toast, notify, clear } = useToast()` — one line per screen. */
export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const notify = useCallback((message: string, tone: 'success' | 'danger' = 'success') => {
    setToast({ id: Date.now(), message, tone });
  }, []);
  const clear = useCallback(() => setToast(null), []);
  return { toast, notify, clear };
};

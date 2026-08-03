import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

type Tone = 'danger' | 'warning' | 'brand';

const TONE: Record<Tone, { chip: string; button: string }> = {
  danger: { chip: 'bg-alert/10 text-alert', button: 'bg-alert hover:bg-[#B3264B]' },
  warning: { chip: 'bg-warning/15 text-[#8A5A00]', button: 'bg-warning hover:bg-[#C79300] text-ink' },
  brand: { chip: 'bg-brand/10 text-brand', button: 'bg-brand hover:bg-brand-deep' },
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  busy?: boolean;
  /**
   * When set, the confirm button stays disabled until the user types this
   * string exactly — used for destructive actions the plan asks to gate
   * (deleting a student, deleting a school by its code).
   */
  requireText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  tone = 'danger', busy = false, requireText, onCancel, onConfirm,
}) => {
  const [typed, setTyped] = useState('');

  useEffect(() => { if (open) setTyped(''); }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onCancel();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const t = TONE[tone];
  const blocked = Boolean(requireText) && typed.trim() !== requireText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-modal">
        <div className="flex items-start gap-3.5 p-6">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.chip}`}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-extrabold text-ink">{title}</h3>
            <div className="mt-1.5 text-sm leading-relaxed text-slatesoft">{message}</div>

            {requireText && (
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slatesoft">
                  Type <span className="font-mono text-ink">{requireText}</span> to confirm
                </label>
                <input
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surfacefield px-3.5 py-2.5 font-mono text-sm text-ink outline-none focus:border-ocean focus:bg-white focus:shadow-glow"
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slatesoft transition hover:bg-surfaceinset hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-line bg-surfaceinset/60 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-surfaceinset disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || blocked}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-card transition disabled:cursor-not-allowed disabled:opacity-50 ${t.button}`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

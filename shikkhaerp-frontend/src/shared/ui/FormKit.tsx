/**
 * FormKit — the "sectioned form" pattern from the build plan.
 *
 * Long forms split into labelled blocks, a responsive field grid, required-field
 * asterisks, helper and error text, a drag-and-drop photo field, and one footer
 * with Cancel + Save pinned bottom-right. Student, Teacher, Guardian, School
 * profile and Add-a-school all share these, so every form in the product looks
 * and behaves the same.
 */
import React, { useRef, useState } from 'react';
import { UploadCloud, X, AlertCircle, Loader2 } from 'lucide-react';

/* ═════════════════════════════ section block ═════════════════════════════ */

export const FormSection: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => (
  <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
    <header className="flex items-start gap-3 border-b border-line bg-surfaceinset/50 px-5 py-4">
      {icon && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          {icon}
        </span>
      )}
      <div>
        <h2 className="font-display text-base font-extrabold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slatesoft">{description}</p>}
      </div>
    </header>
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  </section>
);

/* ═════════════════════════════ field wrapper ═════════════════════════════ */

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  /** Columns to span inside the 4-column section grid. */
  span?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

const SPAN: Record<number, string> = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 xl:col-span-3',
  4: 'sm:col-span-2 xl:col-span-4',
};

export const Field: React.FC<FieldProps> = ({ label, required, hint, error, span = 1, children }) => (
  <div className={SPAN[span]}>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slatesoft">
      {label}
      {required && <span className="ml-0.5 text-alert">*</span>}
    </label>
    {children}
    {error ? (
      <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-alert">
        <AlertCircle className="h-3.5 w-3.5" /> {error}
      </p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-slatesoft">{hint}</p>
    ) : null}
  </div>
);

/* ═══════════════════════════════ controls ═══════════════════════════════ */

const base =
  'w-full rounded-xl border bg-surfacefield px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slatesoft/70 focus:bg-white focus:shadow-glow disabled:cursor-not-allowed disabled:bg-surfaceinset disabled:text-slatesoft';

const tone = (error?: boolean) =>
  error ? 'border-alert focus:border-alert' : 'border-line focus:border-ocean';

export const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
> = ({ error, className = '', ...rest }) => (
  <input {...rest} className={`${base} ${tone(error)} ${className}`} />
);

export const TextArea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
> = ({ error, className = '', rows = 3, ...rest }) => (
  <textarea {...rest} rows={rows} className={`${base} ${tone(error)} resize-y ${className}`} />
);

export const SelectInput: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean; options: (string | { value: string; label: string })[] }
> = ({ error, options, className = '', ...rest }) => (
  <select {...rest} className={`${base} ${tone(error)} ${className}`}>
    {options.map((o) => {
      const value = typeof o === 'string' ? o : o.value;
      const label = typeof o === 'string' ? o : o.label;
      return <option key={value} value={value}>{label}</option>;
    })}
  </select>
);

/** Segmented control — nicer than a two-option select for gender, shift etc. */
export const SegmentedInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ value, onChange, options }) => (
  <div className="inline-flex w-full rounded-xl border border-line bg-surfaceinset p-1">
    {options.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => onChange(o)}
        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
          value === o ? 'bg-white text-brand shadow-card' : 'text-slatesoft hover:text-ink'
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

/* ═════════════════════════════ photo field ═════════════════════════════ */

export const PhotoField: React.FC<{
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
}> = ({ value, onChange, label = 'Student photo' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const read = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slatesoft">{label}</label>

      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-28 w-28 rounded-2xl border border-line object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-alert p-1 text-white shadow-card"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); read(e.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`flex h-28 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 text-center transition ${
            over ? 'border-ocean bg-softblue/30' : 'border-linestrong bg-surfacefield hover:border-ocean'
          }`}
        >
          <UploadCloud className="h-5 w-5 text-slatesoft" />
          <p className="text-xs font-bold text-ink">Drop a photo, or click to browse</p>
          <p className="text-[11px] text-slatesoft">JPG or PNG · max 2 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => read(e.target.files?.[0])}
      />
    </div>
  );
};

/* ═════════════════════════════ form footer ═════════════════════════════ */

export const FormFooter: React.FC<{
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  /** Left-aligned note, e.g. an unsaved-changes warning. */
  note?: React.ReactNode;
}> = ({ onCancel, onSave, saving = false, saveLabel = 'Save changes', note }) => (
  <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line bg-white/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
    {note && <div className="mr-auto text-xs font-medium text-slatesoft">{note}</div>}
    <button
      type="button"
      onClick={onCancel}
      className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:border-linestrong hover:bg-surfaceinset"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-deep disabled:opacity-60"
    >
      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
      {saving ? 'Saving…' : saveLabel}
    </button>
  </div>
);

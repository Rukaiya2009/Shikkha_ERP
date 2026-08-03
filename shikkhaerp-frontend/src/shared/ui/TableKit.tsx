/**
 * TableKit — the "standard table" from the build plan, in one file.
 *
 * Search, filters, export, rows-per-page, select-all, sortable headers, a
 * three-dot row menu, a sticky bulk bar and first/prev/next/last paging.
 * Every Phase 2+ table screen (Students, Teachers, Guardians, All schools,
 * Invoices…) is meant to import from here rather than re-implement it, so the
 * tables stay identical as the module count grows.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Search, X, Download, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal,
} from 'lucide-react';

/* ══════════════════════════════ toolbar ══════════════════════════════ */

interface TableToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  /** Filter controls — selects, chips, whatever the screen needs. */
  children?: React.ReactNode;
  pageSize: number;
  onPageSize: (n: number) => void;
  onExport?: () => void;
  /** Shown to the right of the export button, e.g. "Add student". */
  actions?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  search, onSearch, placeholder = 'Search…', children,
  pageSize, onPageSize, onExport, actions,
}) => (
  <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surfaceinset/60 px-4 py-3">
    <div className="relative min-w-[220px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slatesoft" />
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-9 text-sm text-ink outline-none transition focus:border-ocean focus:shadow-glow"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearch('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slatesoft hover:bg-line hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>

    {children}

    <div className="ml-auto flex items-center gap-2">
      <label className="hidden items-center gap-2 text-xs font-semibold text-slatesoft sm:flex">
        Rows
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-bold text-ink outline-none focus:border-ocean"
        >
          {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-ocean hover:text-brand"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      )}

      {actions}
    </div>
  </div>
);

/** A labelled <select> that matches the toolbar height. */
export const FilterSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}> = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-ocean focus:shadow-glow ${className}`}
  >
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* ═══════════════════════════ sortable header ═══════════════════════════ */

export type SortDir = 'asc' | 'desc';

export const SortHeader: React.FC<{
  label: string;
  field: string;
  active: string;
  dir: SortDir;
  onSort: (field: string) => void;
  className?: string;
}> = ({ label, field, active, dir, onSort, className = '' }) => {
  const on = active === field;
  return (
    <th className={`px-4 py-3 text-left ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider transition ${
          on ? 'text-brand' : 'text-slatesoft hover:text-ink'
        }`}
      >
        {label}
        {!on && <ChevronsUpDown className="h-3 w-3 opacity-50" />}
        {on && dir === 'asc' && <ChevronUp className="h-3 w-3" />}
        {on && dir === 'desc' && <ChevronDown className="h-3 w-3" />}
      </button>
    </th>
  );
};

/** Plain, non-sortable header cell with the same type treatment. */
export const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-slatesoft ${className}`}>
    {children}
  </th>
);

/* ═════════════════════════════ row menu ═════════════════════════════ */

export interface RowMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  /** Draws a hairline above this item. */
  divider?: boolean;
}

export const RowMenu: React.FC<{ items: RowMenuItem[] }> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`rounded-lg p-1.5 transition ${open ? 'bg-line text-ink' : 'text-slatesoft hover:bg-surfaceinset hover:text-ink'}`}
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-modal">
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setOpen(false); it.onClick(); }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium transition ${
                it.divider ? 'mt-1 border-t border-line pt-2.5' : ''
              } ${it.danger ? 'text-alert hover:bg-alert/10' : 'text-ink hover:bg-surfaceinset'}`}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════ bulk action bar ════════════════════════════ */

export const BulkBar: React.FC<{
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}> = ({ count, onClear, children }) => {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-ocean/30 bg-softblue/40 px-4 py-2.5">
      <span className="text-sm font-bold text-brand">
        {count} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-slatesoft hover:text-ink"
      >
        <X className="h-3.5 w-3.5" /> Clear
      </button>
    </div>
  );
};

/** The checkbox used in the select-all header and every row. */
export const RowCheckbox: React.FC<{
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label?: string;
}> = ({ checked, indeterminate = false, onChange, label = 'Select row' }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="h-4 w-4 cursor-pointer rounded border-linestrong text-brand accent-[#034078]"
    />
  );
};

/* ════════════════════════════ pagination ════════════════════════════ */

export const Pagination: React.FC<{
  page: number;          // zero-based
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}> = ({ page, pageSize, total, onPage }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  // Windowed page numbers so 40 pages don't print 40 buttons.
  const window: number[] = [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  for (let i = start; i < Math.min(totalPages, start + 5); i++) window.push(i);

  const btn = 'flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-slatesoft transition hover:border-ocean hover:text-brand disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <p className="text-xs font-medium text-slatesoft">
        Showing <b className="text-ink">{from}</b> to <b className="text-ink">{to}</b> of{' '}
        <b className="text-ink">{total}</b>
      </p>

      <div className="flex items-center gap-1.5">
        <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(0)} aria-label="First page">
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>

        {window.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2.5 text-xs font-bold transition ${
              p === page
                ? 'bg-brand text-white shadow-card'
                : 'border border-line bg-white text-slatesoft hover:border-ocean hover:text-brand'
            }`}
          >
            {p + 1}
          </button>
        ))}

        <button type="button" className={btn} disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button type="button" className={btn} disabled={page >= totalPages - 1} onClick={() => onPage(totalPages - 1)} aria-label="Last page">
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════ CSV export ═══════════════════════════ */

const escapeCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Turn rows into a CSV file and hand it to the browser. Exports whatever it is
 * given, which means the caller passes the *filtered* rows — the plan's
 * "respecting the active filters".
 */
export const downloadCsv = (
  filename: string,
  columns: { key: string; label: string }[],
  rows: Record<string, unknown>[],
) => {
  const head = columns.map((c) => escapeCell(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => escapeCell(r[c.key])).join(',')).join('\n');
  // BOM so Excel opens Bangla and ৳ correctly.
  const blob = new Blob([`\uFEFF${head}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

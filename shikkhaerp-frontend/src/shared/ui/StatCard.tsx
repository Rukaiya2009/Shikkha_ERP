import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  /** Tailwind classes for the icon chip background, e.g. "bg-brand/10 text-brand". */
  accent?: string;
  hint?: string;
  trend?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent = 'bg-brand/10 text-brand',
  hint,
  trend,
}) => (
  <div className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slatesoft">{label}</p>
        <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">{value}</p>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {Math.abs(trend)}% from last month
            </span>
          </div>
        )}
        {hint && trend === undefined && <p className="mt-2 text-xs text-slatesoft">{hint}</p>}
      </div>
      {icon && (
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${accent}`}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

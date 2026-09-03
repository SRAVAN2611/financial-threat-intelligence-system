import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  filters: FilterField[];
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onReset,
  className = '',
}) => {
  const hasActiveFilters = filters.some((f) => f.value && f.value !== 'ALL');

  return (
    <div className={`flex items-center gap-2.5 flex-wrap ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span className="font-semibold uppercase tracking-wider text-[11px]">Filters:</span>
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 cursor-pointer appearance-none"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                {filter.label}: {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      ))}

      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

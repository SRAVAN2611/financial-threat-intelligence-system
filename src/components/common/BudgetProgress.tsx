import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface BudgetProgressProps {
  allocated: number;
  spent: number;
  committed?: number;
  projectedOverspend?: number;
  showLabels?: boolean;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  allocated,
  spent,
  committed = 0,
  projectedOverspend = 0,
  showLabels = true,
}) => {
  const totalUsed = spent + committed;
  const spentPercent = Math.min(100, (spent / allocated) * 100);
  const committedPercent = Math.min(100 - spentPercent, (committed / allocated) * 100);
  const remainingPercent = Math.max(0, 100 - spentPercent - committedPercent);
  const burnRate = (spent / allocated) * 100;

  let burnBadgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (burnRate > 90 || projectedOverspend > 0) {
    burnBadgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (burnRate > 75) {
    burnBadgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="w-full space-y-2">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Spent:</span>
            <span className="font-mono font-medium text-slate-100">{formatCurrency(spent)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Cap:</span>
            <span className="font-mono text-slate-300">{formatCurrency(allocated)}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${burnBadgeClass}`}>
            {formatPercent(burnRate)} Burn
          </span>
        </div>
      )}

      {/* Multi-segment Progress Bar */}
      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        {/* Spent bar */}
        <div
          style={{ width: `${spentPercent}%` }}
          className={`h-full transition-all duration-500 ${
            burnRate > 90 ? 'bg-rose-500' : burnRate > 75 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          title={`Spent: ${formatCurrency(spent)} (${spentPercent.toFixed(1)}%)`}
        />

        {/* Committed / In-flight bar */}
        {committedPercent > 0 && (
          <div
            style={{ width: `${committedPercent}%` }}
            className="h-full bg-sky-500/70 stripe-bg transition-all duration-500"
            title={`Committed In-Flight: ${formatCurrency(committed)} (${committedPercent.toFixed(1)}%)`}
          />
        )}
      </div>

      {projectedOverspend > 0 && (
        <div className="flex items-center justify-between text-[11px] text-rose-400 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Projected Cap Overdraft:
          </span>
          <span className="font-mono font-bold">+{formatCurrency(projectedOverspend)}</span>
        </div>
      )}
    </div>
  );
};

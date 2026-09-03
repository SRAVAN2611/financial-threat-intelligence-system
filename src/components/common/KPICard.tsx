import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { RiskLevel } from '../../types';

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  riskBadge?: RiskLevel;
  className?: string;
  accentColor?: 'emerald' | 'amber' | 'orange' | 'rose' | 'sky' | 'indigo';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  riskBadge,
  className = '',
  accentColor = 'sky',
}) => {
  const accentBorderClasses = {
    emerald: 'hover:border-emerald-500/40',
    amber: 'hover:border-amber-500/40',
    orange: 'hover:border-orange-500/40',
    rose: 'hover:border-rose-500/40',
    sky: 'hover:border-sky-500/40',
    indigo: 'hover:border-indigo-500/40',
  };

  const accentIconClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  const isUp = trend ? trend.value > 0 : false;
  const isDown = trend ? trend.value < 0 : false;
  const isPositiveGood = trend?.isPositiveGood ?? true;
  const trendGood = isUp ? isPositiveGood : !isPositiveGood;

  return (
    <div
      className={`enterprise-card p-5 transition-all duration-200 ${accentBorderClasses[accentColor]} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
            {value}
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${accentIconClasses[accentColor]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono ${
                trendGood
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-rose-400 bg-rose-500/10'
              }`}
            >
              {isUp && <TrendingUp className="w-3 h-3" />}
              {isDown && <TrendingDown className="w-3 h-3" />}
              {!isUp && !isDown && <Minus className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-slate-400 text-[11px] truncate">{trend.label || 'vs last period'}</span>
          </div>
        ) : subtext ? (
          <span className="text-slate-400 text-[11px] truncate">{subtext}</span>
        ) : (
          <div />
        )}

        {riskBadge && <RiskBadge level={riskBadge} size="sm" />}
      </div>
    </div>
  );
};

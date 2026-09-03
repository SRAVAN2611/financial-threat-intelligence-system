import React from 'react';
import { ShieldAlert, ArrowRight, ShieldCheck, Eye, Ban } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { SeverityBadge } from './SeverityBadge';
import { formatCurrency, formatTimeAgo, getThreatCategoryLabel } from '../../utils/formatters';
import { LiveThreatEvent, RiskLevel } from '../../types';

interface AlertCardProps {
  alert: LiveThreatEvent;
  onInvestigate?: (alert: LiveThreatEvent) => void;
  onQuarantine?: (alert: LiveThreatEvent) => void;
  onWhitelist?: (alert: LiveThreatEvent) => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onInvestigate,
  onQuarantine,
  onWhitelist,
  className = '',
}) => {
  const isCritical = alert.severity === 'CRITICAL';
  const isHigh = alert.severity === 'HIGH';

  const borderClass = isCritical
    ? 'border-l-4 border-l-rose-500 border-slate-800'
    : isHigh
    ? 'border-l-4 border-l-orange-500 border-slate-800'
    : 'border-l-4 border-l-amber-500 border-slate-800';

  return (
    <div
      className={`enterprise-card p-4 transition-all hover:bg-slate-900/60 ${borderClass} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={alert.severity} size="sm" />
          <span className="text-xs font-mono text-slate-400">
            {getThreatCategoryLabel(alert.category)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-mono text-slate-400">{alert.referenceNo}</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {formatTimeAgo(alert.timestamp)}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-slate-100 mb-1">{alert.title}</h4>
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        {alert.aiExplanation}
      </p>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-slate-500 text-[11px]">Exposure: </span>
            <span className="font-mono font-bold text-slate-100">
              {formatCurrency(alert.amount)}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 truncate max-w-[140px]">
            {alert.department}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onWhitelist && (
            <button
              onClick={() => onWhitelist(alert)}
              className="p-1.5 rounded hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors"
              title="Whitelist & Approve"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
          {onQuarantine && alert.status !== 'QUARANTINED' && (
            <button
              onClick={() => onQuarantine(alert)}
              className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
              title="Immediate Quarantine"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
          {onInvestigate && (
            <button
              onClick={() => onInvestigate(alert)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Investigate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

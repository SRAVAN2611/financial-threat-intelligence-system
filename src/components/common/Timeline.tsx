import React from 'react';
import { AuditRecord } from '../../types';
import { formatDateTime, truncateHash } from '../../utils/formatters';
import { ShieldCheck, UserCheck, AlertTriangle, Key } from 'lucide-react';

interface TimelineProps {
  events: AuditRecord[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  if (!events || events.length === 0) {
    return <div className="text-xs text-slate-500 italic py-2">No audit timeline recorded.</div>;
  }

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 ${className}`}>
      {events.map((evt, idx) => {
        const isSentinel = evt.actor.includes('SENTINEL') || evt.actor.includes('Engine');
        const isWarning = evt.action.includes('QUARANTINE') || evt.action.includes('ANOMALY');

        return (
          <div key={evt.id || idx} className="relative group">
            {/* Dot Node */}
            <div
              className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center border ${
                isWarning
                  ? 'bg-rose-950 border-rose-500 text-rose-400'
                  : isSentinel
                  ? 'bg-sky-950 border-sky-500 text-sky-400'
                  : 'bg-slate-900 border-slate-600 text-slate-300'
              }`}
            >
              {isWarning ? (
                <AlertTriangle className="w-2.5 h-2.5" />
              ) : isSentinel ? (
                <ShieldCheck className="w-2.5 h-2.5" />
              ) : (
                <UserCheck className="w-2.5 h-2.5" />
              )}
            </div>

            {/* Content */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span className="font-mono font-semibold text-slate-200">
                  {evt.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatDateTime(evt.timestamp)}
                </span>
              </div>

              <p className="text-slate-400 mb-2">{evt.details}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5 font-mono">
                <span>By: <strong className="text-slate-300">{evt.actor}</strong></span>
                {evt.hash && (
                  <span className="flex items-center gap-1 text-sky-400/80" title={evt.hash}>
                    <Key className="w-2.5 h-2.5" />
                    {truncateHash(evt.hash, 5, 5)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

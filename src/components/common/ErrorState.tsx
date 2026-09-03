import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetric Stream Error',
  message = 'Failed to load live data feed. Verify network connectivity or authorization tokens.',
  onRetry,
}) => {
  return (
    <div className="enterprise-card p-6 text-center border-rose-500/30 bg-rose-950/10">
      <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};

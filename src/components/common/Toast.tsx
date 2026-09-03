import React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ToastItem } from '../../context/NotificationContext';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-emerald-950/30',
    warning: 'border-amber-500/40 bg-amber-950/30',
    error: 'border-rose-500/40 bg-rose-950/30',
    info: 'border-sky-500/40 bg-sky-950/30',
  };

  return (
    <div
      className={`enterprise-card p-3.5 shadow-2xl border flex items-start gap-3 min-w-[320px] max-w-md animate-in slide-in-from-top-3 fade-in duration-150 ${
        borderColors[toast.type]
      }`}
    >
      <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-semibold text-slate-100">{toast.title}</h5>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

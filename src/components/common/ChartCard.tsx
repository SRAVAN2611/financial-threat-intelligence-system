import React from 'react';
import { Download, RefreshCw, Maximize2 } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
  height?: string | number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  headerAction,
  onRefresh,
  onExport,
  className = '',
  height = 320,
}) => {
  return (
    <div className={`enterprise-card flex flex-col ${className}`}>
      <div className="enterprise-card-header flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Export Chart Data"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="p-5 flex-1" style={{ minHeight: height }}>
        {children}
      </div>
    </div>
  );
};

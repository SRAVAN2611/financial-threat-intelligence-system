import React from 'react';
import { RiskLevel } from '../../types';
import { getRiskColor } from '../../utils/formatters';

interface SeverityBadgeProps {
  severity: RiskLevel | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'sm',
}) => {
  const norm = (severity?.toUpperCase() || 'LOW') as RiskLevel;
  const colors = getRiskColor(norm);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wider uppercase',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-mono ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
      {norm}
    </span>
  );
};

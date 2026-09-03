import React from 'react';
import { RiskLevel } from '../../types';
import { getRiskColor } from '../../utils/formatters';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showDot = true,
}) => {
  const normLevel = (level?.toUpperCase() || 'LOW') as RiskLevel;
  const colors = getRiskColor(normLevel);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
      )}
      <span>{normLevel}</span>
      {score !== undefined && (
        <span className="font-mono opacity-80 pl-0.5">({score})</span>
      )}
    </span>
  );
};

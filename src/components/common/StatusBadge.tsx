import React from 'react';
import { TransactionStatus } from '../../types';
import { getStatusColor } from '../../utils/formatters';

interface StatusBadgeProps {
  status: TransactionStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const norm = (status || 'APPROVED') as TransactionStatus;
  const colors = getStatusColor(norm);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const label = norm.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      <span>{label}</span>
    </span>
  );
};

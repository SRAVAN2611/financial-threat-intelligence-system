import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-8 bg-slate-800/60 rounded flex-1" />
          <div className="h-8 bg-slate-800/60 rounded w-24" />
          <div className="h-8 bg-slate-800/60 rounded w-32" />
        </div>
      ))}
    </div>
  );
};

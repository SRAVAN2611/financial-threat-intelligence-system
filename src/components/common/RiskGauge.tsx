import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 - 100
  size?: number;
  label?: string;
  sublabel?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 180,
  label = 'Sentinel Threat Score',
  sublabel = 'AI Probability Index',
}) => {
  // Clamp score
  const safeScore = Math.max(0, Math.min(100, score));

  // Determine color based on threshold
  let color = '#10b981'; // green
  let statusText = 'Low Risk';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (safeScore >= 85) {
    color = '#ef4444'; // critical red
    statusText = 'Critical Alert';
    badgeBg = 'bg-rose-500/15 text-rose-400 border-rose-500/40';
  } else if (safeScore >= 65) {
    color = '#f97316'; // orange high
    statusText = 'High Threat';
    badgeBg = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
  } else if (safeScore >= 35) {
    color = '#f59e0b'; // amber warning
    statusText = 'Medium Alert';
    badgeBg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  // SVG calculations for semi-circle arc
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = Math.PI * radius; // Half-circle circumference
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size / 1.7 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-180"
          style={{ overflow: 'visible' }}
        >
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Active Colored Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 top-3 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold font-mono text-slate-100 tracking-tight">
            {safeScore}
            <span className="text-sm font-normal text-slate-400">/100</span>
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border mt-1 ${badgeBg}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="mt-1">
        <p className="text-xs font-semibold text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500">{sublabel}</p>
      </div>
    </div>
  );
};

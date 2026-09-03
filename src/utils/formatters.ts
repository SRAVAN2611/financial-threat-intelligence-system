import { RiskLevel, TransactionStatus, ThreatCategory } from '../types';

/**
 * Format Indian Rupee currency (₹) for FY 2026–27
 * Handles standard Indian Numbering Format (Lakhs & Crores)
 */
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';

  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number, currency: string = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatLakhsCrores(amount: number): string {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  }
  return formatCurrency(amount);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
  } catch {
    return dateString;
  }
}

export function getRiskColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  dot: string;
  hex: string;
} {
  switch (level) {
    case 'LOW':
      return {
        bg: 'bg-emerald-950/40',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badgeBg: 'bg-emerald-500/10',
        dot: 'bg-emerald-400',
        hex: '#10b981',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badgeBg: 'bg-amber-500/10',
        dot: 'bg-amber-400',
        hex: '#f59e0b',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-950/40',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        badgeBg: 'bg-orange-500/10',
        dot: 'bg-orange-400',
        hex: '#f97316',
      };
    case 'CRITICAL':
      return {
        bg: 'bg-rose-950/50',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        badgeBg: 'bg-rose-500/15',
        dot: 'bg-rose-400',
        hex: '#ef4444',
      };
    default:
      return {
        bg: 'bg-slate-900',
        text: 'text-slate-400',
        border: 'border-slate-700',
        badgeBg: 'bg-slate-800',
        dot: 'bg-slate-400',
        hex: '#64748b',
      };
  }
}

export function getStatusColor(status: TransactionStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'APPROVED':
    case 'WHITELISTED':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'UNDER_REVIEW':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'FLAGGED':
      return {
        bg: 'bg-orange-500/15',
        text: 'text-orange-400',
        border: 'border-orange-500/40',
        dot: 'bg-orange-400',
      };
    case 'QUARANTINED':
    case 'REJECTED':
      return {
        bg: 'bg-rose-500/15',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        dot: 'bg-rose-400',
      };
    default:
      return {
        bg: 'bg-slate-800',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

/**
 * Objective, forensic terminology for anomaly categories.
 * Never automatically label anomalies as fraud.
 */
export function getThreatCategoryLabel(cat: ThreatCategory | string): string {
  switch (cat) {
    case 'PHANTOM_VENDOR':
      return 'Unverified / Shell Entity Watch';
    case 'DUPLICATE_INVOICE':
      return 'Duplicate Invoice Collision';
    case 'VELOCITY_SPIKE':
      return 'Velocity / Frequency Surge';
    case 'ROGUE_PROCUREMENT':
      return 'Off-Policy Procurement Variance';
    case 'OFF_HOURS_TRANSFER':
      return 'Off-Hours Treasury Wire Transfer';
    case 'BENFORD_ANOMALY':
      return "Benford's Law Statistical Divergence";
    case 'UNAUTHORIZED_OVERDRAFT':
      return 'Departmental Cap Overdraft Risk';
    case 'SPLIT_TRANSACTION_SMURFING':
      return 'Sub-Threshold Split Invoice Sequence';
    case 'SANCTIONS_MATCH':
      return 'Regulatory Watchlist Entity Match';
    case 'ACCOUNT_ALTERATION':
      return 'Beneficiary Routing Alteration';
    default:
      return String(cat).replace(/_/g, ' ');
  }
}

export function truncateHash(hash: string, front: number = 6, back: number = 6): string {
  if (!hash || hash.length <= front + back) return hash || '';
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

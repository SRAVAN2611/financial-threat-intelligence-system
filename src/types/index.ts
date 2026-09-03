export type UserRole = 'ADMIN' | 'FINANCE_OFFICER' | 'DEPARTMENT_HEAD';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department?: string;
  avatar: string;
  permissions: {
    canManageRules: boolean;
    canQuarantineTransactions: boolean;
    canApproveBudgets: boolean;
    canExportForensics: boolean;
    canManageUsers: boolean;
    canRunSimulations: boolean;
    canGenerateSAR: boolean;
  };
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TransactionStatus =
  | 'APPROVED'
  | 'FLAGGED'
  | 'QUARANTINED'
  | 'UNDER_REVIEW'
  | 'WHITELISTED'
  | 'REJECTED';

export type ThreatCategory =
  | 'PHANTOM_VENDOR'
  | 'DUPLICATE_INVOICE'
  | 'VELOCITY_SPIKE'
  | 'ROGUE_PROCUREMENT'
  | 'OFF_HOURS_TRANSFER'
  | 'BENFORD_ANOMALY'
  | 'UNAUTHORIZED_OVERDRAFT'
  | 'SPLIT_TRANSACTION_SMURFING'
  | 'SANCTIONS_MATCH'
  | 'ACCOUNT_ALTERATION';

export interface ShapFactor {
  feature: string;
  weight: number; // positive = pushes toward anomaly, negative = pushes toward normal
  description: string;
  value: string | number;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  hash: string;
}

export interface Transaction {
  id: string;
  _id?: string;
  referenceNo: string;
  timestamp: string;
  fiscalYear: string; // 'FY 2026–27'
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  department: string;
  departmentCode: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  amount: number; // in INR (₹)
  currency: string; // 'INR'
  category: string;
  status: TransactionStatus;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  threatCategory?: ThreatCategory;
  threatFlags: string[];
  approver: string;
  paymentMethod: string;
  destinationAccount: string;
  originatingAccount: string;
  sha256Hash: string;
  aiForensicSummary: string;
  confidenceScore: number; // 0 - 100
  shapFactors: ShapFactor[];
  auditTrail: AuditRecord[];
  forensicNotes?: string[];
  isFlaggedBySentinel: boolean;
}

export interface DepartmentBudget {
  id: string;
  _id?: string;
  name: string;
  code: string;
  head: string;
  headEmail: string;
  fiscalYear: string; // 'FY 2026–27'
  allocated: number; // in INR (₹)
  spent: number;
  committed: number;
  projectedOverspend: number;
  burnRatePercent: number; // e.g. 78.8%
  riskLevel: RiskLevel;
  activeAnomaliesCount: number;
  monthlyHistory: {
    month: string;
    allocated: number;
    actual: number;
    forecast: number;
    anomalies: number;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface VendorIntelligence {
  id: string;
  _id?: string;
  name: string;
  taxId: string; // GSTIN / PAN / Corporate ID
  category: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: 'VERIFIED' | 'FLAGGED' | 'SUSPENDED' | 'WATCHLIST';
  totalVolumeYTD: number; // in INR (₹)
  invoiceCount: number;
  flaggedInvoicesCount: number;
  bankAccount: string;
  bankName: string;
  jurisdiction: string;
  ghostCompanyProbability: number; // percentage (Unverified Shell Likelihood)
  sanctionsCheckStatus: 'CLEARED' | 'POTENTIAL_MATCH' | 'SANCTIONED';
  pepMatch: boolean;
  lastAuditDate: string;
  incorporationDate: string;
  recentAlterations: {
    date: string;
    field: string;
    oldValue: string;
    newValue: string;
    flagged: boolean;
  }[];
}

export interface AnomalyRule {
  id: string;
  _id?: string;
  name: string;
  code: string;
  category: ThreatCategory;
  severity: RiskLevel;
  threshold: string;
  metric: string;
  action: 'AUTO_QUARANTINE' | 'ALERT_FINANCE' | 'REQUIRE_DUAL_AUTH' | 'LOG_ONLY';
  enabled: boolean;
  triggerCount24h: number;
  lastTriggered: string;
  description: string;
  accuracyScore: number;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  _id?: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: 'TRANSACTION' | 'RULE' | 'BUDGET' | 'VENDOR' | 'USER' | 'SYSTEM';
  targetId: string;
  details: string;
  ipAddress: string;
  immutableHash: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface GlobalThreatMetrics {
  threatLevel: RiskLevel;
  overallThreatScore: number; // 0 - 100
  anomaliesDetected24h: number;
  totalAtRiskAmount: number; // in INR (₹)
  quarantinedAmount: number; // in INR (₹)
  modelAccuracyPercent: number;
  avgResponseTimeSec: number;
  activeThreatVectorsCount: number;
  mitigationRatePercent: number;
  budgetRunRateVariance: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  inflationRateShock: number; // e.g. +4.5%
  supplyChainDisruption: number; // +15%
  headcountGrowth: number; // +12%
  fxVolatilityShock: number; // +8%
  contingencyBufferPercent: number; // 10%
  projectedDeficit: number;
  projectedTotalSpend: number;
  confidenceScore: number;
}

export interface ComplianceStandard {
  id: string;
  name: string;
  code: string;
  standardType: 'COMPANIES_ACT_IFC' | 'RBI_TREASURY' | 'SOX_404' | 'ISO_27001' | 'SAR';
  complianceScore: number;
  status: 'COMPLIANT' | 'NEEDS_ATTENTION' | 'NON_COMPLIANT';
  totalControls: number;
  passedControls: number;
  failingControls: number;
  lastAuditDate: string;
  leadAuditor: string;
  findings: {
    id: string;
    controlId: string;
    title: string;
    severity: RiskLevel;
    description: string;
    remediation: string;
  }[];
}

export interface LiveThreatEvent {
  id: string;
  timestamp: string;
  title: string;
  category: ThreatCategory;
  severity: RiskLevel;
  amount: number; // in INR (₹)
  department: string;
  referenceNo: string;
  status: TransactionStatus;
  aiExplanation: string;
}

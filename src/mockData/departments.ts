import { DepartmentBudget } from '../types';

/**
 * FY 2026–27 Departmental Budget Allocations in INR (₹)
 * Total Corporate Budget Cap: ₹43.00 Crores (₹43,00,00,000)
 */
export const INITIAL_DEPARTMENTS: DepartmentBudget[] = [
  {
    id: 'dept_eng',
    name: 'Engineering & Infrastructure',
    code: 'ENG-01',
    head: 'Priya Sharma',
    headEmail: 'priya.sharma@sentinel-fin.internal',
    fiscalYear: 'FY 2026–27',
    allocated: 145000000, // ₹14.50 Cr
    spent: 114200000,     // ₹11.42 Cr
    committed: 21500000,  // ₹2.15 Cr
    projectedOverspend: 6800000, // ₹68 Lakhs
    burnRatePercent: 78.8,
    riskLevel: 'HIGH',
    activeAnomaliesCount: 4,
    monthlyHistory: [
      { month: 'Apr 26', allocated: 12000000, actual: 11800000, forecast: 12000000, anomalies: 1 },
      { month: 'May 26', allocated: 12000000, actual: 12900000, forecast: 12200000, anomalies: 2 },
      { month: 'Jun 26', allocated: 12500000, actual: 14100000, forecast: 13000000, anomalies: 3 },
      { month: 'Jul 26', allocated: 12000000, actual: 13500000, forecast: 12500000, anomalies: 2 },
      { month: 'Aug 26', allocated: 12000000, actual: 14800000, forecast: 12700000, anomalies: 4 },
      { month: 'Sep 26 (Est)', allocated: 12000000, actual: 15100000, forecast: 13500000, anomalies: 2 },
    ],
    categoryBreakdown: [
      { category: 'Cloud & GPU Compute (AWS / GCP / India DC)', amount: 62000000, percentage: 54.3 },
      { category: 'SaaS Tooling & Enterprise Software', amount: 21000000, percentage: 18.4 },
      { category: 'Specialized Hardware & Server Racks', amount: 18000000, percentage: 15.8 },
      { category: 'Contract Technical Advisory', amount: 13200000, percentage: 11.5 },
    ],
  },
  {
    id: 'dept_mkt',
    name: 'Global Marketing & Brand Growth',
    code: 'MKT-02',
    head: 'Julian Vance',
    headEmail: 'julian.vance@sentinel-fin.internal',
    fiscalYear: 'FY 2026–27',
    allocated: 82000000, // ₹8.20 Cr
    spent: 59000000,    // ₹5.90 Cr
    committed: 12000000, // ₹1.20 Cr
    projectedOverspend: 0,
    burnRatePercent: 71.9,
    riskLevel: 'MEDIUM',
    activeAnomaliesCount: 2,
    monthlyHistory: [
      { month: 'Apr 26', allocated: 6800000, actual: 6400000, forecast: 6700000, anomalies: 0 },
      { month: 'May 26', allocated: 6800000, actual: 7100000, forecast: 6900000, anomalies: 1 },
      { month: 'Jun 26', allocated: 7500000, actual: 7900000, forecast: 7400000, anomalies: 1 },
      { month: 'Jul 26', allocated: 6800000, actual: 6950000, forecast: 6800000, anomalies: 0 },
      { month: 'Aug 26', allocated: 6800000, actual: 7200000, forecast: 6900000, anomalies: 2 },
      { month: 'Sep 26 (Est)', allocated: 6800000, actual: 6850000, forecast: 6800000, anomalies: 0 },
    ],
    categoryBreakdown: [
      { category: 'Performance Media & Digital Ads', amount: 34000000, percentage: 57.6 },
      { category: 'Agency Retainers & Creative SOWs', amount: 14000000, percentage: 23.7 },
      { category: 'Industry Summits & Sponsorships', amount: 8000000, percentage: 13.6 },
      { category: 'Localized Content Production', amount: 3000000, percentage: 5.1 },
    ],
  },
  {
    id: 'dept_ops',
    name: 'Corporate Operations & Logistics',
    code: 'OPS-03',
    head: 'Vikram Seth',
    headEmail: 'vikram.seth@sentinel-fin.internal',
    fiscalYear: 'FY 2026–27',
    allocated: 65000000, // ₹6.50 Cr
    spent: 41000000,    // ₹4.10 Cr
    committed: 9500000,  // ₹95 Lakhs
    projectedOverspend: 0,
    burnRatePercent: 63.1,
    riskLevel: 'LOW',
    activeAnomaliesCount: 0,
    monthlyHistory: [
      { month: 'Apr 26', allocated: 5400000, actual: 5100000, forecast: 5300000, anomalies: 0 },
      { month: 'May 26', allocated: 5400000, actual: 5250000, forecast: 5350000, anomalies: 0 },
      { month: 'Jun 26', allocated: 5500000, actual: 5600000, forecast: 5450000, anomalies: 0 },
      { month: 'Jul 26', allocated: 5400000, actual: 5200000, forecast: 5300000, anomalies: 0 },
      { month: 'Aug 26', allocated: 5400000, actual: 5350000, forecast: 5350000, anomalies: 0 },
      { month: 'Sep 26 (Est)', allocated: 5400000, actual: 5300000, forecast: 5300000, anomalies: 0 },
    ],
    categoryBreakdown: [
      { category: 'Commercial Real Estate & Facilities', amount: 22000000, percentage: 53.7 },
      { category: 'Supply Chain Logistics & Freight', amount: 11000000, percentage: 26.8 },
      { category: 'Executive Mobility & Travel', amount: 5500000, percentage: 13.4 },
      { category: 'Hardware Asset Lifecycle Maintenance', amount: 2500000, percentage: 6.1 },
    ],
  },
  {
    id: 'dept_fin',
    name: 'Finance & Treasury Management',
    code: 'FIN-04',
    head: 'Rajesh Malhotra',
    headEmail: 'rajesh.malhotra@sentinel-fin.internal',
    fiscalYear: 'FY 2026–27',
    allocated: 48000000, // ₹4.80 Cr
    spent: 39500000,    // ₹3.95 Cr
    committed: 6500000,  // ₹65 Lakhs
    projectedOverspend: 2100000, // ₹21 Lakhs
    burnRatePercent: 82.3,
    riskLevel: 'CRITICAL',
    activeAnomaliesCount: 6,
    monthlyHistory: [
      { month: 'Apr 26', allocated: 4000000, actual: 3900000, forecast: 4000000, anomalies: 0 },
      { month: 'May 26', allocated: 4000000, actual: 4200000, forecast: 4100000, anomalies: 1 },
      { month: 'Jun 26', allocated: 4200000, actual: 4800000, forecast: 4200000, anomalies: 2 },
      { month: 'Jul 26', allocated: 4000000, actual: 4600000, forecast: 4100000, anomalies: 3 },
      { month: 'Aug 26', allocated: 4000000, actual: 5800000, forecast: 4300000, anomalies: 5 },
      { month: 'Sep 26 (Est)', allocated: 4000000, actual: 5200000, forecast: 4400000, anomalies: 4 },
    ],
    categoryBreakdown: [
      { category: 'Statutory Audit & Assurance Fees', amount: 16000000, percentage: 40.5 },
      { category: 'Treasury Wire Fees & Hedging Cost', amount: 12500000, percentage: 31.6 },
      { category: 'Corporate Tax Advisory & MCA Filing', amount: 7000000, percentage: 17.7 },
      { category: 'Banking Gateway Tech Subscriptions', amount: 4000000, percentage: 10.2 },
    ],
  },
  {
    id: 'dept_sec',
    name: 'Cybersecurity & Internal Controls',
    code: 'SEC-05',
    head: 'Dr. Elena Vance',
    headEmail: 'elena.vance@sentinel-fin.internal',
    fiscalYear: 'FY 2026–27',
    allocated: 52000000, // ₹5.20 Cr
    spent: 36000000,    // ₹3.60 Cr
    committed: 8000000,  // ₹80 Lakhs
    projectedOverspend: 0,
    burnRatePercent: 69.2,
    riskLevel: 'LOW',
    activeAnomaliesCount: 1,
    monthlyHistory: [
      { month: 'Apr 26', allocated: 4300000, actual: 4100000, forecast: 4200000, anomalies: 0 },
      { month: 'May 26', allocated: 4300000, actual: 4400000, forecast: 4300000, anomalies: 0 },
      { month: 'Jun 26', allocated: 4500000, actual: 4600000, forecast: 4400000, anomalies: 0 },
      { month: 'Jul 26', allocated: 4300000, actual: 4350000, forecast: 4300000, anomalies: 0 },
      { month: 'Aug 26', allocated: 4300000, actual: 4450000, forecast: 4350000, anomalies: 1 },
      { month: 'Sep 26 (Est)', allocated: 4300000, actual: 4300000, forecast: 4300000, anomalies: 0 },
    ],
    categoryBreakdown: [
      { category: '24/7 SOC & Threat Feeds', amount: 15000000, percentage: 41.7 },
      { category: 'Penetration Testing & Red Teaming', amount: 9500000, percentage: 26.4 },
      { category: 'Identity & Access Management (IAM)', amount: 7500000, percentage: 20.8 },
      { category: 'ISO 27001 Certification & Audits', amount: 4000000, percentage: 11.1 },
    ],
  },
  {
    id: 'dept_hr',
    name: 'People Operations & Talent Acquisition',
    code: 'HR-06',
    head: 'Amara Okafor',
    headEmail: 'amara.okafor@sentinel-fin.internal',
    fiscalYear: 'FY 2026–27',
    allocated: 38000000, // ₹3.80 Cr
    spent: 27500000,    // ₹2.75 Cr
    committed: 4500000,  // ₹45 Lakhs
    projectedOverspend: 0,
    burnRatePercent: 72.4,
    riskLevel: 'LOW',
    activeAnomaliesCount: 0,
    monthlyHistory: [
      { month: 'Apr 26', allocated: 3100000, actual: 2950000, forecast: 3050000, anomalies: 0 },
      { month: 'May 26', allocated: 3100000, actual: 3200000, forecast: 3100000, anomalies: 0 },
      { month: 'Jun 26', allocated: 3300000, actual: 3450000, forecast: 3200000, anomalies: 0 },
      { month: 'Jul 26', allocated: 3100000, actual: 3150000, forecast: 3100000, anomalies: 0 },
      { month: 'Aug 26', allocated: 3100000, actual: 3250000, forecast: 3150000, anomalies: 0 },
      { month: 'Sep 26 (Est)', allocated: 3100000, actual: 3100000, forecast: 3100000, anomalies: 0 },
    ],
    categoryBreakdown: [
      { category: 'Group Medical Insurance & Benefits', amount: 14000000, percentage: 50.9 },
      { category: 'Executive Search & Placement Fees', amount: 6500000, percentage: 23.6 },
      { category: 'Employee Learning & Upskilling', amount: 4500000, percentage: 16.4 },
      { category: 'HRMS & Payroll Platform SaaS', amount: 2500000, percentage: 9.1 },
    ],
  },
];

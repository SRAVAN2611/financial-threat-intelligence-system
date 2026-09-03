import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

import User from '../models/User.js';
import Department from '../models/Department.js';
import Budget from '../models/Budget.js';
import Expenditure from '../models/Expenditure.js';
import SecurityEvent from '../models/SecurityEvent.js';
import Alert from '../models/Alert.js';
import AuditLog from '../models/AuditLog.js';
import RiskScore from '../models/RiskScore.js';
import Investigation from '../models/Investigation.js';
import Vendor from '../models/Vendor.js';
import AIRule from '../models/AIRule.js';
import { runFinancialDetectionRules } from '../detection/detectionEngine.js';

// Resolve configuration path
dotenv.config();

const seedDatabase = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sentinel_fin';
    console.log(`Connecting to database for seeding: ${connStr}...`);
    await mongoose.connect(connStr);
    console.log('MongoDB Connected. Flushing tables...');

    // Wipe previous structures
    await User.deleteMany({});
    await Department.deleteMany({});
    await Budget.deleteMany({});
    await Expenditure.deleteMany({});
    await SecurityEvent.deleteMany({});
    await Alert.deleteMany({});
    await AuditLog.deleteMany({});
    await RiskScore.deleteMany({});
    await Investigation.deleteMany({});
    await Vendor.deleteMany({});
    await AIRule.deleteMany({});

    console.log('Collections flushed. Generating Seed Data...');

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Departments creation
    const departmentsData = [
      { code: 'ENG-01', name: 'Engineering & Infrastructure', head: 'Priya Sharma', headEmail: 'priya.sharma@sentinel-fin.internal' },
      { code: 'MKT-02', name: 'Global Marketing & Brand Growth', head: 'Julian Vance', headEmail: 'julian.vance@sentinel-fin.internal' },
      { code: 'OPS-03', name: 'Corporate Operations & Logistics', head: 'Vikram Seth', headEmail: 'vikram.seth@sentinel-fin.internal' },
      { code: 'FIN-04', name: 'Finance & Treasury Management', head: 'Rajesh Malhotra', headEmail: 'rajesh.malhotra@sentinel-fin.internal' },
      { code: 'SEC-05', name: 'Cybersecurity & Internal Controls', head: 'Dr. Elena Vance', headEmail: 'elena.vance@sentinel-fin.internal' },
      { code: 'HR-06', name: 'People Operations & Talent Acquisition', head: 'Amara Okafor', headEmail: 'amara.okafor@sentinel-fin.internal' }
    ];
    await Department.insertMany(departmentsData);
    console.log('Departments Created.');

    // 2. Users seeding
    const usersData = [
      // 1 Admin
      {
        name: 'Dr. Elena Vance',
        email: 'elena.vance@sentinel-fin.internal',
        passwordHash,
        role: 'ADMIN',
        roleTitle: 'Chief Risk & Information Security Officer',
        departmentId: 'SEC-05',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      // 3 Finance Officers
      {
        name: 'Rajesh Malhotra',
        email: 'rajesh.malhotra@sentinel-fin.internal',
        passwordHash,
        role: 'FINANCE_OFFICER',
        roleTitle: 'Senior Financial Controller & Treasury Lead',
        departmentId: 'FIN-04',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@sentinel-fin.internal',
        passwordHash,
        role: 'FINANCE_OFFICER',
        roleTitle: 'Internal Audit Manager',
        departmentId: 'FIN-04',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Vikram Roy',
        email: 'vikram.roy@sentinel-fin.internal',
        passwordHash,
        role: 'FINANCE_OFFICER',
        roleTitle: 'Treasury Analyst',
        departmentId: 'FIN-04',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      // 5 Department Heads
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@sentinel-fin.internal',
        passwordHash,
        role: 'DEPARTMENT_HEAD',
        roleTitle: 'VP of Engineering & Technology Head',
        departmentId: 'ENG-01',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Julian Vance',
        email: 'julian.vance@sentinel-fin.internal',
        passwordHash,
        role: 'DEPARTMENT_HEAD',
        roleTitle: 'Global Marketing Chief',
        departmentId: 'MKT-02',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Vikram Seth',
        email: 'vikram.seth@sentinel-fin.internal',
        passwordHash,
        role: 'DEPARTMENT_HEAD',
        roleTitle: 'VP of Global Operations',
        departmentId: 'OPS-03',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Amara Okafor',
        email: 'amara.okafor@sentinel-fin.internal',
        passwordHash,
        role: 'DEPARTMENT_HEAD',
        roleTitle: 'Director of Human Resources',
        departmentId: 'HR-06',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        status: 'active'
      }
    ];

    const users = await User.insertMany(usersData);
    console.log('Users Created (password: password123).');

    // 3. Budgets seeding (FY 2026-27)
    // allocated sums matching realistic enterprise values (total ~₹125 Crore across 6 depts)
    const budgetsData = [
      { departmentId: 'ENG-01', financialYear: 'FY 2026–27', allocatedAmount: 250000000, category: 'Cloud Infrastructure & Compute', spentAmount: 40000000, committedAmount: 5000000, createdBy: 'elena.vance@sentinel-fin.internal' },
      { departmentId: 'MKT-02', financialYear: 'FY 2026–27', allocatedAmount: 20000000, category: 'Global Advertising', spentAmount: 18500000, committedAmount: 3000000, createdBy: 'elena.vance@sentinel-fin.internal' },
      { departmentId: 'OPS-03', financialYear: 'FY 2026–27', allocatedAmount: 45000000, category: 'Corporate Logistics', spentAmount: 12000000, committedAmount: 2000000, createdBy: 'elena.vance@sentinel-fin.internal' },
      { departmentId: 'FIN-04', financialYear: 'FY 2026–27', allocatedAmount: 30000000, category: 'Enterprise Core Software', spentAmount: 15200000, committedAmount: 1500000, createdBy: 'elena.vance@sentinel-fin.internal' },
      { departmentId: 'SEC-05', financialYear: 'FY 2026–27', allocatedAmount: 25000000, category: 'IDS/IPS Cybersecurity Retainers', spentAmount: 9800000, committedAmount: 800000, createdBy: 'elena.vance@sentinel-fin.internal' },
      { departmentId: 'HR-06', financialYear: 'FY 2026–27', allocatedAmount: 15000000, category: 'Global Talent Acquisition', spentAmount: 8500000, committedAmount: 450000, createdBy: 'elena.vance@sentinel-fin.internal' }
    ];

    const budgets = await Budget.insertMany(budgetsData);
    console.log('Budgets created.');

    // 4. Normal Expenditures seeding (Hundreds of records)
    console.log('Generating normal expenditures...');
    const vendors = [
      { name: 'Amazon Web Services (AWS)', category: 'Cloud Infrastructure & Compute' },
      { name: 'Google Cloud Platform (GCP)', category: 'Cloud Infrastructure & Compute' },
      { name: 'Microsoft Azure Services', category: 'Cloud Infrastructure & Compute' },
      { name: 'Snowflake Analytics Cloud', category: 'Cloud Infrastructure & Compute' },
      { name: 'Oracle Database Cloud', category: 'Cloud Infrastructure & Compute' },
      { name: 'Salesforce CRM Retainers', category: 'Enterprise Core Software' },
      { name: 'SAP S/4HANA ERP Licensing', category: 'Enterprise Core Software' },
      { name: 'Atlassian Jira Enterprise Suite', category: 'Enterprise Core Software' },
      { name: 'Adobe Creative Suite Licensing', category: 'Global Advertising' },
      { name: 'Meta Advertising Campaigns', category: 'Global Advertising' },
      { name: 'Google Marketing ADS Core', category: 'Global Advertising' },
      { name: 'Deloitte Compliance Audit Services', category: 'Enterprise Core Software' },
      { name: 'CrowdStrike Falcon Endpoint Security', category: 'IDS/IPS Cybersecurity Retainers' },
      { name: 'Palo Alto Networks NextGen firewall', category: 'IDS/IPS Cybersecurity Retainers' },
      { name: 'Mercer Corporate Recruiting Services', category: 'Global Talent Acquisition' },
      { name: 'Workday HR Management Software', category: 'Global Talent Acquisition' },
      { name: 'DHL Global Logistics Clearing', category: 'Corporate Logistics' },
      { name: 'FedEx Express Freight Retainers', category: 'Corporate Logistics' }
    ];

    const expendituresToInsert = [];
    const normalCount = 80;

    for (let i = 0; i < normalCount; i++) {
      const budgetObj = budgets[i % budgets.length];
      const vendor = vendors.find(v => v.category === budgetObj.category) || vendors[0];

      const amount = Math.floor(25000 + Math.random() * 250000); // ₹25,000 - ₹2,75,000
      const daysAgo = Math.floor(Math.random() * 120); // up to 120 days ago
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      const refNo = `TXN-2026-${String(transactionDate.getMonth() + 1).padStart(2, '0')}${String(transactionDate.getDate()).padStart(2, '0')}-${10000 + i}`;
      const hash = bcrypt.hashSync(refNo + amount, 2); // quick hash

      expendituresToInsert.push({
        budgetId: budgetObj._id,
        departmentId: budgetObj.departmentId,
        amount,
        category: vendor.category,
        description: `${vendor.name} - Monthly Invoice Payments #${refNo.substring(10)}`,
        transactionDate,
        documentReference: `INV-2026-${2500 + i}`,
        enteredBy: 'amit.patel@sentinel-fin.internal',
        status: 'APPROVED',
        referenceNo: refNo,
        riskScore: 10 + Math.floor(Math.random() * 15), // 10-25
        riskLevel: 'LOW',
        sha256Hash: hash.substring(0, 64),
        destinationAccount: `acc_inr_${Math.floor(100000 + Math.random() * 900000)}`,
        originatingAccount: `acc_inr_${budgetObj.departmentId.toLowerCase()}_clearing`,
      });
    }

    await Expenditure.insertMany(expendituresToInsert);
    console.log('Inserted 80 normal transactions.');

    // 5. SEED SPECIFIC DEMONSTRATION SCENARIOS
    console.log('Seeding the 6 demonstration scenarios...');

    // Scenario 1: Under-utilization budget alert inside ENG-01
    // Already set in budget ENG-01: Allocated ₹25 Crore, Spent is ₹4.0 Crore (which is only 16% utilized).
    const engBudget = budgets.find(b => b.departmentId === 'ENG-01');
    const underUtilAlert = await Alert.create({
      departmentId: 'ENG-01',
      budgetId: engBudget._id,
      relatedUserId: 'priya.sharma@sentinel-fin.internal',
      alertType: 'FINANCIAL',
      category: 'UNDER_UTILIZATION',
      severity: 'HIGH',
      riskScore: 65,
      title: 'Structural Budget Under-Utilization Detected',
      description: 'Department is displaying a low utilization velocity. Elapsed financial timeline is 75%, but spending burn rate is only 16%.',
      reasons: [
        'Allocation: ₹25,00,00,000 INR (₹25 Crore). Total Spent: ₹4,00,00,000 INR.',
        'Utilization is under critical 40% compliance run-rate target.',
        'Projected surplus of ₹21,00,00,000 (₹21 Crore) indicates potential overallocation or project delays.'
      ],
      status: 'NEW',
    });

    // Scenario 2: Overspending budget alert in MKT-02
    // Budget is ₹2 Crore, spent/committed is ₹2.15 Crore.
    const mktBudget = budgets.find(b => b.departmentId === 'MKT-02');
    const overspendAlert = await Alert.create({
      departmentId: 'MKT-02',
      budgetId: mktBudget._id,
      relatedUserId: 'julian.vance@sentinel-fin.internal',
      alertType: 'FINANCIAL',
      category: 'OVERSPENDING',
      severity: 'CRITICAL',
      riskScore: 90,
      title: 'Critical Budget Overrun Encountered',
      description: 'Total expenditures + committed obligations exceed allocated marketing limit by ₹15,00,000 (₹15 Lakhs).',
      reasons: [
        'Allocated limit: ₹2,00,00,000 (₹2 Crore).',
        'Total expenditures: ₹1,85,00,000. Committed contracts: ₹30,00,000.',
        'Current deficit: -₹15,00,000 INR. Violation of internal budget limits.',
      ],
      status: 'NEW',
    });

    // In MKT-02, add the transaction that breached the limit
    const breachingTx = await Expenditure.create({
      budgetId: mktBudget._id,
      departmentId: 'MKT-02',
      amount: 3000000, // ₹30 Lakhs
      category: 'Global Advertising',
      description: 'Meta Advertising Campaigns - Q2 Retargeting Ads',
      transactionDate: new Date(),
      documentReference: 'INV-META-9938',
      enteredBy: 'julian.vance@sentinel-fin.internal',
      status: 'FLAGGED',
      referenceNo: 'TXN-2026-0815-99388',
      riskScore: 85,
      riskLevel: 'CRITICAL',
      threatCategory: 'OVERSPENDING',
      threatFlags: ['OVERSPENDING_ breach'],
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      destinationAccount: 'acc_inr_meta_ads',
      originatingAccount: 'acc_inr_mkt_clearing',
      aiForensicSummary: 'Transaction breaches allocated departmental budget overrun thresholds.',
    });

    // Scenario 3: Spending Spike alert inside OPS-03
    // Aggregate spending this month is ₹2.8 Crore compared to average of ₹80 Lakhs
    const opsBudget = budgets.find(b => b.departmentId === 'OPS-03');

    // Add a single massive transaction of ₹2.8 Crore representing the spike
    const spikeTx = await Expenditure.create({
      budgetId: opsBudget._id,
      departmentId: 'OPS-03',
      amount: 28000000, // ₹2.8 Crores
      category: 'Corporate Logistics',
      description: 'DHL Global Logistics Clearing - Core Supply Chain Fleet Acquisition',
      transactionDate: new Date(),
      documentReference: 'INV-DHL-9922',
      enteredBy: 'vikram.seth@sentinel-fin.internal',
      status: 'FLAGGED',
      referenceNo: 'TXN-2026-0812-11928',
      riskScore: 70,
      riskLevel: 'HIGH',
      threatCategory: 'SPENDING_SPIKE',
      threatFlags: ['SPENDING_SPIKE'],
      sha256Hash: '43ec592dd8481c149afbf4c8996fb92427ae41e4649b934ca495991b7852faaa',
      destinationAccount: 'acc_inr_dhl_freight',
      originatingAccount: 'acc_inr_ops_clearing',
      aiForensicSummary: 'Monthly spending spike: Transaction is 3.5x higher than historical weekly operational spent average.',
    });

    const spikeAlert = await Alert.create({
      departmentId: 'OPS-03',
      budgetId: opsBudget._id,
      relatedUserId: 'vikram.seth@sentinel-fin.internal',
      alertType: 'FINANCIAL',
      category: 'SPENDING_SPIKE',
      severity: 'HIGH',
      riskScore: 70,
      title: 'Abrupt Spending Spike Detected',
      description: 'Monthly run-rate in operational logistics is ₹2,80,00,000 INR, deviating from historical average monthly spent (₹80,00,000 INR).',
      reasons: [
        'Total current month expenditures in department represent 350% deviation.',
        'Spike is led by transaction TXN-2026-0812-11928 (₹2.8 Crore) to DHL Global Logistics.',
      ],
      status: 'NEW',
    });

    // Scenario 4: Unauthorized access security alert
    // Priya Sharma (head of ENG) attempting to perform budget adjustments on FIN-04
    const secAccessAlert = await Alert.create({
      departmentId: 'ENG-01',
      relatedUserId: 'priya.sharma@sentinel-fin.internal',
      alertType: 'SECURITY',
      category: 'UNAUTHORIZED_ACCESS',
      severity: 'HIGH',
      riskScore: 75,
      title: 'Boundary Enforcement: Unauthorized API Access Attempt Blocked',
      description: 'Department head from Engineering & Technology (ENG-01) attempted to access restricted endpoint reserved for Finance & Treasury controllers.',
      reasons: [
        'Source email: priya.sharma@sentinel-fin.internal (DEPARTMENT_HEAD role)',
        'Endpoint targeted: PUT /api/budgets/FIN-04/adjust',
        'Result: BLOCKED by boundary security middleware (403 Forbidden).',
      ],
      status: 'NEW',
    });

    await SecurityEvent.create({
      userId: 'priya.sharma@sentinel-fin.internal',
      departmentId: 'ENG-01',
      eventType: 'UNAUTHORIZED_ACCESS',
      resource: '/api/budgets/FIN-04/adjust',
      action: 'WRITE',
      result: 'DENIED',
      severity: 'HIGH',
      ipAddress: '192.168.4.15',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      metadata: { reason: 'Cross-department privilege violation attempt.' }
    });

    // Scenario 5: Suspicious budget modification attempt (Department Head attempting edit code)
    const budgetModAlert = await Alert.create({
      departmentId: 'MKT-02',
      relatedUserId: 'julian.vance@sentinel-fin.internal',
      alertType: 'SECURITY',
      category: 'PRIVILEGE_VIOLATION',
      severity: 'HIGH',
      riskScore: 80,
      title: 'Suspicious Budget Modification Attempt Captured',
      description: 'Unauthorized write attempt to budget allocation database configurations was blocked by security monitors.',
      reasons: [
        'Action: Attempted modification of budget cap for category Global Advertising.',
        'Requested modification: Increase limit to ₹2,50,00,000 INR from unauthorized client session API call.',
        'Result: Blocked. User julian.vance@sentinel-fin.internal lacks ADMIN/FINANCE_OFFICER permissions.',
      ],
      status: 'NEW',
    });

    await SecurityEvent.create({
      userId: 'julian.vance@sentinel-fin.internal',
      departmentId: 'MKT-02',
      eventType: 'PRIVILEGE_VIOLATION',
      resource: '/api/budgets/MKT-02/adjust',
      action: 'WRITE',
      result: 'BLOCKED',
      severity: 'HIGH',
      ipAddress: '10.0.82.14',
      userAgent: 'PostmanRuntime/7.36.3',
      metadata: { proposedAllocation: 25000000 }
    });

    // Scenario 6: Correlated financial + security incident details
    // Department: SEC-05. Failed login attempts followed by a large transaction of ₹5.6 Crores within 15 minutes.
    const secBudget = budgets.find(b => b.departmentId === 'SEC-05');

    // Create 3 failed logins
    await SecurityEvent.create({
      userId: 'elena.vance@sentinel-fin.internal',
      departmentId: 'SEC-05',
      eventType: 'FAILED_LOGIN',
      resource: '/api/auth/login',
      action: 'AUTHENTICATE',
      result: 'DENIED',
      severity: 'MEDIUM',
      ipAddress: '198.51.100.41', // Anomalous external IP
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)',
      timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    });
    await SecurityEvent.create({
      userId: 'elena.vance@sentinel-fin.internal',
      departmentId: 'SEC-05',
      eventType: 'FAILED_LOGIN',
      resource: '/api/auth/login',
      action: 'AUTHENTICATE',
      result: 'DENIED',
      severity: 'MEDIUM',
      ipAddress: '198.51.100.41',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)',
      timestamp: new Date(Date.now() - 4 * 60 * 1000)
    });
    await SecurityEvent.create({
      userId: 'elena.vance@sentinel-fin.internal',
      departmentId: 'SEC-05',
      eventType: 'FAILED_LOGIN_BURST',
      resource: '/api/auth/login',
      action: 'AUTHENTICATE',
      result: 'DENIED',
      severity: 'HIGH',
      ipAddress: '198.51.100.41',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      metadata: { reason: 'Account lockout threshold reached.' }
    });

    // Large transaction in SEC-05
    const largeSecTx = await Expenditure.create({
      budgetId: secBudget._id,
      departmentId: 'SEC-05',
      amount: 56000000, // ₹5.6 Crores
      category: 'IDS/IPS Cybersecurity Retainers',
      description: 'CrowdStrike Falcon Endpoint Security - Enterprise Licensing Expansion',
      transactionDate: new Date(),
      documentReference: 'INV-CS-0091',
      enteredBy: 'elena.vance@sentinel-fin.internal',
      status: 'QUARANTINED',
      referenceNo: 'TXN-2026-0815-00911',
      riskScore: 95,
      riskLevel: 'CRITICAL',
      threatCategory: 'CORRELATED_THREAT',
      threatFlags: ['FAILED_LOGIN_BURST', 'HIGH_VALUE_TRANSACTION'],
      sha256Hash: '91f6c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852fa77',
      destinationAccount: 'acc_inr_crowdstrike_corp',
      originatingAccount: 'acc_inr_sec_clearing',
      aiForensicSummary: 'Correlated event sequence: High-value transaction posted shortly after a brute-force authentication failure lockout on same account.',
    });

    const correlatedAlert = await Alert.create({
      departmentId: 'SEC-05',
      budgetId: secBudget._id,
      relatedUserId: 'elena.vance@sentinel-fin.internal',
      alertType: 'CORRELATED',
      category: 'CORRELATED_THREAT',
      severity: 'CRITICAL',
      riskScore: 95,
      title: 'Multi-Vector Account Takeover & Fraud Correlation',
      description: 'Correlated anomaly: Repeated authentication failures (FAILED_LOGIN_BURST) followed within 5 minutes by a critical high-value transaction of ₹5.6 Crore (TXN-2026-0815-00911).',
      reasons: [
        'Anomalous external IP 198.51.100.41 logged 3 failed login attempts on Dr. Elena Vance\'s account.',
        'Audit trail shows transaction of ₹5,60,00,000 INR was dispatched shortly under the same credentials.',
        'Risk rating points to corporate credentials leakage or account hijack. Transaction held in quarantine.',
      ],
      status: 'NEW',
    });

    console.log('All 6 scenarios seeded successfully. Recalculating risk scores...');

    // Recalculate Risk scorecard records for all 6 departments
    for (const d of departmentsData) {
      await RiskScore.create({
        departmentId: d.code,
        financialRisk: d.code === 'MKT-02' ? 85 : d.code === 'OPS-03' ? 65 : d.code === 'ENG-01' ? 45 : 10,
        securityRisk: d.code === 'SEC-05' ? 90 : d.code === 'ENG-01' ? 70 : d.code === 'MKT-02' ? 75 : 15,
        behavioralRisk: d.code === 'SEC-05' ? 80 : 10,
        transactionRisk: d.code === 'SEC-05' ? 95 : d.code === 'OPS-03' ? 70 : d.code === 'MKT-02' ? 80 : 15,
        overallRisk: d.code === 'SEC-05' ? 95 : d.code === 'MKT-02' ? 85 : d.code === 'ENG-01' ? 65 : d.code === 'OPS-03' ? 70 : 15,
        riskLevel: d.code === 'SEC-05' ? 'CRITICAL' : d.code === 'MKT-02' ? 'CRITICAL' : d.code === 'ENG-01' ? 'HIGH' : d.code === 'OPS-03' ? 'HIGH' : 'LOW',
        factors: d.code === 'SEC-05'
          ? [
              { factor: 'Multi-Vector Correlation', points: 45, description: 'Brute-force logon failures preceding large expenditure transfers.' },
              { factor: 'Critical Outliers', points: 35, description: 'High-value transaction quarantine holds.' }
            ]
          : d.code === 'MKT-02'
          ? [
              { factor: 'Budget Overrun', points: 40, description: 'Total spend exceed allocation ceiling by ₹15 Lakhs.' },
              { factor: 'Privilege Violation Attempt', points: 30, description: 'Unauthorized budget modification API call.' }
            ]
          : d.code === 'ENG-01'
          ? [
              { factor: 'Under-Utilization', points: 30, description: 'Spending velocity under critical target limits.' },
              { factor: 'Unauthorized access', points: 25, description: 'Blocked write attempt to cross-department settings.' }
            ]
          : d.code === 'OPS-03'
          ? [
              { factor: 'Spending Spike', points: 40, description: 'Deviation of 3.5x from average monthly operations ledger.' }
            ]
          : [],
      });
    }

    // Lazy load baseline audit log entries
    await AuditLog.create({
      userId: 'elena.vance@sentinel-fin.internal',
      userName: 'Dr. Elena Vance',
      role: 'ADMIN',
      action: 'SYSTEM_BOOT',
      entityType: 'SYSTEM',
      entityId: 'SYS_INIT',
      details: 'Sentinel-Fin threat detection kernel loaded. Automated ISO 27001 rules verified.',
      ipAddress: '127.0.0.1',
      immutableHash: '0x32f80c69d8481c149afbf4c8996fb92427ae41e4649b934ca495991b7852faee',
      status: 'SUCCESS'
    });

    // Seed Vendors
    console.log('Seeding Vendor Risk Intelligence Profiles...');
    await Vendor.insertMany([
      {
        name: 'Amazon Web Services (AWS)',
        registrationIdentifier: 'REG-US-AWS-9021',
        taxId: 'US-95438201',
        category: 'Cloud Infrastructure & Compute',
        departmentIds: ['ENG-01', 'SEC-05'],
        jurisdiction: 'United States (Delaware)',
        totalTransactions: 28,
        totalAmount: 40000000,
        riskScore: 12,
        riskLevel: 'LOW',
        riskFactors: [{ factor: 'Established Enterprise', points: 0, description: 'Verified Fortune 500 vendor' }],
        status: 'ACTIVE',
      },
      {
        name: 'DHL Global Logistics Clearing',
        registrationIdentifier: 'REG-DE-DHL-4412',
        taxId: 'DE-11983021',
        category: 'Corporate Logistics',
        departmentIds: ['OPS-03'],
        jurisdiction: 'Germany (Bonn)',
        totalTransactions: 14,
        totalAmount: 38000000,
        riskScore: 68,
        riskLevel: 'HIGH',
        riskFactors: [
          { factor: 'Spending Velocity Spike', points: 40, description: '3.5x sudden increase in invoice posting volume' }
        ],
        status: 'UNDER_SURVEILLANCE',
      },
      {
        name: 'CrowdStrike Falcon Endpoint Security',
        registrationIdentifier: 'REG-US-CS-1102',
        taxId: 'US-8830192',
        category: 'IDS/IPS Cybersecurity Retainers',
        departmentIds: ['SEC-05'],
        jurisdiction: 'United States (Austin, TX)',
        totalTransactions: 6,
        totalAmount: 56000000,
        riskScore: 88,
        riskLevel: 'CRITICAL',
        riskFactors: [
          { factor: 'Quarantined Wire Transfer', points: 50, description: 'Correlated account takeover security incident' }
        ],
        status: 'UNDER_SURVEILLANCE',
      },
      {
        name: 'Meta Advertising Campaigns',
        registrationIdentifier: 'REG-US-META-004',
        taxId: 'US-7740192',
        category: 'Global Advertising',
        departmentIds: ['MKT-02'],
        jurisdiction: 'United States (Menlo Park)',
        totalTransactions: 19,
        totalAmount: 18500000,
        riskScore: 82,
        riskLevel: 'CRITICAL',
        riskFactors: [
          { factor: 'Department Budget Breach', points: 45, description: 'Overrun marketing ceiling by ₹15 Lakhs' }
        ],
        status: 'UNDER_SURVEILLANCE',
      },
      {
        name: 'Apex Global Off-shore Consultancy Ltd',
        registrationIdentifier: 'REG-CY-APEX-991',
        taxId: 'CY-9021849',
        category: 'External Consulting Services',
        departmentIds: ['FIN-04'],
        jurisdiction: 'Cyprus (Nicosia)',
        totalTransactions: 2,
        totalAmount: 14500000,
        riskScore: 92,
        riskLevel: 'CRITICAL',
        riskFactors: [
          { factor: 'High Risk Jurisdiction', points: 40, description: 'Off-shore tax haven jurisdiction' },
          { factor: 'Shell Entity Pattern', points: 35, description: 'Newly incorporated entity with unverified UBO' }
        ],
        status: 'SUSPENDED',
      }
    ]);

    // Seed AI Threat Detection Rules
    console.log('Seeding AI Rules & Policies...');
    await AIRule.insertMany([
      {
        code: 'RULE-BENFORD-01',
        name: 'Benford First-Digit Statistical Anomaly',
        description: 'Monitors invoice amount leading digits against Benford distribution law to detect manual number fabrication.',
        category: 'FINANCIAL',
        ruleType: 'STATISTICAL_BENFORD',
        condition: 'leading_digit_chi_square_pvalue < 0.05',
        threshold: 'P-Value < 0.05',
        severity: 'HIGH',
        riskWeight: 25,
        enabled: true,
        action: 'FLAG_FOR_AUDIT',
        triggerCount24h: 3,
        lastTriggered: '12 mins ago',
        createdBy: 'Dr. Elena Vance (ADMIN)',
      },
      {
        code: 'RULE-OVERSPEND-02',
        name: 'Departmental Allocation Overrun Guard',
        description: 'Triggers instant quarantine when cumulative expenditure exceeds total department allocated budget limit.',
        category: 'FINANCIAL',
        ruleType: 'HEURISTIC_THRESHOLD',
        condition: 'total_spent + transaction_amount > allocated_cap',
        threshold: '100% Budget Cap',
        severity: 'CRITICAL',
        riskWeight: 40,
        enabled: true,
        action: 'QUARANTINE_TRANSFERS',
        triggerCount24h: 1,
        lastTriggered: '45 mins ago',
        createdBy: 'Dr. Elena Vance (ADMIN)',
      },
      {
        code: 'RULE-SPIKE-03',
        name: 'Abrupt Spending Velocity Surge',
        description: 'Detects sudden expenditure bursts exceeding 2.5x historical 30-day moving average in any single department.',
        category: 'FINANCIAL',
        ruleType: 'VELOCITY_SPIKE',
        condition: 'monthly_spend > 2.5 * moving_avg_spend',
        threshold: '250% Moving Average',
        severity: 'HIGH',
        riskWeight: 30,
        enabled: true,
        action: 'FLAG_FOR_AUDIT',
        triggerCount24h: 2,
        lastTriggered: '2 hours ago',
        createdBy: 'Rajesh Malhotra (FINANCE_OFFICER)',
      },
      {
        code: 'RULE-CORR-04',
        name: 'Multi-Vector Security & Wire Correlation',
        description: 'Correlates brute-force authentication failures or lockout events with high-value outgoing wire transfers within 15 mins.',
        category: 'CORRELATED',
        ruleType: 'MULTI_VECTOR_CORRELATION',
        condition: 'failed_login_count >= 3 AND wire_amount > 1,00,00,000 within 15m',
        threshold: '3 Logins + ₹1 Cr Wire',
        severity: 'CRITICAL',
        riskWeight: 50,
        enabled: true,
        action: 'BLOCK_AND_QUARANTINE',
        triggerCount24h: 1,
        lastTriggered: '5 mins ago',
        createdBy: 'Dr. Elena Vance (ADMIN)',
      },
      {
        code: 'RULE-RBAC-05',
        name: 'Cross-Department Authorization Violation',
        description: 'Blocks and logs security alert when non-admin user attempts budget adjustment outside their assigned department code.',
        category: 'SECURITY',
        ruleType: 'BOUNDARY_ENFORCEMENT',
        condition: 'user.departmentId != target.departmentId AND user.role != ADMIN',
        threshold: 'Strict RBAC Match',
        severity: 'HIGH',
        riskWeight: 20,
        enabled: true,
        action: 'BLOCK_REQUEST',
        triggerCount24h: 4,
        lastTriggered: '30 mins ago',
        createdBy: 'Dr. Elena Vance (ADMIN)',
      }
    ]);

    console.log('Database Seeding Completed Successfully! You can now log in using elena.vance@sentinel-fin.internal / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Exception occurred:', error);
    process.exit(1);
  }
};

seedDatabase();

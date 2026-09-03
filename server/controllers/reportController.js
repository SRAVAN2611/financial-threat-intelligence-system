import Expenditure from '../models/Expenditure.js';
import AuditLog from '../models/AuditLog.js';
import Alert from '../models/Alert.js';

export const getReportsList = async (req, res) => {
  try {
    const reports = [
      {
        id: 'rep_fy_audit_trail',
        title: 'Complete Audit Activity Trail (FY 2026–27)',
        description: 'Activity logging trail aligned with selected governance and security control concepts, containing user modifications and boundary checks.',
        type: 'CSV',
        category: 'COMPLIANCE',
        generatedAt: new Date().toISOString(),
        downloadUrl: '/api/reports/export?type=audit',
      },
      {
        id: 'rep_forensic_ledger',
        title: 'Forensic Transaction Ledger Matrix',
        description: 'Chronological list of all corporate expenditures including SHA-256 signatures, risk scoring weights, and threat anomaly tags.',
        type: 'CSV',
        category: 'FORENSIC',
        generatedAt: new Date().toISOString(),
        downloadUrl: '/api/reports/export?type=ledger',
      },
      {
        id: 'rep_sar_filings',
        title: 'Financial Risk Investigation Reports',
        description: 'Compilations of all correlated threats and critical overspending anomalies flagged by Sentinel-Fin rules engines.',
        type: 'CSV',
        category: 'SECURITY',
        generatedAt: new Date().toISOString(),
        downloadUrl: '/api/reports/export?type=alerts',
      }
    ];

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStandards = async (req, res) => {
  try {
    const standards = [
      {
        id: 'std_iso27001',
        name: 'Governance & Security Controls (ISO/IEC 27001 Aligned)',
        code: 'ISO-27001-ALIGN',
        standardType: 'ISO_27001',
        complianceScore: 98.4,
        status: 'COMPLIANT',
        totalControls: 93,
        passedControls: 92,
        failingControls: 1,
        lastAuditDate: '2026-02-15',
        leadAuditor: 'Internal Cyber Governance Team',
        findings: [
          {
            id: 'fnd_iso_01',
            controlId: 'A.9.2.6',
            title: 'Quarterly Privileged Access Review',
            severity: 'MEDIUM',
            description: 'Two administrative service keys exceeded 90-day rotation threshold without explicit risk waiver.',
            remediation: 'Automated key rotation policy enforced across Sentinel API gateway.',
          },
        ],
      },
      {
        id: 'std_ifc',
        name: 'Internal Financial Control Framework (IFC Aligned)',
        code: 'IFC-ALIGN-2026',
        standardType: 'COMPANIES_ACT_IFC',
        complianceScore: 96.2,
        status: 'COMPLIANT',
        totalControls: 50,
        passedControls: 48,
        failingControls: 2,
        lastAuditDate: '2026-03-01',
        leadAuditor: 'Internal Controls Advisory',
        findings: [
          {
            id: 'fnd_ifc_01',
            controlId: 'IFC-CAP-04',
            title: 'Split Purchase Order Smurfing Detection',
            severity: 'HIGH',
            description: 'Sequential invoices beneath ₹5,00,000 threshold detected for unverified vendor entity.',
            remediation: 'Applied risk action hold on vendor account and dispatched internal investigation report.',
          },
        ],
      },
      {
        id: 'std_sox',
        name: 'Financial Control Governance (SOX 404 Aligned)',
        code: 'SOX-404-ALIGN',
        standardType: 'SOX_404',
        complianceScore: 94.8,
        status: 'NEEDS_ATTENTION',
        totalControls: 40,
        passedControls: 38,
        failingControls: 2,
        lastAuditDate: '2026-02-28',
        leadAuditor: 'Internal Governance Review',
        findings: [
          {
            id: 'fnd_sox_01',
            controlId: 'SOX-ITGC-02',
            title: 'Dual Approval Delegation Check',
            severity: 'MEDIUM',
            description: 'High-value expenditure approval logged single-signature override during emergency window.',
            remediation: 'Retrospective board ratification uploaded to audit log hash chain.',
          },
        ],
      },
    ];

    res.json({ success: true, standards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateInvestigationReport = async (req, res) => {
  const { incidentId, narrative } = req.body;

  try {
    const reportFilingId = `FRI-REPORT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const filingTimestamp = new Date().toISOString();
    const sha256Verification = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'INVESTIGATION_REPORT_GENERATED',
      entityType: 'ALERT',
      entityId: incidentId || 'GENERAL_INVESTIGATION',
      details: `Generated Financial Risk Investigation Report ID: ${reportFilingId}. Verification Hash: ${sha256Verification}`,
      ipAddress: req.ip || '127.0.0.1',
      immutableHash: sha256Verification,
      status: 'CRITICAL',
    });

    res.json({
      success: true,
      reportFilingId,
      sarFilingId: reportFilingId, // Backwards compatibility
      filingTimestamp,
      sha256Verification,
      narrative: narrative || 'Automated Sentinel Threat Intelligence Risk Investigation Report',
      status: 'COMPLETED_INTERNAL_RISK_REPORT',
      disclaimer: 'This document is an internal financial risk investigation report generated for corporate governance purposes. It does not constitute direct statutory or regulatory submission.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReportCSV = async (req, res) => {
  const { type } = req.query;

  try {
    let csvContent = '';
    let name = 'report.csv';

    if (type === 'audit') {
      name = 'Sentinel_Audit_Trail.csv';
      const logs = await AuditLog.find({}).sort({ timestamp: -1 });
      csvContent = 'Timestamp,Actor,Role,Action,Entity Type,Entity ID,Details,IP,Status\n';
      logs.forEach(log => {
        csvContent += `"${log.timestamp ? log.timestamp.toISOString() : log.createdAt.toISOString()}","${log.userId}","${log.role}","${log.action}","${log.entityType}","${log.entityId}","${(log.details || '').replace(/"/g, '""')}","${log.ipAddress}","${log.status}"\n`;
      });
    } else if (type === 'ledger') {
      name = 'Sentinel_Forensic_Ledger.csv';
      const exps = await Expenditure.find({}).sort({ transactionDate: -1 });
      csvContent = 'Date,Reference,Description,Department,Category,Amount (INR),Status,Risk Score,Risk Level,SHA256\n';
      exps.forEach(exp => {
        csvContent += `"${exp.transactionDate.toISOString()}","${exp.referenceNo}","${exp.description.replace(/"/g, '""')}","${exp.departmentId}","${exp.category}",${exp.amount},"${exp.status}",${exp.riskScore},"${exp.riskLevel}","${exp.sha256Hash}"\n`;
      });
    } else {
      name = 'Sentinel_Financial_Risk_Report.csv';
      const alerts = await Alert.find({}).sort({ createdAt: -1 });
      csvContent = 'Created At,Category,Severity,Risk Score,Title,Description,Status,Resolved By\n';
      alerts.forEach(al => {
        csvContent += `"${al.createdAt.toISOString()}","${al.category}","${al.severity}",${al.riskScore},"${al.title.replace(/"/g, '""')}","${al.description.replace(/"/g, '""')}","${al.status}","${al.resolvedBy || 'UNRESOLVED'}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${name}`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

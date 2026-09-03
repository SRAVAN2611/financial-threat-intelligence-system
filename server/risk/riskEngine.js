import Alert from '../models/Alert.js';
import RiskScore from '../models/RiskScore.js';

/**
 * Calculates current active risk matrices for a department.
 * Saves the calculation to the RiskScore collection.
 */
export const recalculateDepartmentRisk = async (departmentId) => {
  // Find all active (not resolved) alerts for the department
  const activeAlerts = await Alert.find({
    departmentId,
    status: { $in: ['NEW', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION'] },
  });

  const factors = [];
  let financialRisk = 10; // Baseline
  let securityRisk = 10;
  let behavioralRisk = 10;
  let transactionRisk = 10;

  // Track parsed weights to avoid duplicate factor stacking
  const parsedAlertCategories = new Set();

  activeAlerts.forEach((alert) => {
    const cat = alert.category;
    if (parsedAlertCategories.has(cat)) return;
    parsedAlertCategories.add(cat);

    switch (cat) {
      case 'OVERSPENDING':
        factors.push({
          factor: 'Budget Overspending',
          points: 30,
          description: 'Department expenditure exceeds total allocated budget cap.',
        });
        financialRisk += 30;
        transactionRisk += 15;
        break;

      case 'UNDER_UTILIZATION':
        factors.push({
          factor: 'Under-Utilization',
          points: 10,
          description: 'Sub-optimal burn velocity relative to remaining timeline.',
        });
        financialRisk += 10;
        break;

      case 'HIGH_VALUE_TRANSACTION':
        factors.push({
          factor: 'High-Value Outliers',
          points: 20,
          description: 'Transaction exceeds normal historical average or statutory ceilings.',
        });
        transactionRisk += 20;
        behavioralRisk += 10;
        break;

      case 'SPENDING_SPIKE':
        factors.push({
          factor: 'Spending Spike',
          points: 20,
          description: 'Sudden aggregate velocity deviance from average run rate.',
        });
        financialRisk += 20;
        transactionRisk += 10;
        break;

      case 'TRANSACTION_BURST':
        factors.push({
          factor: 'Rapid Transaction Burst',
          points: 20,
          description: 'High-velocity ledger postings within short timeframes.',
        });
        transactionRisk += 20;
        behavioralRisk += 15;
        break;

      case 'POTENTIAL_THRESHOLD_AVOIDANCE':
        factors.push({
          factor: 'Threshold Avoidance Structuring',
          points: 25,
          description: 'Multiple transfers structured just below authorization sign-off limits.',
        });
        transactionRisk += 25;
        behavioralRisk += 20;
        financialRisk += 15;
        break;

      case 'FAILED_LOGIN':
      case 'FAILED_LOGIN_BURST':
        factors.push({
          factor: 'Failed Logins Deviation',
          points: 10,
          description: 'Repeated unsuccessful authentication queries (credential threat warning).',
        });
        securityRisk += 25;
        behavioralRisk += 10;
        break;

      case 'UNAUTHORIZED_ACCESS':
      case 'UNAUTHORIZED_DEPARTMENT_ACCESS':
        factors.push({
          factor: 'Unauthorized Boundary Crossing',
          points: 20,
          description: 'Attempt to interact with restricted department data.',
        });
        securityRisk += 30;
        break;

      case 'PRIVILEGE_VIOLATION':
        factors.push({
          factor: 'Privilege Violation Attempt',
          points: 15,
          description: 'Non-authorized role attempted administrative execution.',
        });
        securityRisk += 25;
        break;

      case 'CORRELATED_THREAT':
        factors.push({
          factor: 'Multi-Vector Correlation',
          points: 15,
          description: 'Aggregated threat sequence (financial deviation + authentication errors).',
        });
        securityRisk += 20;
        financialRisk += 20;
        behavioralRisk += 20;
        break;

      default:
        break;
    }
  });

  // Cap values at 100
  financialRisk = Math.min(100, financialRisk);
  securityRisk = Math.min(100, securityRisk);
  behavioralRisk = Math.min(100, behavioralRisk);
  transactionRisk = Math.min(100, transactionRisk);

  // Overall Risk formulation: Weighted average, capped at 100
  let totalScorePoints = factors.reduce((sum, f) => sum + f.points, 0);
  let overallRisk = Math.min(100, Math.max(10, totalScorePoints));

  let riskLevel = 'LOW';
  if (overallRisk >= 81) riskLevel = 'CRITICAL';
  else if (overallRisk >= 61) riskLevel = 'HIGH';
  else if (overallRisk >= 31) riskLevel = 'MEDIUM';

  // Save/Update RiskScore document
  const scoreObj = await RiskScore.findOneAndUpdate(
    { departmentId },
    {
      departmentId,
      financialRisk,
      securityRisk,
      behavioralRisk,
      transactionRisk,
      overallRisk,
      riskLevel,
      factors,
      calculatedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  return scoreObj;
};

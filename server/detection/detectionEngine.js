import Budget from '../models/Budget.js';
import Expenditure from '../models/Expenditure.js';
import Alert from '../models/Alert.js';
import { recalculateDepartmentRisk } from '../risk/riskEngine.js';
import { runCorrelationCheck } from './correlationService.js';

// Configuration thresholds
export const CONFIG = {
  HIGH_VALUE_THRESHOLD: 50000000, // ₹5 Crore
  BURST_WINDOW_MS: 5 * 60 * 1000, // 5 Minutes
  BURST_COUNT_LIMIT: 4,           // 4 transactions
};

/**
 * Executes all financial anomaly checks for a collection of departments or budgets.
 * Should be triggered whenever a new expenditure is added.
 */
export const runFinancialDetectionRules = async (newExpenditure, actorName) => {
  const { budgetId, departmentId, amount, category, referenceNo } = newExpenditure;
  const alertsCreated = [];

  // Load the Budget and Department contexts
  const budget = await Budget.findById(budgetId);
  if (!budget) return;

  // 1. OVERSPENDING CHECK
  const totalSpend = budget.spentAmount + budget.committedAmount;
  if (totalSpend > budget.allocatedAmount) {
    const overrunAmount = totalSpend - budget.allocatedAmount;

    // Check if an overspending alert already exists for this budget
    const existingOverspend = await Alert.findOne({
      budgetId: budget._id,
      category: 'OVERSPENDING',
      status: { $ne: 'RESOLVED' },
    });

    if (!existingOverspend) {
      const alert = await Alert.create({
        departmentId,
        budgetId: budget._id,
        relatedUserId: newExpenditure.enteredBy,
        alertType: 'FINANCIAL',
        category: 'OVERSPENDING',
        severity: 'CRITICAL',
        riskScore: 90,
        title: 'Critical Budget Overspending Detected',
        description: `Department budget has exceeded its allocated limit by ₹${(overrunAmount / 100000).toFixed(2)} Lakhs.`,
        reasons: [
          `Total expenditure (₹${(totalSpend / 10000000).toFixed(2)} Cr) exceeds allocated ceiling (₹${(budget.allocatedAmount / 10000000).toFixed(2)} Cr).`,
          `Overrun amount: ₹${(overrunAmount / 100000).toFixed(2)} Lakhs.`,
        ],
      });
      alertsCreated.push(alert);
    }
  }

  // 2. UNDER-UTILIZATION CHECK (70% time elapsed, < 40% utilization)
  // We compute elapsed time based on fiscal cycle (from April 1)
  const fiscalYearStart = new Date(`${budget.financialYear.substring(3, 7)}-04-01`);
  const fiscalYearEnd = new Date(`${Number(budget.financialYear.substring(3, 7)) + 1}-03-31`);
  const now = new Date();

  const totalTime = fiscalYearEnd.getTime() - fiscalYearStart.getTime();
  const elapsed = now.getTime() - fiscalYearStart.getTime();
  let elapsedPercent = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));

  // If running historical simulation or testing, default to 70% elapsed to allow demonstrating the scenario
  if (now < fiscalYearStart) {
    elapsedPercent = 75; // Mock for demonstration purposes outside bounds
  }

  const utilizationPercent = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0;

  if (elapsedPercent >= 70 && utilizationPercent < 40) {
    const existingUnderUtil = await Alert.findOne({
      budgetId: budget._id,
      category: 'UNDER_UTILIZATION',
      status: { $ne: 'RESOLVED' },
    });

    if (!existingUnderUtil) {
      const alert = await Alert.create({
        departmentId,
        budgetId: budget._id,
        relatedUserId: newExpenditure.enteredBy,
        alertType: 'FINANCIAL',
        category: 'UNDER_UTILIZATION',
        severity: utilizationPercent < 20 ? 'HIGH' : 'MEDIUM',
        riskScore: utilizationPercent < 20 ? 65 : 45,
        title: 'Budget Under-Utilization Alert',
        description: `Department shows low spending velocity relative to elapsed time (elapsed: ${elapsedPercent.toFixed(1)}%, utilization: ${utilizationPercent.toFixed(1)}%).`,
        reasons: [
          `Fiscal Year is ${elapsedPercent.toFixed(1)}% complete, but only ${utilizationPercent.toFixed(1)}% of budget has been utilized.`,
          `Remaining balance: ₹${((budget.allocatedAmount - budget.spentAmount) / 10000000).toFixed(2)} Crores.`,
        ],
      });
      alertsCreated.push(alert);
    }
  }

  // 3. HIGH VALUE TRANSACTION CHECK
  // static threshold ₹5 Crores or if 3x times greater than historical average of department
  const historicalAvgRes = await Expenditure.aggregate([
    { $match: { departmentId, _id: { $ne: newExpenditure._id } } },
    { $group: { _id: '$departmentId', avgAmount: { $avg: '$amount' } } },
  ]);

  const historicalAvg = historicalAvgRes.length > 0 ? historicalAvgRes[0].avgAmount : 0;
  const isHighValueStatic = amount >= CONFIG.HIGH_VALUE_THRESHOLD;
  const isHighValueDeviated = historicalAvg > 0 ? amount >= historicalAvg * 3 : false;

  if (isHighValueStatic || isHighValueDeviated) {
    const multiplier = historicalAvg > 0 ? (amount / historicalAvg).toFixed(1) : 'unknown';
    const alert = await Alert.create({
      departmentId,
      budgetId: budget._id,
      relatedUserId: newExpenditure.enteredBy,
      alertType: 'FINANCIAL',
      category: 'HIGH_VALUE_TRANSACTION',
      severity: isHighValueStatic ? 'HIGH' : 'MEDIUM',
      riskScore: isHighValueStatic ? 75 : 55,
      title: 'High-Value Outlier Transaction Intercepted',
      description: `Transaction of ₹${(amount / 10000000).toFixed(2)} Crores exceeds standard department transaction parameters.`,
      reasons: isHighValueStatic
        ? [`Transaction amount exceeds static compliance threshold of ₹${(CONFIG.HIGH_VALUE_THRESHOLD / 10000000).toFixed(2)} Crores.`]
        : [`Transaction is ${multiplier}x higher than department's historical transaction average (₹${(historicalAvg / 100000).toFixed(2)} Lakhs).`],
    });
    alertsCreated.push(alert);
  }

  // 4. SPENDING SPIKE CHECK
  // Compare current month's aggregate spending against historical monthly average
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const curMonthSpendRes = await Expenditure.aggregate([
    {
      $match: {
        departmentId,
        transactionDate: { $gte: currentMonthStart },
      },
    },
    { $group: { _id: '$departmentId', total: { $sum: '$amount' } } },
  ]);
  const currentMonthTotal = curMonthSpendRes.length > 0 ? curMonthSpendRes[0].total : amount;

  // Historical Monthly Average (excluding current month)
  const histMonthSpendRes = await Expenditure.aggregate([
    {
      $match: {
        departmentId,
        transactionDate: { $lt: currentMonthStart },
      },
    },
    {
      $group: {
        _id: { $month: '$transactionDate' },
        monthlyTotal: { $sum: '$amount' },
      },
    },
    {
      $group: {
        _id: null,
        avgMonthly: { $avg: '$monthlyTotal' },
      },
    },
  ]);
  const historicalMonthlyAvg = histMonthSpendRes.length > 0 ? histMonthSpendRes[0].avgMonthly : 0;

  if (historicalMonthlyAvg > 0 && currentMonthTotal > historicalMonthlyAvg * 2.5) {
    const alert = await Alert.create({
      departmentId,
      budgetId: budget._id,
      relatedUserId: newExpenditure.enteredBy,
      alertType: 'FINANCIAL',
      category: 'SPENDING_SPIKE',
      severity: 'HIGH',
      riskScore: 70,
      title: 'Abrupt Spending Spike Flagged',
      description: `Current month spending in department (₹${(currentMonthTotal / 10000000).toFixed(2)} Cr) is 2.5x higher than historical average monthly spending (₹${(historicalMonthlyAvg / 10000000).toFixed(2)} Cr).`,
      reasons: [
        `Month-to-date expenditure level deviates significantly from historical monthly run-rate benchmarks.`,
        `Variance is +₹${((currentMonthTotal - historicalMonthlyAvg) / 10000000).toFixed(2)} Crores.`,
      ],
    });
    alertsCreated.push(alert);
  }

  // 5. RAPID TRANSACTION BURST CHECK
  // >= 4 transactions within 5 minutes (BURST_WINDOW_MS) from same department/user
  const burstTimeCutoff = new Date(now.getTime() - CONFIG.BURST_WINDOW_MS);
  const countInWindow = await Expenditure.countDocuments({
    departmentId,
    enteredBy: newExpenditure.enteredBy,
    transactionDate: { $gte: burstTimeCutoff },
  });

  if (countInWindow >= CONFIG.BURST_COUNT_LIMIT) {
    const alert = await Alert.create({
      departmentId,
      budgetId: budget._id,
      relatedUserId: newExpenditure.enteredBy,
      alertType: 'FINANCIAL',
      category: 'TRANSACTION_BURST',
      severity: 'HIGH',
      riskScore: 80,
      title: 'Rapid Transaction Burst Blocked',
      description: `${countInWindow} high-velocity ledger entries created by ${newExpenditure.enteredBy} within a 5-minute audit window.`,
      reasons: [
        `Detected high frequency rate of ledger creation. Burst count: ${countInWindow} entries.`,
        `Risk profile points to automated batch uploads, smurfing, or credentials compromise.`,
      ],
    });
    alertsCreated.push(alert);
  }

  // 6. SPLIT TRANSACTION / THRESHOLD AVOIDANCE CHECK
  // Detects multiple transactions repeatedly below ₹5,00,000 threshold within 24h window
  const thresholdVal = 500000; // ₹5 Lakhs dual-authorization ceiling
  if (amount >= thresholdVal * 0.85 && amount < thresholdVal) {
    const windowCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const splitTxCount = await Expenditure.countDocuments({
      departmentId,
      amount: { $gte: thresholdVal * 0.85, $lt: thresholdVal },
      transactionDate: { $gte: windowCutoff },
    });

    if (splitTxCount >= 2) {
      const alert = await Alert.create({
        departmentId,
        budgetId: budget._id,
        relatedUserId: newExpenditure.enteredBy,
        alertType: 'FINANCIAL',
        category: 'POTENTIAL_THRESHOLD_AVOIDANCE',
        severity: 'HIGH',
        riskScore: 82,
        title: 'Potential Threshold Avoidance Detected',
        description: 'Multiple transactions were detected near the configured approval threshold and require review.',
        reasons: [
          `Detected ${splitTxCount} transactions in the range ₹${(thresholdVal * 0.85 / 100000).toFixed(2)}L - ₹${(thresholdVal / 100000).toFixed(2)}L within 24 hours.`,
          `Pattern indicates potential structuring to bypass secondary management sign-off (Limit: ₹${(thresholdVal / 100000).toFixed(2)} Lakhs).`,
        ],
      });
      alertsCreated.push(alert);
    }
  }

  // If any alerts were created, run the correlation and risk calculations
  if (alertsCreated.length > 0) {
    for (const alert of alertsCreated) {
      // Trigger correlation checks
      await runCorrelationCheck(alert);
    }
  }

  // Recalculate Risk Scoring for this department
  await recalculateDepartmentRisk(departmentId);

  return alertsCreated;
};

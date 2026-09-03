import Budget from '../models/Budget.js';

export const runSimulation = async (req, res) => {
  const { departmentId, proposedBudget, projectedSpent, simulatedAlerts = [] } = req.body;

  try {
    const budget = await Budget.findOne({ departmentId: departmentId.toUpperCase(), financialYear: 'FY 2026–27' });
    if (!budget) {
      return res.status(404).json({ success: false, message: `Active budget not found for department ${departmentId}` });
    }

    const currentSpent = budget.spentAmount;
    const finalBudget = Number(proposedBudget) || budget.allocatedAmount;
    const finalSpent = Number(projectedSpent) || currentSpent;

    const utilization = finalBudget > 0 ? (finalSpent / finalBudget) * 100 : 0;

    let riskImpactPoints = 0;
    const details = [];

    // Calculate simulated budget overrun
    if (finalSpent > finalBudget) {
      riskImpactPoints += 40;
      details.push('Overrun boundary breach (+40 Risk Points)');
    } else if (utilization >= 90) {
      riskImpactPoints += 15;
      details.push('High utilization stress zone (+15 Risk Points)');
    } else if (utilization < 25) {
      riskImpactPoints += 10;
      details.push('Severely under-utilized allocation profile (+10 Risk Points)');
    }

    // Stack simulated alerts
    if (simulatedAlerts.includes('FAILED_LOGINS')) {
      riskImpactPoints += 15;
      details.push('Simulated failed logins sequence (+15 Risk Points)');
    }
    if (simulatedAlerts.includes('HIGH_VALUE')) {
      riskImpactPoints += 20;
      details.push('Simulated high-value transaction spike (+20 Risk Points)');
    }

    let projectedLevel = 'LOW';
    const finalRisk = Math.min(100, Math.max(10, riskImpactPoints + 15)); // baseline + impact

    if (finalRisk >= 81) projectedLevel = 'CRITICAL';
    else if (finalRisk >= 61) projectedLevel = 'HIGH';
    else if (finalRisk >= 31) projectedLevel = 'MEDIUM';

    res.json({
      success: true,
      simulation: {
        departmentId,
        currentAllocation: budget.allocatedAmount,
        simulatedAllocation: finalBudget,
        currentSpent,
        simulatedSpent: finalSpent,
        projectedUtilization: Number(utilization.toFixed(1)),
        priorRiskScore: 25, // default baseline
        projectedRiskScore: finalRisk,
        projectedRiskLevel: projectedLevel,
        stressStatus: finalSpent > finalBudget ? 'CRITICAL' : utilization >= 90 ? 'WARNING' : 'STABLE',
        explanation: `Proposed allocation limit reconfigures utilization to ${utilization.toFixed(1)}%. Risk factors: ${details.join(', ') || 'No critical factors active'}.`,
        mitigationRecomm: finalSpent > finalBudget
          ? 'Urgent: Supplement funding or defer operational purchases to avoid compliance overruns.'
          : utilization >= 90
          ? 'Notice: Dynamic warning state. Monitor monthly transactions to prevent caps breach.'
          : 'Stable: Allocation profile fits forecast limits. Review periodic spending quarterly.',
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

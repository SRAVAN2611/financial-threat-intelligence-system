import Alert from '../models/Alert.js';
import SecurityEvent from '../models/SecurityEvent.js';
import AuditLog from '../models/AuditLog.js';

const CORRELATION_WINDOW_MS = 15 * 60 * 1000; // 15 Minutes

/**
 * Checks for correlation between financial events and security alerts/events.
 * Creates a correlated alert if anomalous chains are identified.
 */
export const runCorrelationCheck = async (newAlert) => {
  const cutoffTime = new Date(newAlert.createdAt.getTime() - CORRELATION_WINDOW_MS);

  // 1. Find recent security exceptions / access events in this department or by this user
  const recentSecurityEvents = await SecurityEvent.find({
    $and: [
      { timestamp: { $gte: cutoffTime, $lte: newAlert.createdAt } },
      {
        $or: [
          { departmentId: newAlert.departmentId },
          { userId: newAlert.relatedUserId },
        ]
      },
      {
        eventType: {
          $in: [
            'UNAUTHORIZED_ACCESS',
            'UNAUTHORIZED_API_REQUEST',
            'PRIVILEGE_VIOLATION',
            'FAILED_LOGIN',
            'INVALID_TOKEN_ATTEMPT'
          ]
        }
      }
    ]
  });

  // 2. Find recent budget modifications in this department from Audit Logs
  const recentBudgetEdits = await AuditLog.find({
    timestamp: { $gte: cutoffTime, $lte: newAlert.createdAt },
    entityType: 'BUDGET',
    action: { $in: ['BUDGET_ALLOCATION_RECONFIGURED', 'MODIFY_BUDGET', 'BUDGET_CREATED'] }
  });

  // 3. Determine if correlation exists
  if (recentSecurityEvents.length > 0 || recentBudgetEdits.length > 0) {
    // Check if we already created a correlated alert recently to avoid duplication spikes
    const existingCorrelated = await Alert.findOne({
      departmentId: newAlert.departmentId,
      category: 'CORRELATED_THREAT',
      status: { $ne: 'RESOLVED' },
      createdAt: { $gte: cutoffTime }
    });

    if (!existingCorrelated) {
      const securityDetails = recentSecurityEvents.map(e => `${e.eventType} on ${e.resource} (${e.result})`);
      const auditDetails = recentBudgetEdits.map(a => `${a.action} by ${a.userId}: ${a.details}`);

      const alertReasons = [
        `High-risk financial alert '${newAlert.title}' occurred inside a 15-minute correlation window.`,
        ...securityDetails.map(d => `Security deviation: ${d}`),
        ...auditDetails.map(d => `Audit modification: ${d}`),
      ];

      // Explainable AI Insights compilation
      const alert = await Alert.create({
        departmentId: newAlert.departmentId,
        budgetId: newAlert.budgetId,
        relatedUserId: newAlert.relatedUserId,
        alertType: 'CORRELATED',
        category: 'CORRELATED_THREAT',
        severity: 'CRITICAL',
        riskScore: 95,
        title: 'Multi-Vector Financial & Security Correlation Detected',
        description: `Correlated chain flagged: Security access anomalies or configuration modifications followed by a high-value financial exception outline.`,
        reasons: alertReasons.slice(0, 5), // Keep it clean and concise
      });

      return alert;
    }
  }

  return null;
};

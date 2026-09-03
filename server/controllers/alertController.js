import Alert from '../models/Alert.js';
import AuditLog from '../models/AuditLog.js';
import { recalculateDepartmentRisk } from '../risk/riskEngine.js';

export const getAlerts = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'DEPARTMENT_HEAD') {
      filter.departmentId = req.user.departmentId;
    }

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });

    const liveThreats = alerts.map((al) => ({
      id: al._id.toString(),
      timestamp: al.createdAt.toISOString(),
      title: al.title,
      category: al.category,
      severity: al.severity,
      amount: al.riskScore * 100000,
      department: al.departmentId === 'ENG-01' ? 'Engineering & Infrastructure' :
                  al.departmentId === 'FIN-04' ? 'Finance & Treasury Management' :
                  al.departmentId === 'MKT-02' ? 'Global Marketing & Brand Growth' :
                  al.departmentId === 'OPS-03' ? 'Corporate Operations & Logistics' :
                  al.departmentId === 'SEC-05' ? 'Cybersecurity & Internal Controls' :
                  al.departmentId === 'HR-06' ? 'People Operations & Talent Acquisition' : al.departmentId,
      referenceNo: al.resolvedBy || 'ALERT-' + al._id.toString().substring(18),
      status: al.status === 'NEW' ? 'FLAGGED' : al.status === 'RESOLVED' ? 'APPROVED' : 'UNDER_REVIEW',
      aiExplanation: al.description,
    }));

    res.json({ success: true, alerts, liveThreats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert details not found.' });

    if (req.user.role === 'DEPARTMENT_HEAD' && alert.departmentId !== req.user.departmentId) {
      return res.status(403).json({ success: false, message: 'Access Denied: Restricted department boundary.' });
    }

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAlertStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resolvedBy } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert object not found.' });

    if (req.user.role === 'DEPARTMENT_HEAD' && alert.departmentId !== req.user.departmentId) {
      return res.status(403).json({ success: false, message: 'Forbidden boundary.' });
    }

    const oldStatus = alert.status;
    alert.status = status;

    if (status === 'RESOLVED' || status === 'FALSE_POSITIVE' || status === 'APPROVED') {
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy || req.user.email;
    }

    await alert.save();

    await recalculateDepartmentRisk(alert.departmentId);

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'ALERT_STATUS_UPDATE',
      entityType: 'ALERT',
      entityId: alert._id.toString(),
      oldValue: { status: oldStatus },
      newValue: { status },
      details: `Alert '${alert.title}' status changed from ${oldStatus} to ${status}. Updated by ${req.user.name}.`,
      ipAddress,
      immutableHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      status: status === 'RESOLVED' ? 'SUCCESS' : 'WARNING',
    });

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Handles internal risk actions on an alert (REQUIRES_INVESTIGATION, ESCALATED, RISK_ACTION_HOLD, RESOLVED, FALSE_POSITIVE)
 */
export const executeAlertAction = async (req, res) => {
  const { id } = req.params;
  const { action, justification } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert object not found.' });

    const validActions = ['REQUIRES_INVESTIGATION', 'ESCALATED', 'RISK_ACTION_HOLD', 'RESOLVED', 'FALSE_POSITIVE'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: `Invalid risk action: ${action}. Allowed: ${validActions.join(', ')}` });
    }

    const oldStatus = alert.status;
    alert.status = action === 'RESOLVED' || action === 'FALSE_POSITIVE' ? 'RESOLVED' : 'IN_PROGRESS';
    alert.actionTaken = action;
    alert.justification = justification || 'Risk action updated by authorized officer.';

    if (action === 'RESOLVED' || action === 'FALSE_POSITIVE') {
      alert.resolvedAt = new Date();
      alert.resolvedBy = req.user.email;
    }

    await alert.save();
    await recalculateDepartmentRisk(alert.departmentId);

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: `ALERT_RISK_ACTION_${action}`,
      entityType: 'ALERT',
      entityId: alert._id.toString(),
      oldValue: { status: oldStatus },
      newValue: { status: alert.status, action },
      details: `Executed risk action '${action}' on alert '${alert.title}'. Justification: ${justification || 'N/A'}`,
      ipAddress,
      immutableHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      status: action === 'RESOLVED' ? 'SUCCESS' : 'WARNING',
    });

    res.json({ success: true, alert, actionExecuted: action });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

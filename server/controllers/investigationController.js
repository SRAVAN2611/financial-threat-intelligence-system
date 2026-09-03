import Investigation from '../models/Investigation.js';
import Alert from '../models/Alert.js';
import AuditLog from '../models/AuditLog.js';

export const getInvestigations = async (req, res) => {
  try {
    const list = await Investigation.find({}).populate('alertId').sort({ updatedAt: -1 });
    res.json({ success: true, investigations: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvestigationByAlertId = async (req, res) => {
  const { alertId } = req.params;
  try {
    let inv = await Investigation.findOne({ alertId }).populate('alertId');
    if (!inv) {
      // Lazy auto-create if an investigator tries to view notes for a flagged alert.
      const alert = await Alert.findById(alertId);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Source Alert not found.' });
      }

      inv = await Investigation.create({
        alertId,
        investigatorId: req.user.email,
        status: alert.status,
        notes: [],
        evidence: [],
        decision: '',
      });
      inv = await Investigation.findById(inv._id).populate('alertId');
    }

    res.json({ success: true, investigation: inv });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addNoteToInvestigation = async (req, res) => {
  const { alertId } = req.params;
  const { note } = req.body;

  try {
    const inv = await Investigation.findOne({ alertId });
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Investigation ledger not found.' });
    }

    inv.notes.push({
      author: req.user.name,
      note,
      timestamp: new Date(),
    });

    await inv.save();
    res.json({ success: true, investigation: inv });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveInvestigation = async (req, res) => {
  const { alertId } = req.params;
  const { status, decision, evidence } = req.body; // status: RESOLVED or FALSE_POSITIVE
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const inv = await Investigation.findOne({ alertId });
    if (!inv) return res.status(404).json({ success: false, message: 'Investigation details not found.' });

    // Update alert status
    const alert = await Alert.findById(alertId);
    if (alert) {
      alert.status = status;
      alert.resolvedAt = new Date();
      alert.resolvedBy = req.user.email;
      await alert.save();
    }

    inv.status = status;
    inv.decision = decision;
    if (evidence) {
      inv.evidence = Array.isArray(evidence) ? evidence : [evidence];
    }
    await inv.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'INVESTIGATION_RESOLVED',
      entityType: 'INVESTIGATION',
      entityId: inv._id.toString(),
      newValue: { status, decision },
      details: `Resolved alert incident. Status of threat: ${status}. Ruling: ${decision}`,
      ipAddress,
      immutableHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      status: 'SUCCESS',
    });

    res.json({ success: true, investigation: inv });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

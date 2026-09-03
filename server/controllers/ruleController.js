import AIRule from '../models/AIRule.js';
import AuditLog from '../models/AuditLog.js';

export const getRules = async (req, res) => {
  try {
    const rules = await AIRule.find({}).sort({ createdAt: -1 });
    const formatted = rules.map((r) => ({
      id: r._id.toString(),
      code: r.code,
      name: r.name,
      description: r.description,
      category: r.category,
      condition: r.condition,
      threshold: r.threshold,
      severity: r.severity,
      action: r.action,
      riskWeight: r.riskWeight,
      enabled: r.enabled,
      triggerCount24h: r.triggerCount24h,
      lastTriggered: r.lastTriggered,
      createdAt: r.createdAt.toISOString().split('T')[0],
      createdBy: r.createdBy,
    }));

    res.json({ success: true, rules: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRule = async (req, res) => {
  const { name, code, description, category, condition, threshold, severity, action, riskWeight } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const ruleCode = code || `RULE-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`;

    const rule = await AIRule.create({
      code: ruleCode,
      name,
      description,
      category: category || 'FINANCIAL',
      condition,
      threshold: threshold || 'Configured',
      severity: severity || 'HIGH',
      action: action || 'QUARANTINE_TRANSFERS',
      riskWeight: riskWeight ? Number(riskWeight) : 20,
      enabled: true,
      createdBy: `${req.user.name} (${req.user.role})`,
    });

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'CUSTOM_RULE_CREATED',
      entityType: 'RULE',
      entityId: rule.code,
      newValue: { name: rule.name, severity: rule.severity },
      details: `Created custom detection rule "${rule.name}" (${rule.code}).`,
      ipAddress,
      immutableHash: `0x${Date.now().toString(16)}`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      rule: {
        id: rule._id.toString(),
        code: rule.code,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        condition: rule.condition,
        threshold: rule.threshold,
        severity: rule.severity,
        action: rule.action,
        riskWeight: rule.riskWeight,
        enabled: rule.enabled,
        triggerCount24h: 0,
        lastTriggered: 'Never',
        createdAt: rule.createdAt.toISOString().split('T')[0],
        createdBy: rule.createdBy,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleRule = async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const rule = await AIRule.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { code: id }],
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'AI Threat Rule not found' });
    }

    rule.enabled = Boolean(enabled);
    await rule.save();

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: enabled ? 'RULE_ACTIVATED' : 'RULE_DEACTIVATED',
      entityType: 'RULE',
      entityId: rule.code,
      details: `Rule "${rule.name}" (${rule.code}) ${enabled ? 'enabled' : 'disabled'} by ${req.user.name}.`,
      ipAddress,
      immutableHash: `0x${Date.now().toString(16)}`,
      status: enabled ? 'SUCCESS' : 'WARNING',
    });

    res.json({
      success: true,
      rule: {
        id: rule._id.toString(),
        code: rule.code,
        name: rule.name,
        enabled: rule.enabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

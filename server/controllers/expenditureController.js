import crypto from 'crypto';
import Expenditure from '../models/Expenditure.js';
import Budget from '../models/Budget.js';
import AuditLog from '../models/AuditLog.js';
import { runFinancialDetectionRules } from '../detection/detectionEngine.js';

export const getExpenditures = async (req, res) => {
  const {
    search,
    department,
    riskLevel,
    status,
    minAmount,
    maxAmount,
    page = 1,
    pageSize = 10,
    sortBy = 'transactionDate',
    sortOrder = 'desc',
  } = req.query;

  try {
    const filter = {};

    // RBAC: Department Heads are locked to their own departments
    if (req.user.role === 'DEPARTMENT_HEAD') {
      filter.departmentId = req.user.departmentId;
    } else if (department && department !== 'ALL') {
      filter.departmentId = department;
    }

    // Apply Search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { referenceNo: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { enteredBy: searchRegex },
        { destinationAccount: searchRegex },
        { sha256Hash: searchRegex },
      ];
    }

    // Apply Risk Level
    if (riskLevel && riskLevel !== 'ALL') {
      filter.riskLevel = riskLevel;
    }

    // Apply Status
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    // Apply Amount Filters
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    const total = await Expenditure.countDocuments(filter);
    const countStatus = await Expenditure.aggregate([
      { $match: { departmentId: filter.departmentId || { $exists: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const flaggedCount = countStatus.find(s => s._id === 'FLAGGED')?.count || 0;
    const quarantinedCount = countStatus.find(s => s._id === 'QUARANTINED')?.count || 0;

    const sumRes = await Expenditure.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = sumRes.length > 0 ? sumRes[0].total : 0;

    // Apply Sorting & Pagination
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const limit = Number(pageSize);
    const skip = (Number(page) - 1) * limit;

    const expenditures = await Expenditure.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Flatten to format matching frontend's Transaction structure
    const transactions = expenditures.map((exp) => ({
      id: exp._id.toString(),
      referenceNo: exp.referenceNo,
      timestamp: exp.transactionDate.toISOString(),
      fiscalYear: 'FY 2026–27',
      quarter: 'Q2',
      department: exp.departmentId === 'ENG-01' ? 'Engineering & Infrastructure' :
                  exp.departmentId === 'FIN-04' ? 'Finance & Treasury Management' :
                  exp.departmentId === 'MKT-02' ? 'Global Marketing & Brand Growth' :
                  exp.departmentId === 'OPS-03' ? 'Corporate Operations & Logistics' :
                  exp.departmentId === 'SEC-05' ? 'Cybersecurity & Internal Controls' :
                  exp.departmentId === 'HR-06' ? 'People Operations & Talent Acquisition' : exp.departmentId,
      departmentCode: exp.departmentId,
      vendorId: exp.documentReference,
      vendorName: exp.description.split(' - ')[0] || 'Unknown vendor',
      vendorCategory: exp.category,
      amount: exp.amount,
      currency: 'INR',
      category: exp.category,
      status: exp.status,
      riskScore: exp.riskScore,
      riskLevel: exp.riskLevel,
      threatCategory: exp.threatCategory,
      threatFlags: exp.threatFlags,
      approver: 'Internal Clearance',
      paymentMethod: exp.paymentMethod,
      destinationAccount: exp.destinationAccount,
      originatingAccount: exp.originatingAccount,
      sha256Hash: exp.sha256Hash,
      aiForensicSummary: exp.aiForensicSummary,
      confidenceScore: exp.confidenceScore,
      shapFactors: exp.shapFactors,
      auditTrail: exp.auditTrail,
      forensicNotes: exp.forensicNotes,
      isFlaggedBySentinel: exp.status === 'FLAGGED' || exp.status === 'QUARANTINED',
    }));

    res.json({
      success: true,
      transactions,
      total,
      flaggedCount,
      quarantinedCount,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpenditure = async (req, res) => {
  const { amount, category, description, transactionDate, documentReference, departmentId, destinationAccount } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  // 1. Basic validators
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Expenditure amount must be value greater than 0.' });
  }

  try {
    const formattedDept = departmentId.toUpperCase().trim();

    // 2. Locate Active Budget matching department and category (or general budget if category budget not segmented)
    let budget = await Budget.findOne({ departmentId: formattedDept, category, status: 'active' });
    if (!budget) {
      // Find fallback general budget of dept
      budget = await Budget.findOne({ departmentId: formattedDept, status: 'active' });
    }

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `No active budget allocation found for department ${formattedDept}. Budgets must be created by an Admin first.`,
      });
    }

    // 3. Department Head boundary checking
    if (req.user.role === 'DEPARTMENT_HEAD' && req.user.departmentId !== formattedDept) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: As Department Head, you are restricted to creating expenditures in your own department (${req.user.departmentId}).`,
      });
    }

    // Generate unique metadata
    const cleanDate = transactionDate ? new Date(transactionDate) : new Date();
    if (isNaN(cleanDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid transaction date specified.' });
    }

    const uniqueSuffix = Math.floor(10000 + Math.random() * 90000);
    const dateFormatted = cleanDate.toISOString().replace(/[-T]/g, '').substring(0, 8);
    const referenceNo = `TXN-${cleanDate.getFullYear()}-${dateFormatted.substring(4, 8)}-${uniqueSuffix}`;

    const sha256Hash = crypto.createHash('sha256')
      .update(referenceNo + amount + cleanDate.toISOString())
      .digest('hex');

    const destAcc = destinationAccount || `acc_inr_${crypto.randomBytes(4).toString('hex')}`;
    const origAcc = `acc_inr_${formattedDept.toLowerCase()}_clearing`;

    // 4. Initial Anomaly scoring heuristics
    let initialRiskScore = 15; // default baseline
    let initialRiskLevel = 'LOW';
    let status = 'APPROVED';
    let threatCategory = '';
    const threatFlags = [];
    const shapFactors = [];
    let aiForensicSummary = 'Regular operational expense within forecast model bounds.';

    // Simple heuristic-check before actual validation loop:
    if (amount > 10000000) { // Large sum ₹1 Crore
      initialRiskScore = 65;
      initialRiskLevel = 'HIGH';
      threatFlags.push('HIGH_VALUE_THRESHOLD');
      aiForensicSummary = 'High-value outlier ledger posting. Triggered approval reviews.';
    }

    // 5. Save expenditure record
    const expenditure = await Expenditure.create({
      budgetId: budget._id,
      departmentId: formattedDept,
      amount: Number(amount),
      category,
      description,
      transactionDate: cleanDate,
      documentReference,
      enteredBy: req.user.email,
      status,
      referenceNo,
      riskScore: initialRiskScore,
      riskLevel: initialRiskLevel,
      threatCategory,
      threatFlags,
      paymentMethod: 'WIRE_TRANSFER',
      destinationAccount: destAcc,
      originatingAccount: origAcc,
      sha256Hash,
      aiForensicSummary,
      confidenceScore: 98,
      shapFactors,
      forensicNotes: [`[${new Date().toLocaleTimeString()}] Record created by ${req.user.name}`],
      auditTrail: [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date(),
          actor: req.user.name,
          action: 'EXPENDITURE_UPLOADED',
          details: `Expenditure record created with reference ${referenceNo}`,
          hash: `0x${sha256Hash.substring(0, 40)}`,
        }
      ]
    });

    // 6. Update budget spending aggregate sum
    budget.spentAmount += Number(amount);
    await budget.save();

    // 7. Run real-time detection & correlation pipelines
    const triggeredAlerts = await runFinancialDetectionRules(expenditure, req.user.name);

    if (triggeredAlerts && triggeredAlerts.length > 0) {
      // Modify risk profile of the transaction based on triggered alerts
      const maxAlert = triggeredAlerts.reduce((prev, current) => (prev.riskScore > current.riskScore) ? prev : current);

      expenditure.status = maxAlert.severity === 'CRITICAL' ? 'QUARANTINED' : 'FLAGGED';
      expenditure.riskScore = maxAlert.riskScore;
      expenditure.riskLevel = maxAlert.severity;
      expenditure.threatCategory = maxAlert.category;
      expenditure.threatFlags = triggeredAlerts.map(a => a.category);
      expenditure.aiForensicSummary = `${maxAlert.title}. Flagged reason: ${maxAlert.description}`;

      // Populate SHAP factors
      expenditure.shapFactors = triggeredAlerts.map(alt => ({
        feature: alt.category,
        weight: alt.riskScore / 100,
        description: alt.description,
        value: amount,
      }));

      await expenditure.save();
    }

    // 8. Audit Log
    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'CREATE_EXPENDITURE',
      entityType: 'EXPENDITURE',
      entityId: expenditure._id.toString(),
      newValue: { amount: Number(amount), category, referenceNo },
      details: `Created expenditure of ₹${(amount).toLocaleString()} INR in department ${formattedDept}. Reference: ${referenceNo}`,
      ipAddress,
      immutableHash: `0x${sha256Hash.substring(5, 45)}`,
      status: expenditure.status === 'QUARANTINED' ? 'CRITICAL' : 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      transaction: {
        id: expenditure._id.toString(),
        referenceNo: expenditure.referenceNo,
        amount: expenditure.amount,
        status: expenditure.status,
        riskScore: expenditure.riskScore,
        riskLevel: expenditure.riskLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpenditureStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus, reason } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const exp = await Expenditure.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { referenceNo: id }] });
    if (!exp) {
      return res.status(404).json({ success: false, message: 'Transaction record not found.' });
    }

    const oldStatus = exp.status;
    exp.status = newStatus;

    // Append forensic notes and audit trail subdocuments
    exp.forensicNotes.unshift(`[${new Date().toLocaleString()}] Status updated from ${oldStatus} to ${newStatus} by ${req.user.name}. Reason: ${reason}`);
    exp.auditTrail.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date(),
      actor: req.user.name,
      action: `STATUS_ALTERED_TO_${newStatus}`,
      details: reason || 'Manually updated status',
      hash: `0x${crypto.randomBytes(20).toString('hex')}`,
    });

    await exp.save();

    // Create system-wide audit log
    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'MODIFY_EXPENDITURE_STATUS',
      entityType: 'EXPENDITURE',
      entityId: exp._id.toString(),
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      details: `Transaction ${exp.referenceNo} status altered from ${oldStatus} to ${newStatus}. Reason: ${reason}`,
      ipAddress,
      immutableHash: `0x${crypto.randomBytes(20).toString('hex')}`,
      status: newStatus === 'QUARANTINED' ? 'CRITICAL' : 'SUCCESS',
    });

    res.json({ success: true, message: `Transaction status altered successfully.`, transaction: exp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addForensicNote = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const exp = await Expenditure.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { referenceNo: id }] });
    if (!exp) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const timestamp = new Date().toLocaleString();
    exp.forensicNotes.unshift(`[${timestamp}] (${req.user.name}): ${note}`);
    await exp.save();

    res.json({ success: true, transaction: exp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const batchQuarantine = async (req, res) => {
  const { ids, reason } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const result = await Expenditure.updateMany(
      { referenceNo: { $in: ids } },
      {
        $set: { status: 'QUARANTINED' },
        $push: {
          forensicNotes: {
            $each: [`[${new Date().toLocaleTimeString()}] Batch quarantined by ${req.user.name}: ${reason}`],
            $position: 0,
          },
        },
      }
    );

    // Create Audit Log
    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'BATCH_QUARANTINE_ENFORCED',
      entityType: 'EXPENDITURE',
      entityId: `${result.modifiedCount} items`,
      newValue: { status: 'QUARANTINED' },
      details: `Bulk quarantine applied to ${result.modifiedCount} transactions. Reason: ${reason}`,
      ipAddress,
      immutableHash: `0x${crypto.randomBytes(20).toString('hex')}`,
      status: 'CRITICAL',
    });

    res.json({ success: true, count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

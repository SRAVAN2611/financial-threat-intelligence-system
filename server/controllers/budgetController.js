import Budget from '../models/Budget.js';
import Department from '../models/Department.js';
import AuditLog from '../models/AuditLog.js';
import { recalculateDepartmentRisk } from '../risk/riskEngine.js';

export const getBudgets = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'DEPARTMENT_HEAD') {
      filter.departmentId = req.user.departmentId;
    }

    const budgets = await Budget.find(filter);
    res.json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget cap not found.' });
    }

    if (req.user.role === 'DEPARTMENT_HEAD' && budget.departmentId !== req.user.departmentId) {
      return res.status(403).json({ success: false, message: 'Not authorized: Outside boundary department.' });
    }

    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBudget = async (req, res) => {
  const { departmentId, financialYear, allocatedAmount, category } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    // Audit check if department exists
    const dept = await Department.findOne({ code: departmentId });
    if (!dept) {
      return res.status(404).json({ success: false, message: `Department code ${departmentId} does not exist.` });
    }

    const budget = await Budget.create({
      departmentId,
      financialYear,
      allocatedAmount,
      category,
      createdBy: req.user.email,
      status: 'active',
    });

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'BUDGET_CREATED',
      entityType: 'BUDGET',
      entityId: budget._id.toString(),
      newValue: { allocatedAmount, financialYear, category },
      details: `Created budget for ${departmentId} (${financialYear}) with allocated sum: ₹${(allocatedAmount).toLocaleString()} INR`,
      ipAddress,
      immutableHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.code === 11000
        ? 'Duplicate allocation category/financial year for this department.'
        : error.message,
    });
  }
};

export const adjustBudget = async (req, res) => {
  const { departmentId } = req.params; // Using department code e.g. ENG-01
  const { newAllocation, reason } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    // Find active budget for department (defaults to FY 2026–27)
    const budget = await Budget.findOne({ departmentId: departmentId.toUpperCase(), financialYear: 'FY 2026–27' });
    if (!budget) {
      return res.status(404).json({ success: false, message: `Active budget not found for department ${departmentId}` });
    }

    // Save trace values
    const oldAllocation = budget.allocatedAmount;

    budget.allocatedAmount = Number(newAllocation);
    budget.updatedBy = req.user.email;
    await budget.save();

    // Recalculate utilization, burn rate changes etc. (handled in frontend aggregates, backend recalculates risk if needed)
    await recalculateDepartmentRisk(departmentId);

    // Audit trace logging
    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'BUDGET_ALLOCATION_RECONFIGURED',
      entityType: 'BUDGET',
      entityId: budget._id.toString(),
      oldValue: { allocatedAmount: oldAllocation },
      newValue: { allocatedAmount: newAllocation },
      details: `Reconfigured ${departmentId} allocation from ₹${(oldAllocation).toLocaleString()} to ₹${(newAllocation).toLocaleString()}. Justification: ${reason}`,
      ipAddress,
      immutableHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      budget,
      oldAlloc: oldAllocation,
      newAlloc: newAllocation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

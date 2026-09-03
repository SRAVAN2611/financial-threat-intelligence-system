import Department from '../models/Department.js';
import Budget from '../models/Budget.js';

export const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find({}).sort({ code: 1 });
    const budgets = await Budget.find({});

    const formatted = depts.map((d) => {
      const b = budgets.find((b) => b.departmentId === d.code) || {};
      const allocated = b.allocatedAmount || 0;
      const spent = b.spentAmount || 0;
      const committed = b.committedAmount || 0;
      const remaining = allocated - spent - committed;
      const burnRatePercent = allocated > 0 ? Number(((spent / allocated) * 100).toFixed(1)) : 0;

      return {
        id: d._id.toString(),
        code: d.code,
        name: d.name,
        head: d.head,
        headEmail: d.headEmail,
        allocated,
        spent,
        committed,
        remaining,
        burnRatePercent,
        status: burnRatePercent > 90 ? 'OVERRUN' : burnRatePercent < 30 ? 'UNDER_UTILIZED' : 'HEALTHY',
      };
    });

    res.json({ success: true, departments: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

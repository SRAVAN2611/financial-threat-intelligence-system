import RiskScore from '../models/RiskScore.js';

export const getRiskByDepartment = async (req, res) => {
  const { departmentId } = req.params;

  try {
    if (req.user.role === 'DEPARTMENT_HEAD' && req.user.departmentId !== departmentId.toUpperCase()) {
      return res.status(403).json({ success: false, message: 'Access Denied: Restricted department scope.' });
    }

    const risk = await RiskScore.findOne({ departmentId: departmentId.toUpperCase() });
    if (!risk) {
      // Return default baseline if not recalculated yet
      return res.json({
        success: true,
        risk: {
          departmentId: departmentId.toUpperCase(),
          financialRisk: 10,
          securityRisk: 15,
          behavioralRisk: 12,
          transactionRisk: 15,
          overallRisk: 15,
          riskLevel: 'LOW',
          factors: [],
        },
      });
    }

    res.json({ success: true, risk });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRiskScores = async (req, res) => {
  try {
    const scores = await RiskScore.find({});
    res.json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

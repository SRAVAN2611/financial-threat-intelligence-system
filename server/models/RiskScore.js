import mongoose from 'mongoose';

const RiskFactorSchema = new mongoose.Schema({
  factor: { type: String, required: true },
  points: { type: Number, required: true },
  description: { type: String, default: '' },
});

const RiskScoreSchema = new mongoose.Schema({
  departmentId: {
    type: String, // department code
    required: true,
  },
  financialRisk: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  securityRisk: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  behavioralRisk: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  transactionRisk: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  overallRisk: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
  },
  factors: {
    type: [RiskFactorSchema],
    default: [],
  },
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
});

const RiskScore = mongoose.model('RiskScore', RiskScoreSchema);
export default RiskScore;

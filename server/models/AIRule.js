import mongoose from 'mongoose';

const AIRuleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['FINANCIAL', 'SECURITY', 'BEHAVIORAL', 'VENDOR', 'CORRELATED'],
      default: 'FINANCIAL',
    },
    ruleType: {
      type: String,
      default: 'HEURISTIC_THRESHOLD',
    },
    condition: {
      type: String,
      required: true,
    },
    threshold: {
      type: String,
      default: 'Default',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    riskWeight: {
      type: Number,
      default: 20,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    action: {
      type: String,
      default: 'QUARANTINE_TRANSFERS',
    },
    triggerCount24h: {
      type: Number,
      default: 0,
    },
    lastTriggered: {
      type: String,
      default: 'Never',
    },
    createdBy: {
      type: String,
      default: 'SYSTEM_ADMIN',
    },
  },
  { timestamps: true }
);

const AIRule = mongoose.model('AIRule', AIRuleSchema);
export default AIRule;

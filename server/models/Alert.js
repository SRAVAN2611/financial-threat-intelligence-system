import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String, // department code e.g. 'ENG-01'
      required: true,
    },
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
      default: null,
    },
    relatedUserId: {
      type: String, // User ID or Email
      default: '',
    },
    alertType: {
      type: String,
      enum: ['FINANCIAL', 'SECURITY', 'CORRELATED'],
      required: true,
    },
    category: {
      type: String, // UNDER_UTILIZATION, OVERSPENDING, SANCTIONS_MATCH, etc.
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reasons: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['NEW', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'RESOLVED', 'FALSE_POSITIVE'],
      default: 'NEW',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Alert = mongoose.model('Alert', AlertSchema);
export default Alert;

import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    required: true,
  },
  action: {
    type: String, // e.g. BUDGET_RECONFIGURED, EXPENDITURE_CREATED
    required: true,
  },
  entityType: {
    type: String, // e.g. BUDGET, EXPENDITURE, USER, SYSTEM
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  details: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  previousHash: {
    type: String,
    default: '0000000000000000000000000000000000000000000000000000000000000000',
  },
  immutableHash: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'WARNING', 'CRITICAL'],
    default: 'SUCCESS',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;

import mongoose from 'mongoose';

const SecurityEventSchema = new mongoose.Schema({
  userId: {
    type: String, // ID or email of user
    default: 'SYSTEM',
  },
  departmentId: {
    type: String, // department code
    default: '',
  },
  eventType: {
    type: String, // e.g. FAILED_LOGIN, UNAUTHORIZED_ACCESS, PRIVILEGE_VIOLATION, SUSPICIOUS_WRITE
    required: true,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: 'Unknown User Agent',
  },
  resource: {
    type: String, // e.g., '/api/budgets/dept_eng'
    required: true,
  },
  action: {
    type: String, // e.g. 'WRITE', 'READ', 'DELETE'
    required: true,
  },
  result: {
    type: String, // e.g., 'SUCCESS', 'DENIED', 'BLOCKED'
    required: true,
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SecurityEvent = mongoose.model('SecurityEvent', SecurityEventSchema);
export default SecurityEvent;

import mongoose from 'mongoose';

const ShapFactorSchema = new mongoose.Schema({
  feature: { type: String, required: true },
  weight: { type: Number, required: true },
  description: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

const InternalAuditRecordSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  actor: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  hash: { type: String, required: true },
});

const ExpenditureSchema = new mongoose.Schema(
  {
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
      required: true,
    },
    departmentId: {
      type: String, // Department code e.g. 'ENG-01'
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    documentReference: {
      type: String,
      required: true,
    },
    enteredBy: {
      type: String, // email
      required: true,
    },
    status: {
      type: String,
      enum: ['APPROVED', 'FLAGGED', 'QUARANTINED', 'UNDER_REVIEW', 'WHITELISTED', 'REJECTED'],
      default: 'APPROVED',
    },
    // Forensic and Visual integration
    referenceNo: {
      type: String,
      required: true,
      unique: true,
    },
    riskScore: {
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
    threatCategory: {
      type: String,
      default: '',
    },
    threatFlags: {
      type: [String],
      default: [],
    },
    paymentMethod: {
      type: String,
      default: 'WIRE_TRANSFER',
    },
    destinationAccount: {
      type: String,
      default: '',
    },
    originatingAccount: {
      type: String,
      default: '',
    },
    sha256Hash: {
      type: String,
      default: '',
    },
    aiForensicSummary: {
      type: String,
      default: '',
    },
    confidenceScore: {
      type: Number,
      default: 100,
    },
    shapFactors: {
      type: [ShapFactorSchema],
      default: [],
    },
    auditTrail: {
      type: [InternalAuditRecordSchema],
      default: [],
    },
    forensicNotes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Expenditure = mongoose.model('Expenditure', ExpenditureSchema);
export default Expenditure;

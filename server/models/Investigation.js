import mongoose from 'mongoose';

const InvestigationNoteSchema = new mongoose.Schema({
  author: { type: String, required: true },
  note: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const InvestigationSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: true,
      unique: true,
    },
    investigatorId: {
      type: String, // Investigator email
      required: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'RESOLVED', 'FALSE_POSITIVE'],
      default: 'NEW',
    },
    notes: {
      type: [InvestigationNoteSchema],
      default: [],
    },
    evidence: {
      type: [String], // referenced IDs or doc-hashes
      default: [],
    },
    decision: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Investigation = mongoose.model('Investigation', InvestigationSchema);
export default Investigation;

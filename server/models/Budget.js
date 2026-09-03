import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String, // department code e.g., 'ENG-01'
      required: true,
    },
    financialYear: {
      type: String, // e.g., 'FY 2026-27'
      required: true,
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    committedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      default: 'General Core Allocation',
    },
    createdBy: {
      type: String, // email or username
      required: true,
    },
    updatedBy: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index to ensure uniqueness of budget per department, financial year, and category
BudgetSchema.index({ departmentId: 1, financialYear: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', BudgetSchema);
export default Budget;

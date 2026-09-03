import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    registrationIdentifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    taxId: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
    },
    departmentIds: [
      {
        type: String,
      },
    ],
    jurisdiction: {
      type: String,
      default: 'India (Domestic)',
    },
    totalTransactions: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    riskScore: {
      type: Number,
      default: 15,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    riskFactors: [
      {
        factor: String,
        points: Number,
        description: String,
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'UNDER_SURVEILLANCE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model('Vendor', VendorSchema);
export default Vendor;

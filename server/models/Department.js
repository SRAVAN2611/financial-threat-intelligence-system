import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    head: {
      type: String,
      required: true,
    },
    headEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const Department = mongoose.model('Department', DepartmentSchema);
export default Department;

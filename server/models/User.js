import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'FINANCE_OFFICER', 'DEPARTMENT_HEAD'],
      default: 'FINANCE_OFFICER',
    },
    roleTitle: {
      type: String,
      default: 'Financial Intelligence Officer',
    },
    departmentId: {
      type: String, // Code e.g. 'ENG-01', 'FIN-04', or Mongoose Department code
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'locked'],
      default: 'active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Method to verify password match
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', UserSchema);
export default User;

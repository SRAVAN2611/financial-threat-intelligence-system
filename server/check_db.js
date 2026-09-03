import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expenditure from '../server/models/Expenditure.js';

dotenv.config({ path: '../server/.env' });

const verify = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sentinel_fin');
  const count = await Expenditure.countDocuments({ documentReference: 'INV-AWS-912' });
  console.log(`Verified matches for INV-AWS-912: ${count}`);
  const match = await Expenditure.findOne({ documentReference: 'INV-AWS-912' });
  if (match) {
    console.log('Transaction Data:', {
      referenceNo: match.referenceNo,
      amount: match.amount,
      status: match.status,
      riskScore: match.riskScore,
      riskLevel: match.riskLevel,
      threatCategory: match.threatCategory,
      sha256Hash: match.sha256Hash
    });
  }
  process.exit(0);
};

verify();

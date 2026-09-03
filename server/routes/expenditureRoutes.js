import express from 'express';
import {
  getExpenditures,
  createExpenditure,
  updateExpenditureStatus,
  addForensicNote,
  batchQuarantine,
} from '../controllers/expenditureController.js';
import { protect, restrictTo, restrictToOwnDepartment } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getExpenditures);
router.post('/', protect, restrictTo('FINANCE_OFFICER', 'DEPARTMENT_HEAD', 'ADMIN'), restrictToOwnDepartment, createExpenditure);
router.put('/:id/status', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), updateExpenditureStatus);
router.post('/:id/notes', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), addForensicNote);
router.post('/batch-quarantine', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), batchQuarantine);

export default router;

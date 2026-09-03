import express from 'express';
import {
  getInvestigations,
  getInvestigationByAlertId,
  addNoteToInvestigation,
  resolveInvestigation
} from '../controllers/investigationController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), getInvestigations);
router.get('/:alertId', protect, getInvestigationByAlertId);
router.post('/:alertId/notes', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), addNoteToInvestigation);
router.put('/:alertId/resolve', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), resolveInvestigation);

export default router;

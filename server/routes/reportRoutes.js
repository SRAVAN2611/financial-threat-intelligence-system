import express from 'express';
import { getReportsList, exportReportCSV, getStandards, generateInvestigationReport } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getReportsList);
router.get('/standards', protect, getStandards);
router.post('/financial-risk-investigation', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), generateInvestigationReport);
router.post('/sar', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), generateInvestigationReport); // Alias for backwards compatibility
router.get('/export', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), exportReportCSV);

export default router;

import express from 'express';
import { getDashboardData, getActiveSecurityEvents, getAuditLogs } from '../controllers/dashboardController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/metrics', protect, getDashboardData);
router.get('/security-events', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), getActiveSecurityEvents);
router.get('/audit-logs', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), getAuditLogs);

export default router;

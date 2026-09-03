import express from 'express';
import { getAlerts, getAlertById, updateAlertStatus, executeAlertAction } from '../controllers/alertController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAlerts);
router.get('/:id', protect, getAlertById);
router.put('/:id/status', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), updateAlertStatus);
router.post('/:id/action', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), executeAlertAction);
router.post('/:id/quarantine', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), (req, res) => {
  req.body.action = 'RISK_ACTION_HOLD';
  return executeAlertAction(req, res);
});

export default router;

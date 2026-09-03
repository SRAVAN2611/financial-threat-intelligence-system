import express from 'express';
import { getAuditLogs, verifyAuditChain } from '../controllers/auditController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/verify', verifyAuditChain);
router.get('/', getAuditLogs);

export default router;

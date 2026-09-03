import express from 'express';
import { getRules, createRule, toggleRule } from '../controllers/ruleController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getRules);
router.post('/', restrictTo('ADMIN', 'FINANCE_OFFICER'), createRule);
router.put('/:id/toggle', restrictTo('ADMIN', 'FINANCE_OFFICER'), toggleRule);

export default router;

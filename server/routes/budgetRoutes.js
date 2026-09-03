import express from 'express';
import { getBudgets, getBudgetById, createBudget, adjustBudget } from '../controllers/budgetController.js';
import { protect, restrictTo, restrictToOwnDepartment } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getBudgets);
router.get('/:id', protect, getBudgetById);
router.post('/', protect, restrictTo('ADMIN'), createBudget);
router.put('/:departmentId/adjust', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), restrictToOwnDepartment, adjustBudget);

export default router;

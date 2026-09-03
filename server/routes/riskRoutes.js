import express from 'express';
import { getRiskByDepartment, getAllRiskScores } from '../controllers/riskController.js';
import { protect, restrictToOwnDepartment } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllRiskScores);
router.get('/:departmentId', protect, restrictToOwnDepartment, getRiskByDepartment);

export default router;

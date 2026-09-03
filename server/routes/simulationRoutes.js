import express from 'express';
import { runSimulation } from '../controllers/simulationController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/run', protect, restrictTo('ADMIN', 'FINANCE_OFFICER'), runSimulation);

export default router;

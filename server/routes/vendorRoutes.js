import express from 'express';
import { getVendors, getVendorById, updateVendorStatus } from '../controllers/vendorController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getVendors);
router.get('/:id', getVendorById);
router.put('/:id/status', restrictTo('ADMIN', 'FINANCE_OFFICER'), updateVendorStatus);

export default router;

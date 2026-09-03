import express from 'express';
import { getUsers, createUser, updateUserStatus } from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/status', updateUserStatus);

export default router;

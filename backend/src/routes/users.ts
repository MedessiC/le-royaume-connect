import { Router } from 'express';
import {
  getUsers,
  assignRole,
  deleteUser,
} from '../controllers/users.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { publicLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Get all users (paginated, searchable)
router.get('/', publicLimiter, getUsers);

// Admin routes
router.post('/:userId/role', authMiddleware, adminMiddleware, assignRole);
router.delete('/:userId', authMiddleware, adminMiddleware, deleteUser);

export default router;

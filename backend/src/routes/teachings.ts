import { Router } from 'express';
import {
  createTeaching,
  updateTeaching,
  getTeachings,
  getTeachingById,
  deleteTeaching,
} from '../controllers/teachings.js';
import { authMiddleware, adminMiddleware, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { TeachingSchema } from '../utils/validation.js';
import { publicLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.get('/', publicLimiter, getTeachings);
router.get('/:teachingId', getTeachingById);

// Protected routes
router.post(
  '/',
  authMiddleware,
  validateRequest(TeachingSchema),
  createTeaching
);

router.put(
  '/:teachingId',
  authMiddleware,
  validateRequest(TeachingSchema.partial()),
  updateTeaching
);

router.delete('/:teachingId', authMiddleware, deleteTeaching);

export default router;

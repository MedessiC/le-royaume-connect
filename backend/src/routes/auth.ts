import { Router } from 'express';
import passport from 'passport';
import { 
  googleCallback, 
  register, 
  login, 
  getProfile, 
  updateProfile,
  verifyEmail,
  requestPasswordReset,
  resetPassword
} from '../controllers/auth.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { RegisterSchema, LoginSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  validateRequest(RegisterSchema),
  register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(LoginSchema),
  login
);

router.post(
  '/verify-email',
  authLimiter,
  verifyEmail
);

router.post(
  '/request-password-reset',
  authLimiter,
  requestPasswordReset
);

router.post(
  '/reset-password',
  authLimiter,
  resetPassword
);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth?error=google_failed', session: false }),
  googleCallback
);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;

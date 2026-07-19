import { Router } from 'express';
import {
  createPayment,
  getPaymentStatus,
  getPaymentHistory,
  webhookPaymentStatus,
} from '../controllers/payments.js';
import { authMiddleware } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { PaymentRequestSchema } from '../utils/validation.js';

const router = Router();

// Create payment (with strict rate limiting)
router.post(
  '/',
  authMiddleware,
  paymentLimiter,
  validateRequest(PaymentRequestSchema),
  createPayment
);

// Get payment status
router.get('/:paymentId', authMiddleware, getPaymentStatus);

// Get payment history
router.get('/', authMiddleware, getPaymentHistory);

// Webhook for payment status updates (no auth required, verify by signature)
router.post('/:paymentId/webhook', webhookPaymentStatus);

export default router;

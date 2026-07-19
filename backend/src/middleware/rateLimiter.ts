import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 payment attempts per hour
  keyGenerator: (req) => {
    // Rate limit by phone number instead of IP
    return req.body?.phoneNumber || req.ip;
  },
  message: {
    error: 'Too many payment attempts. Please try again later.',
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many payment attempts',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Auth endpoint limiter (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
});

// Loose limiter for public endpoints
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

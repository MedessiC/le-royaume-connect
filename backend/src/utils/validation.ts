import { z } from 'zod';

// Payment validation
export const PaymentRequestSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, 'Invalid phone number format')
    .describe('Phone number in E.164 format'),
  amount: z
    .number()
    .int()
    .min(100, 'Amount must be at least 100')
    .max(500000, 'Amount exceeds maximum limit')
    .describe('Amount in XOF'),
  network: z
    .enum(['mtn', 'moov', 'celtiis'], { description: 'Mobile network' })
    .describe('Mobile network operator'),
  description: z
    .string()
    .max(255, 'Description too long')
    .optional()
    .default('Donation MILLENIUM'),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

// User registration
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  fullName: z.string().min(2).max(100),
  country: z.string().max(100).optional(),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

// User login
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

// Create teaching
export const TeachingSchema = z.object({
  title: z.string().min(5).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(20),
  category_id: z.string().uuid().optional(),
  country: z.string().max(100).optional(),
});

export type TeachingRequest = z.infer<typeof TeachingSchema>;

import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import logger from '../utils/logger.js';
import { RegisterRequest, LoginRequest } from '../utils/validation.js';
import { AuthRequest } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';
import { emailTemplates } from '../services/emailTemplates.js';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

function generateToken(userId: string, email: string, role: string = 'member') {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
}

export async function register(req: any, res: Response) {
  try {
    const { email, password, fullName, country } = req.body as RegisterRequest;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create verification token (valid for 24 hours)
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const userResult = await query(
      `INSERT INTO users (email, password, full_name, country, verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name`,
      [
        email.toLowerCase(),
        hashedPassword,
        fullName,
        country || null,
        verificationToken,
        verificationExpires,
      ]
    );

    const user = userResult.rows[0];

    // Assign member role
    await query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [user.id, 'member']
    );

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    try {
      const template = emailTemplates.verifyEmail(verificationLink, fullName || email);
      await emailService.sendEmail({
        to: email.toLowerCase(),
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (emailError) {
      logger.warn(`Failed to send verification email to ${email}:`, emailError);
      // Don't fail the registration if email fails
    }

    logger.info(`New user registered: ${user.email} (verification pending)`);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user,
      requiresEmailVerification: true,
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: any, res: Response) {
  try {
    const { email, password } = req.body as LoginRequest;

    // Find user
    const userResult = await query(
      'SELECT id, email, password, full_name FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user role
    const roleResult = await query(
      'SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1',
      [user.id]
    );

    const role = roleResult.rows[0]?.role || 'member';
    const token = generateToken(user.id, user.email, role);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
      token,
      role,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    const userResult = await query(
      `SELECT id, email, full_name, country, avatar_url, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const roleResult = await query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    const role = roleResult.rows[0]?.role || 'member';

    res.json({ ...user, role });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { fullName, country, avatarUrl } = req.body;

    const result = await query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           country = COALESCE($2, country),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name, country, avatar_url`,
      [fullName || null, country || null, avatarUrl || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User profile updated: ${userId}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function googleCallback(req: any, res: Response) {
  try {
    // Passport has already verified the user
    const { id, email, displayName, picture } = req.user;

    // Check if user exists
    const userResult = await query(
      'SELECT id FROM users WHERE google_id = $1',
      [id]
    );

    let userId: string;

    if (userResult.rows.length > 0) {
      // User exists, just update
      userId = userResult.rows[0].id;
      await query(
        `UPDATE users 
         SET avatar_url = $1, updated_at = NOW()
         WHERE id = $2`,
        [picture, userId]
      );
    } else {
      // Check if email already exists
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (emailCheck.rows.length > 0) {
        // Email exists, link Google to existing account
        userId = emailCheck.rows[0].id;
        await query(
          'UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3',
          [id, picture, userId]
        );
      } else {
        // Create new user
        const newUserResult = await query(
          `INSERT INTO users (email, google_id, full_name, avatar_url, email_verified)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [email.toLowerCase(), id, displayName || email, picture, true]
        );
        userId = newUserResult.rows[0].id;

        // Assign member role
        await query(
          'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
          [userId, 'member']
        );

        logger.info(`New Google user created: ${email}`);
      }
    }

    const token = generateToken(userId, email, 'member');

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&userId=${userId}`;
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
  }
}

export async function verifyEmail(req: any, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user with this verification token
    const userResult = await query(
      `SELECT id, email, verification_expires 
       FROM users 
       WHERE verification_token = $1`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    const user = userResult.rows[0];

    // Check if token is expired
    if (new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Mark email as verified
    const updateResult = await query(
      `UPDATE users 
       SET email_verified = true, verification_token = NULL, verification_expires = NULL
       WHERE id = $1
       RETURNING id, email, full_name`,
      [user.id]
    );

    logger.info(`Email verified for user: ${user.email}`);

    // Generate token for immediate login
    const jwtToken = generateToken(user.id, user.email, 'member');

    res.json({
      message: 'Email verified successfully',
      user: updateResult.rows[0],
      token: jwtToken,
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
}

export async function requestPasswordReset(req: any, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const userResult = await query(
      'SELECT id, full_name FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: 'If an account exists with this email, you will receive password reset instructions',
      });
    }

    const user = userResult.rows[0];

    // Create reset token (valid for 1 hour)
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Save reset token
    await query(
      `UPDATE users 
       SET reset_token = $1, reset_expires = $2
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    try {
      const template = emailTemplates.resetPassword(resetLink, user.full_name || email);
      await emailService.sendEmail({
        to: email.toLowerCase(),
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (emailError) {
      logger.warn(`Failed to send password reset email to ${email}:`, emailError);
      // Don't fail the request if email fails
    }

    logger.info(`Password reset requested for user: ${email}`);

    res.json({
      message: 'If an account exists with this email, you will receive password reset instructions',
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

export async function resetPassword(req: any, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Find user with this reset token
    const userResult = await query(
      `SELECT id, email, reset_expires 
       FROM users 
       WHERE reset_token = $1`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = userResult.rows[0];

    // Check if token is expired
    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await query(
      `UPDATE users 
       SET password = $1, reset_token = NULL, reset_expires = NULL
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
}

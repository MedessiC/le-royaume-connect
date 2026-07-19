import { Response } from 'express';
import { query } from '../db/connection.js';
import logger from '../utils/logger.js';
import { AuthRequest, adminMiddleware } from '../middleware/auth.js';

export async function getUsers(
  req: AuthRequest,
  res: Response
) {
  try {
    const { limit = 10, offset = 0, search } = req.query;

    let sql = `
      SELECT u.id, u.email, u.full_name, u.country, u.avatar_url, u.created_at,
             COALESCE(json_agg(ur.role), '[]'::json) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
    `;

    const params: any[] = [];

    if (search) {
      sql += ` WHERE u.email ILIKE $1 OR u.full_name ILIKE $1`;
      params.push(`%${search}%`);
      params.push(parseInt(limit as string));
      params.push(parseInt(offset as string));
    } else {
      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string));
      params.push(parseInt(offset as string));
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const result = await query(sql, params);

    const countResult = await query('SELECT COUNT(*) as total FROM users');

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function assignRole(
  req: AuthRequest,
  res: Response
) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete existing roles and assign new one
    await query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    await query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [userId, role]
    );

    logger.info(`Role assigned to user ${userId}: ${role}`);

    res.json({ success: true, role });
  } catch (error) {
    logger.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
}

export async function deleteUser(
  req: AuthRequest,
  res: Response
) {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (CASCADE will handle related records)
    await query('DELETE FROM users WHERE id = $1', [userId]);

    logger.info(`User deleted: ${userId}`);

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

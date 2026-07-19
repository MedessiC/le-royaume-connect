import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import logger from '../utils/logger.js';
import { TeachingSchema } from '../utils/validation.js';
import { AuthRequest } from '../middleware/auth.js';

export async function createTeaching(
  req: AuthRequest,
  res: Response
) {
  try {
    const { title, excerpt, content, category_id, country } = req.body;
    const authorId = req.user?.id;

    const teachingId = uuidv4();

    const result = await query(
      `INSERT INTO teachings (
        id, title, excerpt, content, category_id, 
        country, author_id, published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [teachingId, title, excerpt || null, content, category_id || null, country || null, authorId, false]
    );

    logger.info(`Teaching created: ${teachingId} by ${authorId}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Create teaching error:', error);
    res.status(500).json({ error: 'Failed to create teaching' });
  }
}

export async function updateTeaching(
  req: AuthRequest,
  res: Response
) {
  try {
    const { teachingId } = req.params;
    const { title, excerpt, content, category_id, country, published } = req.body;
    const authorId = req.user?.id;

    // Check ownership
    const teaching = await query(
      'SELECT author_id FROM teachings WHERE id = $1',
      [teachingId]
    );

    if (teaching.rows.length === 0) {
      return res.status(404).json({ error: 'Teaching not found' });
    }

    if (teaching.rows[0].author_id !== authorId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await query(
      `UPDATE teachings SET
       title = COALESCE($1, title),
       excerpt = COALESCE($2, excerpt),
       content = COALESCE($3, content),
       category_id = COALESCE($4, category_id),
       country = COALESCE($5, country),
       published = COALESCE($6, published),
       updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title || null, excerpt || null, content || null, category_id || null, country || null, published !== undefined ? published : null, teachingId]
    );

    logger.info(`Teaching updated: ${teachingId}`);

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Update teaching error:', error);
    res.status(500).json({ error: 'Failed to update teaching' });
  }
}

export async function getTeachings(
  req: any,
  res: Response
) {
  try {
    const { limit = 10, offset = 0, category, search, published = true } = req.query;

    let sql = 'SELECT * FROM teachings WHERE published = $1';
    const params: any[] = [published === 'true' || published === true];

    if (category) {
      sql += ` AND category_id = $${params.length + 1}`;
      params.push(category);
    }

    if (search) {
      sql += ` AND (title ILIKE $${params.length + 1} OR content ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string));
    params.push(parseInt(offset as string));

    const result = await query(sql, params);

    const countSql = 'SELECT COUNT(*) as total FROM teachings WHERE published = $1' + 
      (category ? ` AND category_id = $2` : '');
    const countParams = [params[0]];
    if (category) countParams.push(category);

    const countResult = await query(countSql, countParams);

    res.json({
      teachings: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('Get teachings error:', error);
    res.status(500).json({ error: 'Failed to fetch teachings' });
  }
}

export async function getTeachingById(
  req: any,
  res: Response
) {
  try {
    const { teachingId } = req.params;

    const result = await query(
      'SELECT * FROM teachings WHERE id = $1',
      [teachingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teaching not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get teaching error:', error);
    res.status(500).json({ error: 'Failed to fetch teaching' });
  }
}

export async function deleteTeaching(
  req: AuthRequest,
  res: Response
) {
  try {
    const { teachingId } = req.params;
    const authorId = req.user?.id;

    // Check ownership
    const teaching = await query(
      'SELECT author_id FROM teachings WHERE id = $1',
      [teachingId]
    );

    if (teaching.rows.length === 0) {
      return res.status(404).json({ error: 'Teaching not found' });
    }

    if (teaching.rows[0].author_id !== authorId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await query('DELETE FROM teachings WHERE id = $1', [teachingId]);

    logger.info(`Teaching deleted: ${teachingId}`);

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete teaching error:', error);
    res.status(500).json({ error: 'Failed to delete teaching' });
  }
}

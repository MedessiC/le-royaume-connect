import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import logger from '../utils/logger.js';

export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          error: 'Validation error',
          details: messages,
        });
      }
      next(error);
    }
  };
}

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Unhandled error:', error);

  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({ error: 'Database connection lost' });
  }

  if (error.code === 'ER_CON_COUNT_ERROR') {
    return res.status(503).json({ error: 'Database connection limit reached' });
  }

  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({ error: 'Database access denied' });
  }

  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

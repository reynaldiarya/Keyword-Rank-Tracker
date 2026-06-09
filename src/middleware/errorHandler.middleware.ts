import type { Request, Response, NextFunction } from 'express';

import { logger } from '../utils';

/**
 * Global middleware to handle uncaught errors from controllers.
 * Prevents application crashes and provides a clean error response to the user.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);

  // In development mode, display the stack trace for easier debugging
  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

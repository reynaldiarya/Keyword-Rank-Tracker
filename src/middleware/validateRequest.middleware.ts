import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';

import { logger } from '../utils';

/**
 * Middleware for validating requests using the Zod library.
 * Ensures the incoming request data matches the expected schema format.
 */
export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request body, query parameters, and route parameters
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // If validation succeeds, proceed to the next middleware or controller
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger.warn(`Validation Error: ${JSON.stringify((error as any).errors)}`);
        return res.status(400).json({
          error: 'Validation Error',
          // Return the validation details to inform the user about invalid fields
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details: (error as any).errors.map((e: any) => ({
            path: e.path,
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };

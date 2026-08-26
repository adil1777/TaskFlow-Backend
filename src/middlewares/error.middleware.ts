import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';
import { AppError } from '../utils/error';
import statusCodes from '../utils/statusCodes';
import messages from '../utils/messages';

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error [errorMiddleware]:', error);

  //Zod validation error
  if (error instanceof ZodError) {
    return res.status(statusCodes.BAD_REQUEST).json({
      error: 'Validation failed',
      code: statusCodes.BAD_REQUEST,
      details: error.issues.map((issue) => {
        const field = issue.path.join('.') || 'body';

        let message = issue.message;

        if (issue.code === 'invalid_type' && issue.input === undefined) {
          message = `${field} is required`;
        }

        if (issue.code === 'unrecognized_keys') {
          return {
            field: issue.keys.join(', '),
            message: 'Unknown field',
          };
        }

        return {
          field,
          message,
        };
      }),
    });
  }

  // Application error
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  // Unknown error
  return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
    error: messages.INTERNAL_SERVER_ERROR,
    code: statusCodes.INTERNAL_SERVER_ERROR,
    details: {},
  });
}

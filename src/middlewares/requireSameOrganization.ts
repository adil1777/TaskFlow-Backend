import { Request, Response, NextFunction } from 'express';

import { AppError } from '../utils/error';
import statusCodes from '../utils/statusCodes';

export function requireSameOrganization(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user) {
      throw new AppError(
        'Authentication required',
        'UNAUTHORIZED',
        statusCodes.UNAUTHORIZED
      );
    }

    if (!user.organizationId) {
      throw new AppError(
        'Organization context is required',
        'ORGANIZATION_CONTEXT_REQUIRED',
        statusCodes.FORBIDDEN
      );
    }

    if (user.organizationId !== req.params.organizationId) {
      throw new AppError(
        'You do not have access to this organization',
        'ORGANIZATION_ACCESS_DENIED',
        statusCodes.FORBIDDEN
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

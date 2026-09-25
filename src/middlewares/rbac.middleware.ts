import { NextFunction, Request, Response } from 'express';

import { OrgRole, SystemRole } from '@prisma/client';

import { AppError } from '../utils/error';
import statusCodes from '../utils/statusCodes';

export function requireOrgRole(...allowedRoles: OrgRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(
        new AppError(
          'Authentication required',
          'UNAUTHORIZED',
          statusCodes.UNAUTHORIZED
        )
      );
    }

    if (!user.organizationId || !user.role) {
      return next(
        new AppError(
          'Organization context is required',
          'ORGANIZATION_CONTEXT_REQUIRED',
          statusCodes.FORBIDDEN
        )
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          'FORBIDDEN',
          statusCodes.FORBIDDEN
        )
      );
    }

    return next();
  };
}

export function requireSystemRole(...allowedRoles: SystemRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(
        new AppError(
          'Authentication required',
          'UNAUTHORIZED',
          statusCodes.UNAUTHORIZED
        )
      );
    }

    if (!allowedRoles.includes(user.systemRole)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          'FORBIDDEN',
          statusCodes.FORBIDDEN
        )
      );
    }

    return next();
  };
}

export function requireSystemAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return requireSystemRole(SystemRole.system_admin)(req, res, next);
}

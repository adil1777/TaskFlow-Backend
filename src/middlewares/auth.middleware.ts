import { Request, Response, NextFunction } from 'express';

import { SystemRole } from '@prisma/client';

import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/error';
import statusCodes from '../utils/statusCodes';
import authRepository from '../modules/auth/auth.repository';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    // Check Authorization header
    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError(
        'Authentication required',
        'UNAUTHORIZED',
        statusCodes.UNAUTHORIZED
      );
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      throw new AppError(
        'Authentication required',
        'UNAUTHORIZED',
        statusCodes.UNAUTHORIZED
      );
    }

    // 2. Verify access token

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(
        'Invalid or expired access token',
        'INVALID_ACCESS_TOKEN',
        statusCodes.UNAUTHORIZED
      );
    }

    if (!payload.sub) {
      throw new AppError(
        'Invalid access token',
        'INVALID_ACCESS_TOKEN',
        statusCodes.UNAUTHORIZED
      );
    }

    //Find authenticated user
    const user = await authRepository.findUserById(payload.sub);

    if (!user) {
      throw new AppError(
        'User not found',
        'USER_NOT_FOUND',
        statusCodes.UNAUTHORIZED
      );
    }

    // 4. System Admin
    if (user.systemRole === SystemRole.system_admin) {
      req.user = {
        id: user.id,
        systemRole: user.systemRole,
      };

      return next();
    }

    //Organization context required for normal users
    if (!payload.organizationId) {
      throw new AppError(
        'Organization context is required',
        'ORGANIZATION_CONTEXT_REQUIRED',
        statusCodes.FORBIDDEN
      );
    }

    //Verify organization membership
    const membership = await authRepository.findMembership(
      user.id,
      payload.organizationId
    );

    if (!membership) {
      throw new AppError(
        'Organization membership not found',
        'MEMBERSHIP_NOT_FOUND',
        statusCodes.FORBIDDEN
      );
    }
    //Attach authenticated user to request

    req.user = {
      id: user.id,
      systemRole: user.systemRole,
      organizationId: membership.organizationId,
      role: membership.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

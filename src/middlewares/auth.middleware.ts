import {
  Request,
  Response,
  NextFunction,
} from "express";

import { verifyAccessToken } from "../utils/jwt";
import prisma from "../db/prisma";
import { AppError } from "../utils/error";
import { OrgRole } from "@prisma/client";
import statusCodes from "../utils/statusCodes";

export interface AuthUser {
  id: string;
  organizationId: string;
  role: OrgRole;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new AppError(
        "Authentication required",
        "UNAUTHORIZED",
        statusCodes.UNAUTHORIZED
      );
    }

    const token = header.substring(7);

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(
        "Invalid or expired access token",
        "INVALID_ACCESS_TOKEN",
       statusCodes.UNAUTHORIZED
      );
    }

    const membership =
      await prisma.orgMember.findFirst({
        where: {
          userId: payload.sub,
          organizationId: payload.organizationId,
        },
      });

    if (!membership) {
      throw new AppError(
        "Organization membership not found",
        "MEMBERSHIP_NOT_FOUND",
        statusCodes.FORBIDDEN
      );
    }

    req.user = {
      id: payload.sub,
      organizationId: membership.organizationId,
      role: membership.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
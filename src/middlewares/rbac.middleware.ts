import {
  Request,
  Response,
  NextFunction,
} from "express";

import { OrgRole } from "@prisma/client";
import { AppError } from "../utils/error";
import statusCodes from "../utils/statusCodes";

export function requireRole(
  ...allowedRoles: OrgRole[]
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const user = req.user;

    if (!user) {
      return next(
        new AppError(
          "Authentication required",
          "UNAUTHORIZED",
         statusCodes.UNAUTHORIZED
        )
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          "FORBIDDEN",
          statusCodes.FORBIDDEN
        )
      );
    }

    next();
  };
}
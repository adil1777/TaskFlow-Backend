import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../utils/error";
import { AuthenticatedRequest } from "./auth.middleware";

export function requireRole(
  ...allowedRoles: (
    "org_admin" | "member"
  )[]
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const user =
      (req as AuthenticatedRequest).user;

    if (!user) {
      return next(
        new AppError(
          "Authentication required",
          "UNAUTHORIZED",
          401
        )
      );
    }

    if (
      !allowedRoles.includes(user.role)
    ) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          "FORBIDDEN",
          403
        )
      );
    }

    next();
  };
}
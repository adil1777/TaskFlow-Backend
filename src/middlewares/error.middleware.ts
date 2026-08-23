import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../utils/error";
import statusCodes from "../utils/statusCodes";
import messages from "../utils/messages";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  return res.status(
    statusCodes.INTERNAL_SERVER_ERROR
  ).json({
    error: messages.INTERNAL_SERVER_ERROR,
    code: statusCodes.INTERNAL_SERVER_ERROR,
    details: {},
  });
}
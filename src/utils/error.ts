export class AppError extends Error {
  statusCode: number;
  code: string;
  details: unknown;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details: unknown = {}
  ) {
    super(message);

    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
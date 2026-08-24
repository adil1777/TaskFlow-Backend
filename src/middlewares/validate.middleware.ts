import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      next(error);
    }
  };
};







// import {
//   Request,
//   Response,
//   NextFunction,
// } from "express";
// import { ZodSchema } from "zod";

// type ValidationTarget =
//   | "body"
//   | "query"
//   | "params";

// export const validate = (
//   schema: ZodSchema,
//   target: ValidationTarget = "body"
// ) => {
//   return (
//     req: Request,
//     _res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       req[target] = schema.parse(req[target]);

//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };




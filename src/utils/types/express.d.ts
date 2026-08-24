import { AuthUser } from "../middlewares/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
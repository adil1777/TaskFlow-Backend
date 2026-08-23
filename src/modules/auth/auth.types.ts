import { z } from "zod";

import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.validation";

export type RegisterInput =
  z.infer<typeof registerSchema>;

export type LoginInput =
  z.infer<typeof loginSchema>;

export type RefreshInput =
  z.infer<typeof refreshSchema>;

export type LogoutInput =
  z.infer<typeof logoutSchema>;
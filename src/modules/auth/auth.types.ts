import { z } from 'zod';

import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from './auth.validation';

import { OrgRole, SystemRole } from '@prisma/client';

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type RefreshInput = z.infer<typeof refreshSchema>;

export type LogoutInput = z.infer<typeof logoutSchema>;

export interface AuthUser {
  id: string;
  systemRole: SystemRole;

  // Organization context is optional for system admins
  organizationId?: string;
  role?: OrgRole;
}

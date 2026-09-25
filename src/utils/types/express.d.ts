import { OrgRole, SystemRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  systemRole: SystemRole;

  // Present only when operating in an organization context
  organizationId?: string;
  role?: OrgRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};

import { OrgRole } from '@prisma/client';
import z from 'zod';
import {
  addOrganizationMemberSchema,
  createOrganizationSchema,
  updateOrganizationMemberSchema,
  updateOrganizationSchema,
} from './organization.validation';

export interface CreateOrganizationResult {
  organization: {
    id: string;
    name: string;
    createdAt: Date;
  };

  admin: {
    id: string;
    name: string;
    email: string;
    role: OrgRole;
  };
}

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddOrganizationMemeberInput = z.infer<
  typeof addOrganizationMemberSchema
>;
export type UpdateOrganizationMemeberInput = z.infer<
  typeof updateOrganizationMemberSchema
>;

import { OrgRole } from '@prisma/client';
import { z } from 'zod';

export const createOrganizationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100, 'Organization name must not exceed 100 characters'),

    adminUserId: z.string().uuid('Invalid admin user ID'),
  })
  .strict();

export const updateOrganizationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100, 'Organization name must not exceed 100 characters'),
  })
  .strict();

export const addOrganizationMemberSchema = z
  .object({
    userId: z.string().uuid('Invalid user ID'),

    role: z.nativeEnum(OrgRole).optional().default(OrgRole.member),
  })
  .strict();

export const updateOrganizationMemberSchema = z
  .object({
    role: z.nativeEnum(OrgRole),
  })
  .strict();

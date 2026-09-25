import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Project name must be at least 2 characters')
      .max(100, 'Project name must not exceed 100 characters'),

    description: z
      .string()
      .trim()
      .max(1000, 'Project description must not exceed 1000 characters')
      .optional(),

    managerId: z.string().uuid('Invalid manager ID').optional(),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Project name must be at least 2 characters')
      .max(100, 'Project name must not exceed 100 characters')
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, 'Project description must not exceed 1000 characters')
      .optional(),

    managerId: z.string().uuid('Invalid manager ID').nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.managerId !== undefined,
    {
      message: 'At least one field is required',
    }
  )
  .strict();

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const addProjectMemberSchema = z
  .object({
    userId: z.string().uuid('Invalid user ID'),
  })
  .strict();

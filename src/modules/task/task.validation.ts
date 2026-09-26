import { z } from 'zod';
import { Priority, Status } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Task title must be at least 2 characters')
    .max(200, 'Task title must not exceed 200 characters'),

  description: z
    .string()
    .trim()
    .max(5000, 'Task description must not exceed 5000 characters')
    .optional(),

  status: z.nativeEnum(Status).optional(),

  priority: z.nativeEnum(Priority).optional(),

  dueDate: z.coerce.date().nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Task title must be at least 2 characters')
      .max(200, 'Task title must not exceed 200 characters')
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000, 'Task description must not exceed 5000 characters')
      .nullable()
      .optional(),

    status: z.nativeEnum(Status).optional(),

    priority: z.nativeEnum(Priority).optional(),

    dueDate: z.coerce.date().nullable().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined ||
      data.dueDate !== undefined,
    {
      message: 'At least one field is required',
    }
  );

export const assignTaskSchema = z.object({
  assigneeId: z.string().uuid('Invalid assignee ID'),
});

export const taskFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z.nativeEnum(Status).optional(),

  priority: z.nativeEnum(Priority).optional(),

  assigneeId: z.string().uuid('Invalid assignee ID').optional(),

  dueDateFrom: z.coerce.date().optional(),

  dueDateTo: z.coerce.date().optional(),
});

export default {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  taskFilterSchema,
};

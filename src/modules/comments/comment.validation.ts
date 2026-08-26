import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment is too long'),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment is too long'),
});

export const commentIdSchema = z.object({
  id: z.string().uuid(),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().uuid(),
});

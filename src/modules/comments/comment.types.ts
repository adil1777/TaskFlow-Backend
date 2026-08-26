import { z } from 'zod';
import { createCommentSchema, updateCommentSchema } from './comment.validation';

export type createCommentInput = z.infer<typeof createCommentSchema>;

export type updateCommentInput = z.infer<typeof updateCommentSchema>;

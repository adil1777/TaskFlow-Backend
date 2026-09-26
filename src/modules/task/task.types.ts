import { z } from 'zod';
import {
  assignTaskSchema,
  createTaskSchema,
  taskFilterSchema,
  updateTaskSchema,
} from './task.validation';

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export type AssignTaskInput = z.infer<typeof assignTaskSchema>;

// JSON-safe audit value
export type TaskHistoryValue = string | null;

export type TaskHistoryChanges = Record<string, TaskHistoryValue>;

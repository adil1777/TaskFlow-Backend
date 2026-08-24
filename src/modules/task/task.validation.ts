import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must contain at least 2 characters")
    .max(200),

  description: z
    .string()
    .max(5000)
    .optional(),

  status: z
    .enum(["todo", "in_progress", "review", "done"])
    .optional(),

  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional(),

  dueDate: z
    .coerce
    .date()
    .optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdSchema = z.object({
  id: z.string().uuid(),
});

export const projectIdSchema = z.object({
  projectId: z.string().uuid(),
});

export const taskFilterSchema = z.object({
  status: z
    .enum(["todo", "in_progress", "review", "done"])
    .optional(),

  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional(),

  assignee: z
    .string()
    .uuid()
    .optional(),

  dueDateFrom: z
    .coerce
    .date()
    .optional(),

  dueDateTo: z
    .coerce
    .date()
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const assignTaskSchema = z.object({
  userId: z
    .string({
      error: "User ID is required",
    })
    .uuid("Invalid user ID"),
});
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must contain at least 2 characters")
    .max(150),

  description: z
    .string()
    .max(1000)
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(150)
    .optional(),

  description: z
    .string()
    .max(1000)
    .optional(),
});

export const projectIdSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
});

export const paginationSchema = z.object({
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
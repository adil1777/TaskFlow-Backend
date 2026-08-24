import { z } from "zod";
import { createProjectSchema, paginationSchema, projectIdSchema, updateProjectSchema } from "./project.validation";


export type CreateProjectInput =
  z.infer<typeof createProjectSchema>;

export type PaginationInput =
  z.infer<typeof paginationSchema>;

export type UpdateProjectInput =
  z.infer<typeof updateProjectSchema>;

export type ProjectIdInput =
  z.infer<typeof projectIdSchema>;  
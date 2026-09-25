import { z } from 'zod';
import {
  addProjectMemberSchema,
  createProjectSchema,
  paginationSchema,
  updateProjectSchema,
} from './project.validation';

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export type PaginationInput = z.infer<typeof paginationSchema>;

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type addProjectMemberInput = z.infer<typeof addProjectMemberSchema>;

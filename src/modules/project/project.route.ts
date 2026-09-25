import { Router } from 'express';
import projectController from './project.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireOrgRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createProjectSchema, updateProjectSchema } from './project.validation';
import { OrgRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(createProjectSchema),
  projectController.createProject
);

router.get('/', projectController.getProjects);

router.get('/:id', projectController.getProjectById);

router.patch(
  '/:id',
  validate(updateProjectSchema),
  projectController.updateProject
);

router.delete(
  '/:id',
  requireOrgRole(OrgRole.org_admin),
  projectController.deleteProject
);

export default router;

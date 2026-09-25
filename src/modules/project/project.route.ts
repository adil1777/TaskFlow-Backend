import { Router } from 'express';

import { OrgRole } from '@prisma/client';

import projectController from './project.controller';

import {
  createProjectSchema,
  updateProjectSchema,
  paginationSchema,
  addProjectMemberSchema,
} from './project.validation';

import { authMiddleware } from '../../middlewares/auth.middleware';

import { requireOrgRole } from '../../middlewares/rbac.middleware';

import { validate } from '../../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| Project CRUD
|--------------------------------------------------------------------------
*/

/*
 * Create project
 *
 * Only organization admin can create projects.
 */
router.post(
  '/',
  requireOrgRole(OrgRole.org_admin),
  validate(createProjectSchema),
  projectController.createProject
);

/*
 * Get projects
 *
 * Any organization member can view projects.
 */
router.get(
  '/',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  validate(paginationSchema),
  projectController.getProjects
);

//Get project
router.get(
  '/:id',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  projectController.getProjectById
);

//Update project
router.patch(
  '/:id',
  requireOrgRole(OrgRole.org_admin),
  validate(updateProjectSchema),
  projectController.updateProject
);

//Delete project
router.delete(
  '/:id',
  requireOrgRole(OrgRole.org_admin),
  projectController.deleteProject
);

/*
|--------------------------------------------------------------------------
| Project Members
|--------------------------------------------------------------------------
*/

//Get project members
router.get(
  '/:id/members',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  projectController.getProjectMembers
);

//Add project member
router.post(
  '/:id/members',
  requireOrgRole(OrgRole.org_admin),
  validate(addProjectMemberSchema),
  projectController.addProjectMember
);

// Remove project member
router.delete(
  '/:id/members/:userId',
  requireOrgRole(OrgRole.org_admin),
  projectController.removeProjectMember
);

export default router;

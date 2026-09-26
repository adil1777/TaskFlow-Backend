import { Router } from 'express';

import taskController from './task.controller';

import {
  assignTaskSchema,
  createTaskSchema,
  updateTaskSchema,
} from './task.validation';

import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireOrgRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';

import { OrgRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Create Task
// Org Admin + Project Manager
router.post(
  '/projects/:projectId/tasks',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  validate(createTaskSchema),
  taskController.createTask
);

// View Tasks
// Org Admin + Project Manager + Project Member
router.get(
  '/projects/:projectId/tasks',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  taskController.getTasks
);

// View Task
// Org Admin + Project Manager + Project Member
router.get(
  '/tasks/:id',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  taskController.getTaskById
);

// Update Task
// Org Admin       -> full update
// Project Manager -> full update
// Assigned User   -> status only
router.patch(
  '/tasks/:id',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  validate(updateTaskSchema),
  taskController.updateTask
);

// Delete Task
// Org Admin + Project Manager
router.delete(
  '/tasks/:id',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  taskController.deleteTask
);

// Assign Task
// Org Admin + Project Manager
router.post(
  '/tasks/:id/assign',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  validate(assignTaskSchema),
  taskController.assignTask
);

// Unassign Task
// Org Admin + Project Manager
router.delete(
  '/tasks/:id/assign/:userId',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  taskController.unassignTask
);

// View History
// Org Admin + Project Manager + Project Member
router.get(
  '/tasks/:id/history',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  taskController.getTaskHistory
);

export default router;

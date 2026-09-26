import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireOrgRole } from '../../middlewares/rbac.middleware';
import { OrgRole } from '@prisma/client';

import dashboardController from './dashboard.controller';

const router = Router();

router.use(authMiddleware);

// Project Dashboard
// Org Admin + Project Manager + Project Member
router.get(
  '/:projectId/dashboard',
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  dashboardController.getProjectDashboard
);

export default router;

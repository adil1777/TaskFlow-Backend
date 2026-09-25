import { Router } from 'express';

import organizationController from './organization.controller';

import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addOrganizationMemberSchema,
  updateOrganizationMemberSchema,
} from './organization.validation';

import { authMiddleware } from '../../middlewares/auth.middleware';

import {
  requireSystemAdmin,
  requireOrgRole,
} from '../../middlewares/rbac.middleware';

import { validate } from '../../middlewares/validate.middleware';

import { OrgRole } from '@prisma/client';
import { requireSameOrganization } from '../../middlewares/requireSameOrganization';

const router = Router();

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| System Admin APIs
|--------------------------------------------------------------------------
*/

//Create organization + initial organization admin
router.post(
  '/',
  requireSystemAdmin,
  validate(createOrganizationSchema),
  organizationController.createOrganization
);

//Get all organizations
router.get('/', requireSystemAdmin, organizationController.getAllOrganizations);

//Get organization by Organization Id
router.get(
  '/:organizationId',
  requireSystemAdmin,
  organizationController.getOrganizationById
);

// Update organization
router.patch(
  '/:organizationId',
  requireSystemAdmin,
  validate(updateOrganizationSchema),
  organizationController.updateOrganization
);

//Delete organization
router.delete(
  '/:organizationId',
  requireSystemAdmin,
  organizationController.deleteOrganization
);

/*
|--------------------------------------------------------------------------
| Organization Member APIs
|--------------------------------------------------------------------------
*/

/*
 * Get organization members
 *
 * org_admin + member can view members.
 */
router.get(
  '/:organizationId/members',
  requireSameOrganization,
  requireOrgRole(OrgRole.org_admin, OrgRole.member),
  organizationController.getOrganizationMembers
);

// Add member
router.post(
  '/:organizationId/members',
  requireOrgRole(OrgRole.org_admin),
  validate(addOrganizationMemberSchema),
  organizationController.addOrganizationMember
);

// Update member role
router.patch(
  '/:organizationId/members/:userId',
  requireOrgRole(OrgRole.org_admin),
  validate(updateOrganizationMemberSchema),
  organizationController.updateOrganizationMember
);

//Remove member
router.delete(
  '/:organizationId/members/:userId',
  requireOrgRole(OrgRole.org_admin),
  organizationController.removeOrganizationMember
);

export default router;

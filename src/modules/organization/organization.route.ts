import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth.middleware';
import organizationController from './organization.controller';

const router = Router();

router.use(authMiddleware);

/**
 * Returns all organizations accessible to the authenticated user.
 *
 * This endpoint is intentionally NOT restricted to org_admin because
 * members should also be able to see the organizations they belong to.
 */
router.get('/', organizationController.getOrganizations);

/**
 * Returns a specific organization.
 *
 * Organization-level authorization is handled inside the service
 * because the role must be checked against the target organizationId.
 */
router.get('/:organizationId', organizationController.getOrganizationById);

export default router;

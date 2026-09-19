import { OrgRole } from '@prisma/client';

import organizationRepository from './organization.repository';

import { AppError } from '../../utils/error';
import statusCodes from '../../utils/statusCodes';
import messages from '../../utils/messages';

//GET ORGANIZATIONS
const getOrganizations = async (userId: string) => {
  try {
    return await organizationRepository.getOrganizationsByUser(userId);
  } catch (error) {
    throw error;
  }
};

//GET ORGANIZATION BY ID
const getOrganizationById = async (userId: string, organizationId: string) => {
  try {
    const organization = await organizationRepository.getOrganizationByUser(
      userId,
      organizationId
    );

    if (!organization) {
      throw new AppError(
        messages.ORGANIZATION_ACCESS_DENIED,
        'ORGANIZATION_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    return organization;
  } catch (error) {
    throw error;
  }
};

export default {
  getOrganizations,
  getOrganizationById,
};

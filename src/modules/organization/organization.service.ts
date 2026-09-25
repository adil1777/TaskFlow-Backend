import { OrgRole } from '@prisma/client';

import organizationRepository from './organization.repository';

import { AppError } from '../../utils/error';
import statusCodes from '../../utils/statusCodes';
import messages from '../../utils/messages';

import { SystemRole } from '@prisma/client';
import {
  AddOrganizationMemeberInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationMemeberInput,
} from './organization.types';

const createOrganization = async (input: CreateOrganizationInput) => {
  try {
    // FIND ORGANIZATION ADMIN USER
    const user = await organizationRepository.findUserById(input.adminUserId);

    if (!user) {
      throw new AppError(
        messages.USER_NOT_FOUND,
        'USER_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    // SYSTEM ADMIN CANNOT BE ORG ADMIN
    if (user.systemRole === SystemRole.system_admin) {
      throw new AppError(
        messages.INVALID_ORGANIZATION_ADMIN,
        'INVALID_ORGANIZATION_ADMIN',
        statusCodes.BAD_REQUEST
      );
    }

    // CREATE ORGANIZATION + ADMIN
    const result = await organizationRepository.createOrganizationWithAdmin({
      organizationName: input.name,
      userId: user.id,
    });

    return {
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        createdAt: result.organization.createdAt,
      },

      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: result.membership.role,
      },
    };
  } catch (error) {
    throw error;
  }
};

//Get All Organizations
const getAllOrganizations = async () => {
  try {
    return await organizationRepository.findAllOrganizations();
  } catch (error) {
    throw error;
  }
};

// Get Organization by organizatin Id
const getOrganizationById = async (organizationId: string) => {
  try {
    const organization =
      await organizationRepository.findOrganizationWithDetails(organizationId);

    if (!organization) {
      throw new AppError(
        messages.ORGANIZATION_NOT_FOUND,
        'ORGANIZATION_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    return organization;
  } catch (error) {
    throw error;
  }
};

//Update Organization
const updateOrganization = async (
  organizationId: string,
  input: UpdateOrganizationInput
) => {
  try {
    const organization =
      await organizationRepository.findOrganizationById(organizationId);

    if (!organization) {
      throw new AppError(
        messages.ORGANIZATION_NOT_FOUND,
        'ORGANIZATION_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    return await organizationRepository.updateOrganization(organizationId, {
      name: input.name,
    });
  } catch (error) {
    throw error;
  }
};

//Delete Organization
const deleteOrganization = async (organizationId: string) => {
  try {
    const organization =
      await organizationRepository.findOrganizationById(organizationId);

    if (!organization) {
      throw new AppError(
        messages.ORGANIZATION_NOT_FOUND,
        'ORGANIZATION_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    return await organizationRepository.deleteOrganization(organizationId);
  } catch (error) {
    throw error;
  }
};

// Get Members
const getOrganizationMembers = async (organizationId: string) => {
  try {
    const organization =
      await organizationRepository.findOrganizationById(organizationId);

    if (!organization) {
      throw new AppError(
        messages.ORGANIZATION_NOT_FOUND,
        'ORGANIZATION_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    return await organizationRepository.findOrganizationMembers(organizationId);
  } catch (error) {
    throw error;
  }
};

// Add Member
const addOrganizationMember = async (
  organizationId: string,
  input: AddOrganizationMemeberInput
) => {
  try {
    const organization =
      await organizationRepository.findOrganizationById(organizationId);

    if (!organization) {
      throw new AppError(
        'Organization not found',
        'ORGANIZATION_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    const user = await organizationRepository.findUserById(input.userId);

    if (!user) {
      throw new AppError(
        messages.USER_NOT_FOUND,
        'USER_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    if (user.systemRole === SystemRole.system_admin) {
      throw new AppError(
        messages.INVALID_ORGANIZATION_MEMBER,
        'INVALID_ORGANIZATION_MEMBER',
        statusCodes.BAD_REQUEST
      );
    }

    const existingMembership = await organizationRepository.findMembership(
      organizationId,
      input.userId
    );

    if (existingMembership) {
      throw new AppError(
        'User is already a member of this organization',
        'MEMBERSHIP_EXISTS',
        statusCodes.CONFLICT
      );
    }

    return await organizationRepository.createMembership({
      organizationId,
      userId: input.userId,
      role: input.role ?? OrgRole.member,
    });
  } catch (error) {
    throw error;
  }
};

// Update Member Role
const updateOrganizationMember = async (
  organizationId: string,
  userId: string,
  input: UpdateOrganizationMemeberInput
) => {
  try {
    const membership = await organizationRepository.findMembership(
      organizationId,
      userId
    );

    if (!membership) {
      throw new AppError(
        'Organization member not found',
        'MEMBERSHIP_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    /*
     * Prevent removing the last organization admin.
     */
    if (
      membership.role === OrgRole.org_admin &&
      input.role === OrgRole.member
    ) {
      const adminCount =
        await organizationRepository.countOrganizationAdmins(organizationId);

      if (adminCount <= 1) {
        throw new AppError(
          'Organization must have at least one admin',
          'LAST_ORGANIZATION_ADMIN',
          statusCodes.BAD_REQUEST
        );
      }
    }

    return await organizationRepository.updateMembershipRole(
      organizationId,
      userId,
      input.role
    );
  } catch (error) {
    throw error;
  }
};

// Remove Member
const removeOrganizationMember = async (
  organizationId: string,
  userId: string
) => {
  try {
    const membership = await organizationRepository.findMembership(
      organizationId,
      userId
    );

    if (!membership) {
      throw new AppError(
        messages.ORGANIZATION_MEMBERSHIP_NOT_FOUND,
        'MEMBERSHIP_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    // Prevent removing the last organization admin.
    if (membership.role === OrgRole.org_admin) {
      const adminCount =
        await organizationRepository.countOrganizationAdmins(organizationId);

      if (adminCount <= 1) {
        throw new AppError(
          'Cannot remove the last organization admin',
          'LAST_ORGANIZATION_ADMIN',
          statusCodes.BAD_REQUEST
        );
      }
    }

    await organizationRepository.deleteMembership(organizationId, userId);

    return {
      userId,
      organizationId,
    };
  } catch (error) {
    throw error;
  }
};

export default {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,

  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember,
};

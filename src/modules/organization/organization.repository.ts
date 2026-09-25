import { OrgRole } from '@prisma/client';
import prisma from '../../db/prisma';

// FIND USER BY ID
const findUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      systemRole: true,
    },
  });
};

// CREATE ORGANIZATION + ADMIN
const createOrganizationWithAdmin = async (data: {
  organizationName: string;
  userId: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: data.organizationName,
      },
    });

    const membership = await tx.orgMember.create({
      data: {
        userId: data.userId,
        organizationId: organization.id,
        role: OrgRole.org_admin,
      },
    });

    return {
      organization,
      membership,
    };
  });
};

//Organization
const findOrganizationById = async (organizationId: string) => {
  return prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const findOrganizationWithDetails = async (organizationId: string) => {
  return prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    },
  });
};

const findAllOrganizations = async () => {
  return prisma.organization.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    },
  });
};

const updateOrganization = async (
  organizationId: string,
  data: {
    name: string;
  }
) => {
  return prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      name: data.name,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

//Delete Organization
const deleteOrganization = async (organizationId: string) => {
  return prisma.organization.delete({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

// Membership
const findMembership = async (organizationId: string, userId: string) => {
  return prisma.orgMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      role: true,
      createdAt: true,
    },
  });
};

const findOrganizationMembers = async (organizationId: string) => {
  return prisma.orgMember.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      role: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          systemRole: true,
        },
      },
    },
  });
};

const createMembership = async (data: {
  organizationId: string;
  userId: string;
  role: OrgRole;
}) => {
  return prisma.orgMember.create({
    data: {
      organizationId: data.organizationId,
      userId: data.userId,
      role: data.role,
    },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      role: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          systemRole: true,
        },
      },
    },
  });
};

const updateMembershipRole = async (
  organizationId: string,
  userId: string,
  role: OrgRole
) => {
  return prisma.orgMember.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: {
      role,
    },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      role: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          systemRole: true,
        },
      },
    },
  });
};

const deleteMembership = async (organizationId: string, userId: string) => {
  return prisma.orgMember.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });
};

const countOrganizationAdmins = async (organizationId: string) => {
  return prisma.orgMember.count({
    where: {
      organizationId,
      role: OrgRole.org_admin,
    },
  });
};

export default {
  findUserById,

  findOrganizationById,
  findOrganizationWithDetails,
  findAllOrganizations,
  updateOrganization,
  createOrganizationWithAdmin,
  deleteOrganization,

  findMembership,
  findOrganizationMembers,
  createMembership,
  updateMembershipRole,
  deleteMembership,
  countOrganizationAdmins,
};

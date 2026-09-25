import prisma from '../../db/prisma';
import { OrgRole } from '@prisma/client';

// FIND USER BY EMAIL
const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

//CREATE USER
const createUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      systemRole: 'user',
    },
  });
};

// FIND USER BY ID
const findUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      systemRole: true,
    },
  });
};

// FIND USER WITH MEMBERSHIPS
const findUserWithMemberships = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      memberships: {
        select: {
          id: true,
          organizationId: true,
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

// FIND USER BY ID WITH MEMBERSHIPS
const findUserWithMembershipsById = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      memberships: {
        select: {
          id: true,
          organizationId: true,
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

// FIND MEMBERSHIP
const findMembership = async (userId: string, organizationId: string) => {
  return prisma.orgMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    select: {
      organizationId: true,
      role: true,
    },
  });
};

// CREATE ORGANIZATION + ADMIN
const createOrganizationWithAdmin = async (data: {
  organizationName: string;
  name: string;
  email: string;
  passwordHash: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: data.organizationName,
      },
    });

    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        systemRole: 'user',
      },
    });

    await tx.orgMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: OrgRole.org_admin,
      },
    });

    return {
      user,
      organization,
    };
  });
};

// CREATE REFRESH TOKEN
const createRefreshToken = async (data: {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return prisma.refreshToken.create({
    data,
  });
};

// FIND REFRESH TOKEN
const findRefreshToken = async (tokenHash: string) => {
  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });
};

// REVOKE REFRESH TOKEN
const revokeRefreshToken = async (tokenHash: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export default {
  findUserByEmail,
  createUser,
  findUserById,
  findUserWithMemberships,
  findUserWithMembershipsById,
  findMembership,
  createOrganizationWithAdmin,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
};

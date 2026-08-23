import prisma from "../../db/prisma";
import { OrgRole } from "@prisma/client";

// Find user by email
const findUserByEmail = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Find user by email with memberships
const findUserWithMemberships = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        memberships: true,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Create organization + user + membership
const createOrganizationWithAdmin = async (data: {
  organizationName: string;
  name: string;
  email: string;
  passwordHash: string;
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
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
  } catch (error) {
    throw error;
  }
};

// Find user by ID with memberships
const findUserWithMembershipsById = async (
  userId: string
) => {
  try {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        memberships: true,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Create refresh token
const createRefreshToken = async (data: {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  try {
    return await prisma.refreshToken.create({
      data: {
        id: data.id,
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Find refresh token
const findRefreshToken = async (tokenHash: string) => {
  try {
    return await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Revoke refresh token
const revokeRefreshToken = async (tokenHash: string) => {
  try {
    return await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  } catch (error) {
    throw error;
  }
};

export default {
  findUserByEmail,
  findUserWithMemberships,
  createOrganizationWithAdmin,
  findUserWithMembershipsById,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
};
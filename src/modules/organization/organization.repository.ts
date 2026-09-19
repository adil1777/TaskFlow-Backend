import prisma from '../../db/prisma';

/**
 * Get all organizations where the user is a member.
 *
 * The user can only access organizations
 * they are associated with through OrgMember.
 */
const getOrganizationsByUser = async (userId: string) => {
  const memberships = await prisma.orgMember.findMany({
    where: {
      userId,
    },

    select: {
      role: true,

      organization: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },

    orderBy: {
      organization: {
        name: 'asc',
      },
    },
  });

  return memberships.map(({ organization, role }) => ({
    id: organization.id,
    name: organization.name,
    role,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  }));
};

/**
 * Get organization details for an authenticated user.
 *
 * Authorization:
 * The user must belong to the requested organization.

 */
const getOrganizationByUser = async (
  userId: string,
  organizationId: string
) => {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,

      /**
       * Multi-tenant authorization.
       *
       * The organization will only be returned
       * if the authenticated user is a member
       * of this organization.
       */
      members: {
        some: {
          userId,
        },
      },
    },

    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,

      /**
       * All members of this organization.
       *
       * This also allows us to determine:
       * - Current user's role
       * - Organization admins
       * - Other members
       */
      members: {
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true,

          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      },

      projects: {
        where: {
          deletedAt: null,
        },

        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      },

      _count: {
        select: {
          members: true,

          projects: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  if (!organization) {
    return null;
  }

  /**
   * Since the query already guarantees that
   * this user belongs to the organization,
   * find their membership from the fetched members.
   */
  const currentUserMembership = organization.members.find(
    (member) => member.userId === userId
  );

  return {
    id: organization.id,
    name: organization.name,

    // Current authenticated user's role
    role: currentUserMembership?.role,

    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,

    memberCount: organization._count.members,
    projectCount: organization._count.projects,

    members: organization.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      joinedAt: member.createdAt,
    })),

    projects: organization.projects,
  };
};

// Get a user's membership in a specific organization.
const getMembership = async (userId: string, organizationId: string) => {
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
    },
  });
};

export default {
  getOrganizationsByUser,
  getOrganizationByUser,
  getMembership,
};

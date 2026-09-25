import prisma from '../../db/prisma';

import {
  CreateProjectInput,
  PaginationInput,
  UpdateProjectInput,
} from './project.types';

// CREATE PROJECT
const createProject = async (
  organizationId: string,
  input: CreateProjectInput
) => {
  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      organizationId,
      managerId: input.managerId,
    },

    select: {
      id: true,
      organizationId: true,
      managerId: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,

      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

//GET PROJECTS
const findProjects = async (organizationId: string, query: PaginationInput) => {
  const { page, limit } = query;

  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    deletedAt: null,
  };

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        organizationId: true,
        managerId: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,

        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    }),

    prisma.project.count({
      where,
    }),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//FIND PROJECT
const findProjectById = async (projectId: string) => {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },

    select: {
      id: true,
      organizationId: true,
      managerId: true,
      name: true,
      description: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,

      organization: {
        select: {
          id: true,
          name: true,
        },
      },

      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
    },
  });
};

//UPDATE PROJECT
const updateProject = async (projectId: string, input: UpdateProjectInput) => {
  return prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      ...(input.name !== undefined && {
        name: input.name,
      }),

      ...(input.description !== undefined && {
        description: input.description,
      }),

      ...(input.managerId !== undefined && {
        managerId: input.managerId,
      }),
    },

    select: {
      id: true,
      organizationId: true,
      managerId: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,

      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

// SOFT DELETE
const softDeleteProject = async (projectId: string) => {
  return prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      deletedAt: new Date(),
    },
  });
};

//PROJECT MEMBER
const findProjectMember = async (projectId: string, userId: string) => {
  return prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },

    select: {
      id: true,
      projectId: true,
      userId: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const findProjectMembers = async (projectId: string) => {
  return prisma.projectMember.findMany({
    where: {
      projectId,
    },

    orderBy: {
      createdAt: 'asc',
    },

    select: {
      id: true,
      projectId: true,
      userId: true,
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

const createProjectMember = async (projectId: string, userId: string) => {
  return prisma.projectMember.create({
    data: {
      projectId,
      userId,
    },

    select: {
      id: true,
      projectId: true,
      userId: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const deleteProjectMember = async (projectId: string, userId: string) => {
  return prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};

export default {
  createProject,
  findProjects,
  findProjectById,
  updateProject,
  softDeleteProject,

  findProjectMember,
  findProjectMembers,
  createProjectMember,
  deleteProjectMember,
};

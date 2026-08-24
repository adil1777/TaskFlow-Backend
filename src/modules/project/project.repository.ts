import prisma from "../../db/prisma";

import {
  CreateProjectInput,
  PaginationInput,
  UpdateProjectInput,
} from "./project.types";

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
    },
  });
};

// GET PROJECTS
const findProjects = async (
  organizationId: string,
  query: PaginationInput
) => {
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
        createdAt: "desc",
      },
    }),

    prisma.project.count({
      where,
    }),
  ]);

  return {
    projects,
    total,
    page,
    limit,
  };
};

// FIND PROJECT BY ID
const findProjectById = async (
  projectId: string
) => {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });
};

// UPDATE PROJECT
const updateProject = async (
  projectId: string,
  input: UpdateProjectInput
) => {
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
    },
  });
};

// DELETE PROJECT
const softDeleteProject = async (
  projectId: string
) => {
  return prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      deletedAt: new Date(),
    },
  });
};

export default {
  createProject,
  findProjects,
  findProjectById,
  updateProject,
  softDeleteProject,
};
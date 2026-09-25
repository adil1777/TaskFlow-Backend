import { AppError } from '../../utils/error';
import messages from '../../utils/messages';
import statusCodes from '../../utils/statusCodes';

import projectRepository from './project.repository';

import prisma from '../../db/prisma';
import {
  addProjectMemberInput,
  CreateProjectInput,
  PaginationInput,
  UpdateProjectInput,
} from './project.types';

// CREATE PROJECT
const createProject = async (
  organizationId: string,
  input: CreateProjectInput
) => {
  try {
    if (input.managerId) {
      await validateOrganizationUser(organizationId, input.managerId);
    }

    return await projectRepository.createProject(organizationId, input);
  } catch (error) {
    throw error;
  }
};

//GET PROJECTS
const getProjects = async (organizationId: string, query: PaginationInput) => {
  try {
    return await projectRepository.findProjects(organizationId, query);
  } catch (error) {
    throw error;
  }
};

//GET PROJECT BY ID
const getProjectById = async (organizationId: string, projectId: string) => {
  try {
    return await getAuthorizedProject(organizationId, projectId);
  } catch (error) {
    throw error;
  }
};

// UPDATE PROJECT
const updateProject = async (
  organizationId: string,
  projectId: string,
  input: UpdateProjectInput
) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    if (input.managerId) {
      await validateOrganizationUser(organizationId, input.managerId);
    }

    return await projectRepository.updateProject(projectId, input);
  } catch (error) {
    throw error;
  }
};

//DELETE PROJECT
const deleteProject = async (organizationId: string, projectId: string) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    await projectRepository.softDeleteProject(projectId);
  } catch (error) {
    throw error;
  }
};

// GET PROJECT MEMBERS
const getProjectMembers = async (organizationId: string, projectId: string) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    return await projectRepository.findProjectMembers(projectId);
  } catch (error) {
    throw error;
  }
};

//ADD PROJECT MEMBER
const addProjectMember = async (
  organizationId: string,
  projectId: string,
  input: addProjectMemberInput
) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    await validateOrganizationUser(organizationId, input.userId);

    const existingMember = await projectRepository.findProjectMember(
      projectId,
      input.userId
    );

    if (existingMember) {
      throw new AppError(
        'User is already a project member',
        'PROJECT_MEMBER_EXISTS',
        statusCodes.CONFLICT
      );
    }

    return await projectRepository.createProjectMember(projectId, input.userId);
  } catch (error) {
    throw error;
  }
};

//REMOVE PROJECT MEMBER
const removeProjectMember = async (
  organizationId: string,
  projectId: string,
  userId: string
) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    const member = await projectRepository.findProjectMember(projectId, userId);

    if (!member) {
      throw new AppError(
        'Project member not found',
        'PROJECT_MEMBER_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    await projectRepository.deleteProjectMember(projectId, userId);

    return {
      projectId,
      userId,
    };
  } catch (error) {
    throw error;
  }
};

// AUTHORIZED PROJECT
const getAuthorizedProject = async (
  organizationId: string,
  projectId: string
) => {
  try {
    const project = await projectRepository.findProjectById(projectId);

    if (!project || project.deletedAt) {
      throw new AppError(
        messages.PROJECT_NOT_FOUND,
        'PROJECT_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    if (project.organizationId !== organizationId) {
      throw new AppError(
        'You do not have access to this project',
        'PROJECT_ACCESS_DENIED',
        statusCodes.FORBIDDEN
      );
    }

    return project;
  } catch (error) {
    throw error;
  }
};

//VALIDATE USER BELONGS TO ORGANIZATION
const validateOrganizationUser = async (
  organizationId: string,
  userId: string
) => {
  const membership = await prisma.orgMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },

    select: {
      userId: true,
      organizationId: true,
      role: true,
    },
  });

  if (!membership) {
    throw new AppError(
      'User does not belong to this organization',
      'USER_NOT_IN_ORGANIZATION',
      statusCodes.BAD_REQUEST
    );
  }

  return membership;
};

export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,

  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};

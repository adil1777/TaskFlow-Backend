import { AppError } from "../../utils/error";
import messages from "../../utils/messages";
import statusCodes from "../../utils/statusCodes";

import projectRepository from "./project.repository";

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
  try {
    return await projectRepository.createProject(
      organizationId,
      input
    );
  } catch (error) {
    throw error;
  }
};

// GET PROJECTS
const getProjects = async (
  organizationId: string,
  query: PaginationInput
) => {
  try {
    return await projectRepository.findProjects(
      organizationId,
      query
    );
  } catch (error) {
    throw error;
  }
};

// GET PROJECT BY ID
const getProjectById = async (
  organizationId: string,
  projectId: string
) => {
  try {
    return await getAuthorizedProject(
      organizationId,
      projectId
    );
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
    await getAuthorizedProject(
      organizationId,
      projectId
    );

    return await projectRepository.updateProject(
      projectId,
      input
    );
  } catch (error) {
    throw error;
  }
};

// DELETE PROJECT
const deleteProject = async (
  organizationId: string,
  projectId: string
) => {
  try {
    await getAuthorizedProject(
      organizationId,
      projectId
    );

    await projectRepository.softDeleteProject(
      projectId
    );

  } catch (error) {
    throw error;
  }
};

// AUTHORIZATION CHECK
const getAuthorizedProject = async (
  organizationId: string,
  projectId: string
) => {
  try {
    const project =
      await projectRepository.findProjectById(
        projectId
      );

    if (!project || project.deletedAt) {
      throw new AppError(
        messages.PROJECT_NOT_FOUND,
        "PROJECT_NOT_FOUND",
        statusCodes.BAD_REQUEST
      );
    }

    if (
      project.organizationId !== organizationId
    ) {
      throw new AppError(
        "You do not have access to this project",
        "FORBIDDEN",
         statusCodes.FORBIDDEN
      );
    }

    return project;
  } catch (error) {
    throw error;
  }
};

export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
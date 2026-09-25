import { Request, Response, NextFunction } from 'express';

import projectService from './project.service';

import statusCodes from '../../utils/statusCodes';
import messages from '../../utils/messages';

//CREATE PROJECT
const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const project = await projectService.createProject(
      user.organizationId as string,
      req.body
    );

    return res.status(statusCodes.CREATED).json({
      success: true,
      message: messages.PROJECT_CREATED,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

//GET PROJECTS
const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const result = await projectService.getProjects(
      user.organizationId as string,
      {
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 20),
      }
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.PROJECTS_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//GET PROJECT
const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const project = await projectService.getProjectById(
      user.organizationId as string,
      req.params.id as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PROJECT
const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const project = await projectService.updateProject(
      user.organizationId as string,
      req.params.id as string,
      req.body
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.PROJECT_UPDATED,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE PROJECT
const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    await projectService.deleteProject(
      user.organizationId as string,
      req.params.id as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: messages.PROJECT_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

// GET PROJECT MEMBERS
const getProjectMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const members = await projectService.getProjectMembers(
      user.organizationId as string,
      req.params.id as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

//ADD PROJECT MEMBER
const addProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const member = await projectService.addProjectMember(
      user.organizationId as string,
      req.params.id as string,
      req.body
    );

    return res.status(statusCodes.CREATED).json({
      success: true,
      message: 'Project member added successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

//REMOVE PROJECT MEMBER
const removeProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const result = await projectService.removeProjectMember(
      user.organizationId as string,
      req.params.id as string,
      req.params.userId as string
    );

    return res.status(statusCodes.OK).json({
      success: true,
      message: 'Project member removed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
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

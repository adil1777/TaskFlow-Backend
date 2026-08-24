import {
  Request,
  Response,
  NextFunction,
} from "express";

import  projectService from "./project.service";
import statusCodes from "../../utils/statusCodes";
import { CreateProjectInput, PaginationInput, ProjectIdInput, UpdateProjectInput } from "./project.types";
import messages from "../../utils/messages";


//CREATE PROJECT
const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
    const user = req.user!;

    const project =
      await projectService.createProject(
        user.organizationId,
        req.body
      );

    res.status(statusCodes.CREATED).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

//GET PROJECT
const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await projectService.getProjects(
      user.organizationId,
       {
          page,
          limit,
        }
    );

    res.status(statusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//GET PROJECT BY ID
const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
    const user = req.user!;

    const project =
      await projectService.getProjectById(
        user.organizationId,
        req.params.id as string
      );

    res.status(statusCodes.OK).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

//UPDATE PROJECT
const  updateProject = async(
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
   const user = req.user!;
   
    const project =
      await projectService.updateProject(
        user.organizationId,
        req.params.id as string ,
        req.body
      );

    res.status(statusCodes.OK).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};


//DELET PROJECT
const  deleteProject = async (
    req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
    const user = req.user!;

      await projectService.deleteProject(
        user.organizationId,
        req.params.id as string
      );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.PROJECT_DELETED,
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
    deleteProject
};
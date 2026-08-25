import { Request, Response, NextFunction } from 'express';

import taskService from './task.service';
import statusCodes from '../../utils/statusCodes';
import messages from '../../utils/messages';
import { TaskFilterInput } from './task.types';
import { taskFilterSchema } from './task.validation';
import { parseTaskFilters } from '../../utils/task.parser';

//CREATE TASK
const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const task = await taskService.createTask(
      user.organizationId,
      req.params.projectId as string,
      req.body
    );

    res.status(statusCodes.CREATED).json({
      success: true,
      message: messages.TASK_CREATED_SUCCESS,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

//GET TASKS WITH FILTERS
const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const filters = parseTaskFilters(req.query);

    const result = await taskService.getTasks(
      user.organizationId,
      req.params.projectId as string,
      filters
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.TASKS_FETCHED,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

//GET TASK BY ID
const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const task = await taskService.getTaskById(
      user.organizationId,
      req.params.id as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.TASK_FETCHED,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

//UPDATE TASK
const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const task = await taskService.updateTask(
      user.organizationId,
      req.params.id as string,
      req.body
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.TASK_UPDATED,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE TASK
const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const result = await taskService.deleteTask(
      user.organizationId,
      req.params.id as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.TASK_DELETED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//ASSIGN TASK
const assignTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const assignment = await taskService.assignTask(
      user.organizationId,
      req.params.id as string,
      user.id,
      req.body
    );

    res.status(statusCodes.CREATED).json({
      success: true,
      message: messages.TASK_ASSIGNED,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

//UNASSIGNED TASK
const unassignTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    await taskService.unassignTask(
      user.organizationId,
      req.params.id as string,
      req.params.userId as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.TASK_UNASSIGNED,
    });
  } catch (error) {
    next(error);
  }
};

//PROJECT DASHBOARD with task counts grouped by status
const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const dashboard = await taskService.getProjectDashboard(
      user.organizationId,
      req.params.projectId as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getDashboard,
};

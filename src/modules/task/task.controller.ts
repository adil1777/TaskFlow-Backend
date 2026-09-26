import { Request, Response, NextFunction } from 'express';

import taskService from './task.service';
import { taskFilterSchema } from './task.validation';

import statusCodes from '../../utils/statusCodes';
import messages from '../../utils/messages';
import { AppError } from '../../utils/error';

const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const task = await taskService.createTask(
      user.organizationId!,
      req.params.projectId as string,
      user.id,
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

const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const parsed = taskFilterSchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? 'Invalid task filters',
        'VALIDATION_ERROR',
        statusCodes.BAD_REQUEST
      );
    }

    const result = await taskService.getTasks(
      user.organizationId!,
      req.params.projectId as string,
      user.id,
      parsed.data
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.TASKS_FETCHED,

      data: result.data,

      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const task = await taskService.getTaskById(
      user.organizationId!,
      req.params.id as string,
      user.id
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

const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const task = await taskService.updateTask(
      user.organizationId!,
      req.params.id as string,
      user.id,
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

const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const result = await taskService.deleteTask(
      user.organizationId!,
      req.params.id as string,
      user.id
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

const assignTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const result = await taskService.assignTask(
      user.organizationId!,
      req.params.id as string,
      user.id,
      req.body
    );

    res.status(statusCodes.CREATED).json({
      success: true,
      message: messages.TASK_ASSIGNED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const unassignTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    await taskService.unassignTask(
      user.organizationId!,
      req.params.id as string,
      req.params.userId as string,
      user.id
    );

    res.status(statusCodes.OK).json({
      success: true,
      message: messages.TASK_UNASSIGNED,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const history = await taskService.getTaskHistory(
      user.organizationId!,
      req.params.id as string,
      user.id
    );

    res.status(statusCodes.OK).json({
      success: true,
      data: history,
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

  getTaskHistory,
};

import { OrgRole, Prisma } from '@prisma/client';

import { notificationQueue } from '../../queues/notification.queue';

import { AppError } from '../../utils/error';
import messages from '../../utils/messages';
import statusCodes from '../../utils/statusCodes';

import taskRepository from './task.repository';

import {
  AssignTaskInput,
  CreateTaskInput,
  TaskFilterInput,
  UpdateTaskInput,
} from './task.types';

// AUTHORIZED PROJECT
const getAuthorizedProject = async (
  organizationId: string,
  projectId: string,
  userId: string,
  requireManagement = false
) => {
  try {
    const project = await taskRepository.findProjectForAccess(
      organizationId,
      projectId,
      userId
    );

    if (!project) {
      throw new AppError(
        messages.PROJECT_NOT_FOUND,
        'PROJECT_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    const organizationMember = await taskRepository.findOrganizationMember(
      organizationId,
      userId
    );

    const isOrgAdmin = organizationMember?.role === OrgRole.org_admin;

    const isProjectManager = project.managerId === userId;

    const isProjectMember = project.members.some(
      (member) => member.userId === userId
    );

    if (requireManagement) {
      if (!isOrgAdmin && !isProjectManager) {
        throw new AppError(
          'You do not have permission to manage this project',
          'PROJECT_MANAGEMENT_FORBIDDEN',
          statusCodes.FORBIDDEN
        );
      }
    } else {
      if (!isOrgAdmin && !isProjectManager && !isProjectMember) {
        throw new AppError(
          'You are not a member of this project',
          'PROJECT_ACCESS_FORBIDDEN',
          statusCodes.FORBIDDEN
        );
      }
    }

    return {
      project,
      isOrgAdmin,
      isProjectManager,
      isProjectMember,
    };
  } catch (error) {
    throw error;
  }
};

// AUTHORIZED TASK
const getAuthorizedTask = async (
  organizationId: string,
  taskId: string,
  userId: string
) => {
  try {
    const task = await taskRepository.findTaskById(taskId);

    if (!task || task.deletedAt) {
      throw new AppError(
        messages.TASK_NOT_FOUND,
        'TASK_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    if (task.project.organizationId !== organizationId) {
      throw new AppError(
        'You do not have access to this task',
        'FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    const projectAccess = await getAuthorizedProject(
      organizationId,
      task.project.id,
      userId
    );

    return {
      task,
      ...projectAccess,
    };
  } catch (error) {
    throw error;
  }
};

// CREATE TASK
const createTask = async (
  organizationId: string,
  projectId: string,
  userId: string,
  input: CreateTaskInput
) => {
  try {
    await getAuthorizedProject(organizationId, projectId, userId, true);

    return taskRepository.createTask(projectId, userId, input);
  } catch (error) {
    throw error;
  }
};

// GET TASKS
const getTasks = async (
  organizationId: string,
  projectId: string,
  userId: string,
  filters: TaskFilterInput
) => {
  try {
    await getAuthorizedProject(organizationId, projectId, userId);

    return taskRepository.findTasks(projectId, filters);
  } catch (error) {
    throw error;
  }
};

// GET TASK BY ID
const getTaskById = async (
  organizationId: string,
  taskId: string,
  userId: string
) => {
  try {
    const { task } = await getAuthorizedTask(organizationId, taskId, userId);

    return task;
  } catch (error) {
    throw error;
  }
};

// UPDATE TASK
const updateTask = async (
  organizationId: string,
  taskId: string,
  userId: string,
  input: UpdateTaskInput
) => {
  try {
    const { task, isOrgAdmin, isProjectManager } = await getAuthorizedTask(
      organizationId,
      taskId,
      userId
    );

    const canManageTask = isOrgAdmin || isProjectManager;

    if (!canManageTask) {
      const isAssigned = task.assignments.some(
        (assignment) => assignment.user.id === userId
      );

      if (!isAssigned) {
        throw new AppError(
          'You do not have permission to update this task',
          'TASK_UPDATE_FORBIDDEN',
          statusCodes.FORBIDDEN
        );
      }

      /*
       * Normal project members who are assigned
       * to a task can update only its status.
       */
      const hasRestrictedChanges =
        input.title !== undefined ||
        input.description !== undefined ||
        input.priority !== undefined ||
        input.dueDate !== undefined;

      if (hasRestrictedChanges) {
        throw new AppError(
          'Assigned users can only update task status',
          'TASK_UPDATE_FORBIDDEN',
          statusCodes.FORBIDDEN
        );
      }
    }

    const updatedTask = await taskRepository.updateTask(taskId, userId, input);

    if (!updatedTask) {
      throw new AppError(
        messages.TASK_NOT_FOUND,
        'TASK_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    return updatedTask;
  } catch (error) {
    throw error;
  }
};

// DELETE TASK
const deleteTask = async (
  organizationId: string,
  taskId: string,
  userId: string
) => {
  try {
    const { isOrgAdmin, isProjectManager } = await getAuthorizedTask(
      organizationId,
      taskId,
      userId
    );

    if (!isOrgAdmin && !isProjectManager) {
      throw new AppError(
        'You do not have permission to delete this task',
        'TASK_DELETE_FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    await taskRepository.softDeleteTask(taskId, userId);

    return {
      id: taskId,
    };
  } catch (error) {
    throw error;
  }
};

// ASSIGN TASK
const assignTask = async (
  organizationId: string,
  taskId: string,
  assignedById: string,
  input: AssignTaskInput
) => {
  try {
    const { task, isOrgAdmin, isProjectManager } = await getAuthorizedTask(
      organizationId,
      taskId,
      assignedById
    );

    if (!isOrgAdmin && !isProjectManager) {
      throw new AppError(
        'You do not have permission to assign tasks',
        'TASK_ASSIGN_FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    /*
     * Assignee must be an explicit project member.
     */
    const projectMember = await taskRepository.findProjectMember(
      task.project.id,
      organizationId,
      input.assigneeId
    );

    if (!projectMember) {
      throw new AppError(
        'User must be a member of the project before being assigned a task',
        'USER_NOT_PROJECT_MEMBER',
        statusCodes.FORBIDDEN
      );
    }

    const existingAssignment = await taskRepository.findAssignment(
      taskId,
      input.assigneeId
    );

    if (existingAssignment) {
      throw new AppError(
        'Task is already assigned to this user',
        'TASK_ALREADY_ASSIGNED',
        statusCodes.CONFLICT
      );
    }

    let assignment;

    try {
      assignment = await taskRepository.createAssignment(
        taskId,
        input.assigneeId,
        assignedById
      );
    } catch (error) {
      /*
       * Database unique constraint is the final
       * protection against concurrent duplicate requests.
       */
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(
          'Task is already assigned to this user',
          'TASK_ALREADY_ASSIGNED',
          statusCodes.CONFLICT
        );
      }

      throw error;
    }

    /*
     * Assignment is already committed.
     *
     * Notification is asynchronous and should not
     * invalidate the business operation.
     */
    try {
      const job = await notificationQueue.add(
        'task-assigned',
        {
          assignmentId: assignment.id,
          taskId: assignment.task.id,
          taskTitle: assignment.task.title,
          userId: assignment.user.id,
          userEmail: assignment.user.email,
          userName: assignment.user.name,
          assignedBy: assignedById,
        },
        {
          attempts: 5,

          backoff: {
            type: 'exponential',
            delay: 2000,
          },

          removeOnComplete: 100,
          removeOnFail: false,
        }
      );

      return {
        assignment,
        jobId: job.id,
      };
    } catch (error) {
      /*
       * Do not rollback assignment.
       * Notification can be retried/recovered separately.
       */
      console.error('[TASK_ASSIGNMENT] Failed to enqueue notification', {
        assignmentId: assignment.id,
        taskId,
        error,
      });

      return {
        assignment,
        jobId: null,
      };
    }
  } catch (error) {
    throw error;
  }
};

// UNASSIGN TASK
const unassignTask = async (
  organizationId: string,
  taskId: string,
  assigneeId: string,
  removedById: string
) => {
  try {
    const { isOrgAdmin, isProjectManager } = await getAuthorizedTask(
      organizationId,
      taskId,
      removedById
    );

    if (!isOrgAdmin && !isProjectManager) {
      throw new AppError(
        'You do not have permission to unassign tasks',
        'TASK_UNASSIGN_FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    const assignment = await taskRepository.findAssignment(taskId, assigneeId);

    if (!assignment) {
      throw new AppError(
        messages.ASSIGNMENT_NOT_FOUND,
        'ASSIGNMENT_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    await taskRepository.deleteAssignment(taskId, assigneeId, removedById);
  } catch (error) {
    throw error;
  }
};

// TASK HISTORY
const getTaskHistory = async (
  organizationId: string,
  taskId: string,
  userId: string
) => {
  try {
    await getAuthorizedTask(organizationId, taskId, userId);

    return taskRepository.findTaskHistory(taskId);
  } catch (error) {
    throw error;
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
  getAuthorizedProject,
};

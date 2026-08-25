import { notificationQueue } from '../../queues/notification.queue';
import { AppError } from '../../utils/error';
import messages from '../../utils/messages';
import statusCodes from '../../utils/statusCodes';
import taskRepository from './task.repository';

import {
  CreateTaskInput,
  TaskFilterInput,
  UpdateTaskInput,
  AssignTaskInput,
} from './task.types';

// CREATE TASK
const createTask = async (
  organizationId: string,
  projectId: string,
  input: CreateTaskInput
) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    return await taskRepository.createTask(projectId, input);
  } catch (error) {
    throw error;
  }
};

// GET TASKS
const getTasks = async (
  organizationId: string,
  projectId: string,
  filters: TaskFilterInput
) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    return await taskRepository.findTasks(projectId, filters);
  } catch (error) {
    throw error;
  }
};

// GET TASK BY ID
const getTaskById = async (organizationId: string, taskId: string) => {
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

    return task;
  } catch (error) {
    throw error;
  }
};

// UPDATE TASK
const updateTask = async (
  organizationId: string,
  taskId: string,
  input: UpdateTaskInput
) => {
  try {
    await getTaskById(organizationId, taskId);

    return await taskRepository.updateTask(taskId, input);
  } catch (error) {
    throw error;
  }
};

// DELETE TASK
const deleteTask = async (organizationId: string, taskId: string) => {
  try {
    await getTaskById(organizationId, taskId);

    await taskRepository.softDeleteTask(taskId);

    return {
      message: messages.TASK_DELETED,
    };
  } catch (error) {
    throw error;
  }
};

// ASSIGN TASK
const assignTask = async (
  organizationId: string,
  taskId: string,
  assignedBy: string,
  input: AssignTaskInput
) => {
  //Verify task belongs to organization
  await getTaskById(organizationId, taskId);

  // Verify assignee belongs to organization
  const member = await taskRepository.findOrganizationMember(
    organizationId,
    input.assigneeId
  );

  if (!member) {
    throw new AppError(
      'User does not belong to this organization',
      'USER_NOT_IN_ORGANIZATION',
      statusCodes.FORBIDDEN
    );
  }

  // Persist assignment
  const assignment = await taskRepository.createAssignment(
    taskId,
    input.assigneeId
  );

  try {
    // Enqueue notification
    const job = await notificationQueue.add('task-assigned', {
      assignmentId: assignment.id,

      taskId: assignment.task.id,

      taskTitle: assignment.task.title,

      userId: assignment.user.id,

      userEmail: assignment.user.email,

      userName: assignment.user.name,

      assignedBy,
    });

    // Both operations succeeded
    return {
      assignment,
      jobId: job.id,
    };
  } catch (error) {
    //Queue failed → rollback DB assignment
    try {
      await taskRepository.deleteAssignment(assignment.id, input.assigneeId);
    } catch (rollbackError) {
      console.error('[ASSIGNMENT] Failed to rollback assignment', {
        assignmentId: assignment.id,
        rollbackError,
      });
    }

    throw new AppError(
      'Failed to queue task notification',
      'NOTIFICATION_QUEUE_FAILED',
      statusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// UNASSIGN TASK
const unassignTask = async (
  organizationId: string,
  taskId: string,
  assigneeId: string
) => {
  try {
    await getTaskById(organizationId, taskId);

    const assignment = await taskRepository.findAssignment(taskId, assigneeId);

    if (!assignment) {
      throw new AppError(
        messages.ASSIGNMENT_NOT_FOUND,
        'ASSIGNMENT_NOT_FOUND',
        statusCodes.BAD_REQUEST
      );
    }

    await taskRepository.deleteAssignment(taskId, assigneeId);
  } catch (error) {
    throw error;
  }
};

// PROJECT DASHBOARD
const getProjectDashboard = async (
  organizationId: string,
  projectId: string
) => {
  try {
    await getAuthorizedProject(organizationId, projectId);

    const result = await taskRepository.getTaskDashboard(projectId);

    const dashboard = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    for (const item of result) {
      dashboard[item.status] = item._count._all;
    }

    return dashboard;
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
    const project = await taskRepository.findProjectById(projectId);

    if (!project || project.deletedAt) {
      throw new AppError(
        'Project not found',
        'PROJECT_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    if (project.organizationId !== organizationId) {
      throw new AppError(
        'You do not have access to this project',
        'FORBIDDEN',
        403
      );
    }

    return project;
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
  getProjectDashboard,
};

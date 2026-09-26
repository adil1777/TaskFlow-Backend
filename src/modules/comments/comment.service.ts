import { OrgRole } from '@prisma/client';

import { AppError } from '../../utils/error';
import messages from '../../utils/messages';
import statusCodes from '../../utils/statusCodes';

import { createCommentInput, updateCommentInput } from './comment.types';

import commentRepository from './comment.repository';
import taskRepository from '../task/task.repository';

// CREATE COMMENT
const createComment = async (
  organizationId: string,
  userId: string,
  taskId: string,
  input: createCommentInput
) => {
  try {
    await getAuthorizedTask(organizationId, taskId, userId);

    return await commentRepository.createComment(taskId, userId, input.content);
  } catch (error) {
    throw error;
  }
};

// GET COMMENTS
const getComments = async (
  organizationId: string,
  taskId: string,
  userId: string
) => {
  try {
    await getAuthorizedTask(organizationId, taskId, userId);

    return await commentRepository.findCommentsByTaskId(taskId);
  } catch (error) {
    throw error;
  }
};

// UPDATE COMMENT
const updateComment = async (
  organizationId: string,
  userId: string,
  commentId: string,
  input: updateCommentInput
) => {
  try {
    const comment = await getAuthorizedComment(
      organizationId,
      commentId,
      userId
    );

    // Only comment owner can update
    if (comment.user.id !== userId) {
      throw new AppError(
        'You can only edit your own comments',
        'COMMENT_OWNER_REQUIRED',
        statusCodes.FORBIDDEN
      );
    }

    return await commentRepository.updateComment(commentId, input.content);
  } catch (error) {
    throw error;
  }
};

// DELETE COMMENT
const deleteComment = async (
  organizationId: string,
  userId: string,
  commentId: string
) => {
  try {
    const comment = await getAuthorizedComment(
      organizationId,
      commentId,
      userId
    );

    // Only comment owner can delete
    if (comment.user.id !== userId) {
      throw new AppError(
        'You can only delete your own comments',
        'COMMENT_OWNER_REQUIRED',
        statusCodes.FORBIDDEN
      );
    }

    await commentRepository.deleteComment(commentId);

    return {
      id: commentId,
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
    const task = await taskRepository.findTaskWithOrganization(taskId);

    if (!task || task.deletedAt) {
      throw new AppError(
        messages.TASK_NOT_FOUND,
        'TASK_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    // Organization isolation.
    if (task.project.organizationId !== organizationId) {
      throw new AppError(
        'You do not have access to this task',
        'FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    // Get organization membership.
    const organizationMember = await taskRepository.findOrganizationMember(
      organizationId,
      userId
    );

    if (!organizationMember) {
      throw new AppError(
        'You are not a member of this organization',
        'ORGANIZATION_ACCESS_FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    /*
     * Organization admin has access
     * to all projects in the organization.
     */
    if (organizationMember.role === OrgRole.org_admin) {
      return task;
    }

    // Project manager has access.
    if (task.project.managerId === userId) {
      return task;
    }

    // Project member has access.
    const projectMember = await taskRepository.findProjectMember(
      task.project.id,
      organizationId,
      userId
    );

    if (!projectMember) {
      throw new AppError(
        'You are not a member of this project',
        'PROJECT_ACCESS_FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    return task;
  } catch (error) {
    throw error;
  }
};

// AUTHORIZED COMMENT
const getAuthorizedComment = async (
  organizationId: string,
  commentId: string,
  userId: string
) => {
  try {
    const comment = await commentRepository.findCommentById(commentId);

    if (!comment) {
      throw new AppError(
        messages.COMMENT_NOT_FOUND,
        'COMMENT_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    // Organization isolation
    if (comment.task.project.organizationId !== organizationId) {
      throw new AppError(
        'You do not have access to this comment',
        'FORBIDDEN',
        statusCodes.FORBIDDEN
      );
    }

    // Comment belongs to an active task
    if (comment.task.deletedAt) {
      throw new AppError(
        messages.TASK_NOT_FOUND,
        'TASK_NOT_FOUND',
        statusCodes.NOT_FOUND
      );
    }

    //Verify project/task access
    await getAuthorizedTask(organizationId, comment.taskId, userId);

    return comment;
  } catch (error) {
    throw error;
  }
};

export default {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};

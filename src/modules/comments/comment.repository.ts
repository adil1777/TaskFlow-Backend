import prisma from '../../db/prisma';
import { TaskHistoryAction } from '@prisma/client';

// CREATE COMMENT
const createComment = async (
  taskId: string,
  userId: string,
  content: string
) => {
  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        taskId,
        userId,
        content,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await tx.taskHistory.create({
      data: {
        taskId,
        userId,
        action: TaskHistoryAction.comment_added,
        newValue: {
          commentId: comment.id,
        },
      },
    });

    return comment;
  });
};

// GET COMMENTS
const findCommentsByTaskId = async (taskId: string) => {
  return prisma.comment.findMany({
    where: {
      taskId,
    },

    select: {
      id: true,
      taskId: true,
      userId: true,
      content: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: 'asc',
    },
  });
};

// GET COMMENT BY ID
const findCommentById = async (commentId: string) => {
  return prisma.comment.findUnique({
    where: {
      id: commentId,
    },

    select: {
      id: true,
      taskId: true,
      userId: true,
      content: true,
      createdAt: true,
      updatedAt: true,

      task: {
        select: {
          id: true,
          deletedAt: true,

          project: {
            select: {
              id: true,
              organizationId: true,
              managerId: true,
              deletedAt: true,
            },
          },
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

// UPDATE COMMENT
const updateComment = async (commentId: string, content: string) => {
  return prisma.comment.update({
    where: {
      id: commentId,
    },

    data: {
      content,
    },

    select: {
      id: true,
      taskId: true,
      userId: true,
      content: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

// DELETE COMMENT
const deleteComment = async (commentId: string) => {
  return prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
};

export default {
  createComment,
  findCommentsByTaskId,
  findCommentById,
  updateComment,
  deleteComment,
};

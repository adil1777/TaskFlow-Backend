import prisma from '../../db/prisma';

// CREATE COMMENT
const createComment = async (
  taskId: string,
  userId: string,
  content: string
) => {
  return prisma.comment.create({
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
};

// GET COMMENTS
const findCommentsByTaskId = async (taskId: string) => {
  return prisma.comment.findMany({
    where: {
      taskId,
    },

    include: {
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

    include: {
      task: {
        include: {
          project: {
            select: {
              organizationId: true,
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

    include: {
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

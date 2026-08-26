import { Priority, Status } from '@prisma/client';
import prisma from '../../db/prisma';
import {
  CreateTaskInput,
  TaskFilterInput,
  UpdateTaskInput,
} from './task.types';

// CREATE TASK
const createTask = async (projectId: string, input: CreateTaskInput) => {
  return prisma.task.create({
    data: {
      projectId,
      title: input.title,
      description: input.description,
      status: input.status ?? Status.todo,
      priority: input.priority ?? Priority.medium,
      dueDate: input.dueDate,
    },
  });
};

// GET TASKS
const findTasks = async (projectId: string, filters: TaskFilterInput) => {
  const { page, limit, status, priority, assignee, dueDateFrom, dueDateTo } =
    filters;

  const skip = (page - 1) * limit;

  const where = {
    projectId,
    deletedAt: null,

    ...(status && {
      status,
    }),

    ...(priority && {
      priority,
    }),

    ...(assignee && {
      assignments: {
        some: {
          userId: assignee,
        },
      },
    }),

    ...((dueDateFrom || dueDateTo) && {
      dueDate: {
        ...(dueDateFrom && {
          gte: dueDateFrom,
        }),

        ...(dueDateTo && {
          lte: dueDateTo,
        }),
      },
    }),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,

      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      skip,
      take: limit,
    }),

    prisma.task.count({
      where,
    }),
  ]);

  return {
    data: tasks,
    total,
    page,
    limit,
  };
};

// FIND TASK BY ID
const findTaskById = async (taskId: string) => {
  return prisma.task.findUnique({
    where: {
      id: taskId,
    },

    include: {
      project: true,

      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

// UPDATE TASK
const updateTask = async (taskId: string, input: UpdateTaskInput) => {
  return prisma.task.update({
    where: {
      id: taskId,
    },

    data: {
      ...(input.title !== undefined && {
        title: input.title,
      }),

      ...(input.description !== undefined && {
        description: input.description,
      }),

      ...(input.status !== undefined && {
        status: input.status,
      }),

      ...(input.priority !== undefined && {
        priority: input.priority,
      }),

      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate,
      }),
    },
  });
};

// DELETE TASK
const softDeleteTask = async (taskId: string) => {
  return prisma.task.update({
    where: {
      id: taskId,
    },

    data: {
      deletedAt: new Date(),
    },
  });
};

// FIND ORGANIZATION MEMBER
const findOrganizationMember = async (
  organizationId: string,
  userId: string
) => {
  return prisma.orgMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  });
};

// CREATE ASSIGNMENT
const createAssignment = async (taskId: string, userId: string) => {
  return prisma.taskAssignment.create({
    data: {
      taskId,
      userId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

// FIND ASSIGNMENT
const findAssignment = async (taskId: string, userId: string) => {
  return prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },
  });
};

// DELETE ASSIGNMENT
const deleteAssignment = async (taskId: string, assigneeId: string) => {
  return prisma.taskAssignment.delete({
    where: {
      taskId_userId: {
        taskId,
        userId: assigneeId,
      },
    },
  });
};

// TASK DASHBOARD
const getTaskDashboard = async (projectId: string) => {
  return prisma.task.groupBy({
    by: ['status'],

    where: {
      projectId,
      deletedAt: null,
    },

    _count: {
      _all: true,
    },
  });
};

//FIND PROJECT BY ID
const findProjectById = async (projectId: string) => {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });
};

//FIND TASK WITH ORGANIZATION
const findTaskWithOrganization = async (taskId: string) => {
  return prisma.task.findUnique({
    where: {
      id: taskId,
    },

    include: {
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });
};

export default {
  createTask,
  findTasks,
  findTaskById,
  updateTask,
  softDeleteTask,
  findOrganizationMember,
  createAssignment,
  findAssignment,
  deleteAssignment,
  getTaskDashboard,
  findProjectById,
  findTaskWithOrganization,
};

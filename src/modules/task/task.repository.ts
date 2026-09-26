import { Prisma, Status, TaskHistoryAction } from '@prisma/client';

import prisma from '../../db/prisma';

import {
  AssignTaskInput,
  CreateTaskInput,
  TaskFilterInput,
  TaskHistoryChanges,
  UpdateTaskInput,
} from './task.types';

// PROJECT
const findProjectForAccess = async (
  organizationId: string,
  projectId: string,
  userId: string
) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },

    select: {
      id: true,
      organizationId: true,
      managerId: true,

      members: {
        where: {
          userId,
        },

        select: {
          userId: true,
        },
      },
    },
  });
};

// TASK
const createTask = async (
  projectId: string,
  createdById: string,
  input: CreateTaskInput
) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        projectId,
        createdById,

        title: input.title,
        description: input.description,

        status: input.status ?? Status.todo,
        priority: input.priority,

        dueDate: input.dueDate ?? null,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

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
    });

    await tx.taskHistory.create({
      data: {
        taskId: task.id,
        userId: createdById,
        action: TaskHistoryAction.created,

        newValue: {
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        },
      },
    });

    return task;
  });
};

//Find all tasks
const findTasks = async (projectId: string, filters: TaskFilterInput) => {
  const { page, limit, status, priority, assigneeId, dueDateFrom, dueDateTo } =
    filters;

  const skip = (page - 1) * limit;

  const where: Prisma.TaskWhereInput = {
    projectId,
    deletedAt: null,

    ...(status && {
      status,
    }),

    ...(priority && {
      priority,
    }),

    ...(assigneeId && {
      assignments: {
        some: {
          userId: assigneeId,
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

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

          orderBy: {
            assignedAt: 'asc',
          },
        },

        _count: {
          select: {
            assignments: true,
            comments: true,
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

//Find task by Id
const findTaskById = async (taskId: string) => {
  return prisma.task.findUnique({
    where: {
      id: taskId,
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
          managerId: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

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

        orderBy: {
          assignedAt: 'asc',
        },
      },

      _count: {
        select: {
          assignments: true,
          comments: true,
          history: true,
        },
      },
    },
  });
};

// Update Task
const updateTask = async (
  taskId: string,
  userId: string,
  input: UpdateTaskInput
) => {
  return prisma.$transaction(async (tx) => {
    // Find existing task
    const existingTask = await tx.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask || existingTask.deletedAt) {
      return null;
    }

    // Detect status / priority changes
    const statusChanged =
      input.status !== undefined && input.status !== existingTask.status;

    const priorityChanged =
      input.priority !== undefined && input.priority !== existingTask.priority;

    // Prepare general change history
    const oldValue: TaskHistoryChanges = {};
    const newValue: TaskHistoryChanges = {};

    // Title
    if (input.title !== undefined && input.title !== existingTask.title) {
      oldValue.title = existingTask.title;
      newValue.title = input.title;
    }
    // Description
    if (
      input.description !== undefined &&
      input.description !== existingTask.description
    ) {
      oldValue.description = existingTask.description;
      newValue.description = input.description;
    }

    // Due Date
    const existingDueDate = existingTask.dueDate?.getTime() ?? null;

    const newDueDate =
      input.dueDate !== undefined
        ? (input.dueDate?.getTime() ?? null)
        : existingDueDate;

    if (input.dueDate !== undefined && newDueDate !== existingDueDate) {
      oldValue.dueDate = existingTask.dueDate?.toISOString() ?? null;

      newValue.dueDate = input.dueDate?.toISOString() ?? null;
    }

    // Update task
    const task = await tx.task.update({
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

    // General update history
    if (Object.keys(oldValue).length > 0) {
      await tx.taskHistory.create({
        data: {
          taskId,
          userId,
          action: TaskHistoryAction.updated,

          oldValue: oldValue as Prisma.InputJsonValue,

          newValue: newValue as Prisma.InputJsonValue,
        },
      });
    }
    // Status change history
    if (statusChanged) {
      await tx.taskHistory.create({
        data: {
          taskId,
          userId,
          action: TaskHistoryAction.status_changed,

          oldValue: {
            status: existingTask.status,
          },

          newValue: {
            status: task.status,
          },
        },
      });
    }

    // Priority change history
    if (priorityChanged) {
      await tx.taskHistory.create({
        data: {
          taskId,
          userId,
          action: TaskHistoryAction.priority_changed,

          oldValue: {
            priority: existingTask.priority,
          },

          newValue: {
            priority: task.priority,
          },
        },
      });
    }

    return task;
  });
};

//Soft Delete
const softDeleteTask = async (taskId: string, userId: string) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: {
        id: taskId,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    await tx.taskHistory.create({
      data: {
        taskId,
        userId,
        action: TaskHistoryAction.updated,

        oldValue: {
          deletedAt: null,
        },

        newValue: {
          deletedAt: task.deletedAt,
        },
      },
    });

    return task;
  });
};

// ORGANIZATION MEMBER
const findOrganizationMember = async (
  organizationId: string,
  userId: string
) => {
  return prisma.orgMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },

    select: {
      id: true,
      userId: true,
      organizationId: true,
      role: true,
    },
  });
};

// PROJECT MEMBER
const findProjectMember = async (
  projectId: string,
  organizationId: string,
  userId: string
) => {
  return prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
      project: {
        organizationId,
        deletedAt: null,
      },
    },
    select: {
      id: true,
      projectId: true,
      userId: true,
    },
  });
};

// TASK ASSIGNMENT
const findAssignment = async (taskId: string, userId: string) => {
  return prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },

    select: {
      id: true,
      taskId: true,
      userId: true,
      assignedById: true,
      assignedAt: true,
    },
  });
};

//Create Assignment
const createAssignment = async (
  taskId: string,
  userId: string,
  assignedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.taskAssignment.create({
      data: {
        taskId,
        userId,
        assignedById,
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
            projectId: true,
          },
        },
      },
    });

    await tx.taskHistory.create({
      data: {
        taskId,
        userId: assignedById,
        action: TaskHistoryAction.assigned,

        newValue: {
          userId,
          assignmentId: assignment.id,
        },
      },
    });

    return assignment;
  });
};

const deleteAssignment = async (
  taskId: string,
  assigneeId: string,
  removedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.taskAssignment.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: assigneeId,
        },
      },
    });

    if (!assignment) {
      return null;
    }

    await tx.taskAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    await tx.taskHistory.create({
      data: {
        taskId,
        userId: removedById,
        action: TaskHistoryAction.unassigned,

        oldValue: {
          userId: assigneeId,
          assignmentId: assignment.id,
        },
      },
    });

    return assignment;
  });
};

// TASK HISTORY
const findTaskHistory = async (taskId: string) => {
  return prisma.taskHistory.findMany({
    where: {
      taskId,
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

    orderBy: {
      createdAt: 'desc',
    },
  });
};

export default {
  findProjectForAccess,

  createTask,
  findTasks,
  findTaskById,
  updateTask,
  softDeleteTask,

  findOrganizationMember,
  findProjectMember,

  findAssignment,
  createAssignment,
  deleteAssignment,

  findTaskHistory,
};

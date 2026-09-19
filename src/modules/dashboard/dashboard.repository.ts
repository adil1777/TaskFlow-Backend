import prisma from '../../db/prisma';

// PROJECT DASHBOARD
const getProjectDashboard = async (projectId: string) => {
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

export default {
  getProjectDashboard,
};

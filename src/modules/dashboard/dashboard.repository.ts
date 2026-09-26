import prisma from '../../db/prisma';

const getProjectDashboard = async (
  organizationId: string,
  projectId: string
) => {
  return prisma.task.groupBy({
    by: ['status'],

    where: {
      projectId,
      deletedAt: null,

      project: {
        organizationId,
        deletedAt: null,
      },
    },

    _count: {
      _all: true,
    },
  });
};

export default {
  getProjectDashboard,
};

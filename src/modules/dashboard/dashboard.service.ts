import taskService from '../task/task.service';
import dashboardRepository from './dashboard.repository';

// PROJECT DASHBOARD
const getProjectDashboard = async (
  organizationId: string,
  projectId: string
) => {
  try {
    await taskService.getAuthorizedProject(organizationId, projectId);

    const result = await dashboardRepository.getProjectDashboard(projectId);

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

export default {
  getProjectDashboard,
};

import taskService from '../task/task.service';
import dashboardRepository from './dashboard.repository';

const getProjectDashboard = async (
  organizationId: string,
  projectId: string,
  userId: string
) => {
  // Verify that the user belongs to the project
  // and has access to the project.
  await taskService.getAuthorizedProject(organizationId, projectId, userId);

  const result = await dashboardRepository.getProjectDashboard(
    organizationId,
    projectId
  );

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
};

export default {
  getProjectDashboard,
};

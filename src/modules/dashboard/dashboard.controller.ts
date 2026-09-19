import { Request, Response, NextFunction } from 'express';
import dashboardService from './dashboard.service';
import statusCodes from '../../utils/statusCodes';

//PROJECT DASHBOARD with task counts grouped by status
const getProjectDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const dashboard = await dashboardService.getProjectDashboard(
      user.organizationId,
      req.params.projectId as string
    );

    res.status(statusCodes.OK).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProjectDashboard,
};

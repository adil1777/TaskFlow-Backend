import { Request, Response, NextFunction } from 'express';

import dashboardService from './dashboard.service';
import statusCodes from '../../utils/statusCodes';

const getProjectDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const dashboard = await dashboardService.getProjectDashboard(
      user.organizationId as string,
      req.params.projectId as string,
      user.id
    );

    return res.status(statusCodes.OK).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getProjectDashboard,
};

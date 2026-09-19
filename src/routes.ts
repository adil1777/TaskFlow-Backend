import { Router } from 'express';

import authRoutes from './modules/auth/auth.route';
import projectRoutes from './modules/project/project.route';
import taskRoutes from './modules/task/task.route';
import commentRoutes from './modules/comments/comment.route';
import dashboardroute from './modules/dashboard/dashboard.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/', taskRoutes);
router.use('/', commentRoutes);
router.use('/project', dashboardroute);

export default router;

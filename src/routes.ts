import { Router } from 'express';

import authRoutes from './modules/auth/auth.route';
import projectRoutes from './modules/project/project.route';
import taskRoutes from './modules/task/task.route';
import commentRoutes from './modules/comments/comment.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/', taskRoutes);
router.use('/', commentRoutes);

export default router;

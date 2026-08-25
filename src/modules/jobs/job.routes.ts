import { Router } from 'express';

import { getJobStatus } from './job.controller';

import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/jobs/:id', getJobStatus);

export default router;

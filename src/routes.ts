import { Router } from "express";

import authRoutes from "./modules/auth/auth.route";
import projectRoutes from "./modules/project/project.route";
import taskRoutes from "./modules/task/task.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/", taskRoutes);


export default router;
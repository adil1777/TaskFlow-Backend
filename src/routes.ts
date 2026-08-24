import { Router } from "express";

import authRoutes from "./modules/auth/auth.route";
import projectRoutes from "./modules/project/project.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);


export default router;
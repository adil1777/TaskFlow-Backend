import { Router } from "express";
import authController from "./auth.controller";
import {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.validation";

const router = Router();


router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh
);

router.post(
  "/logout",
  validate(logoutSchema),
  authController.logout
);


export default router;

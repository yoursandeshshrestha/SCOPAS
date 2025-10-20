import { Router } from "express";
import {
  getProfileHandler,
  updateProfileHandler,
  deleteAccountHandler,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get("/profile", getProfileHandler);
router.put("/profile", updateProfileHandler);
router.delete("/account", deleteAccountHandler);

export default router;

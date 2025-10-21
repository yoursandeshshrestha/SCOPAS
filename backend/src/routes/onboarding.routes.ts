import { Router } from "express";
import {
  getQuestionsHandler,
  getProgressHandler,
  getQuestionsWithProgressHandler,
  saveAnswerHandler,
  completeOnboardingHandler,
  resetOnboardingHandler,
} from "../controllers/onboarding.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Public route - get questions (no auth needed, useful for displaying on signup)
router.get("/questions", getQuestionsHandler);

// All other routes require authentication
router.use(authenticateToken);

// Get user's progress
router.get("/progress", getProgressHandler);

// Get questions with user's progress (for resuming)
router.get("/questions-with-progress", getQuestionsWithProgressHandler);

// Save answer for a question
router.post("/save-answer", saveAnswerHandler);

// Complete onboarding
router.post("/complete", completeOnboardingHandler);

// Reset onboarding (for testing or redo)
router.delete("/reset", resetOnboardingHandler);

export default router;


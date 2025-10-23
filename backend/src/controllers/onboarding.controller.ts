import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getAllOnboardingQuestions,
  getUserOnboardingProgress,
  getQuestionsWithProgress,
  saveAnswer,
  saveAllAnswers,
  completeOnboarding,
  resetOnboarding,
} from "../services/onboarding.service.js";

/**
 * GET /api/onboarding/questions
 * Get all active onboarding questions
 */
export async function getQuestionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const questions = await getAllOnboardingQuestions();

    res.status(200).json({
      status: "success",
      data: questions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/onboarding/progress
 * Get user's onboarding progress
 */
export async function getProgressHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const progress = await getUserOnboardingProgress(req.user.userId);

    res.status(200).json({
      status: "success",
      data: progress,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/onboarding/questions-with-progress
 * Get questions with user's progress (useful for resuming)
 */
export async function getQuestionsWithProgressHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const data = await getQuestionsWithProgress(req.user.userId);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
}

const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  questionNumber: z.number().int().min(0),
  answer: z.string().min(1).max(500),
});

const saveAllAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        questionNumber: z.number().int().min(0),
        answer: z.string().min(1).max(500),
      })
    )
    .min(1),
});

/**
 * POST /api/onboarding/save-answer
 * Save user's answer for a question
 */
export async function saveAnswerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const body = saveAnswerSchema.parse(req.body);
    const progress = await saveAnswer(req.user.userId, body);

    res.status(200).json({
      status: "success",
      message: "Answer saved successfully",
      data: progress,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        status: "error",
        message: "Invalid input",
        issues: err.flatten(),
      });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/onboarding/save-all-answers
 * Save all user's answers at once
 */
export async function saveAllAnswersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const body = saveAllAnswersSchema.parse(req.body);
    const progress = await saveAllAnswers(req.user.userId, body);

    res.status(200).json({
      status: "success",
      message: "All answers saved successfully",
      data: progress,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        status: "error",
        message: "Invalid input",
        issues: err.flatten(),
      });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/onboarding/complete
 * Mark onboarding as completed
 */
export async function completeOnboardingHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const progress = await completeOnboarding(req.user.userId);

    res.status(200).json({
      status: "success",
      message: "Onboarding completed successfully",
      data: progress,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/onboarding/reset
 * Reset user's onboarding progress (for testing or redo)
 */
export async function resetOnboardingHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    await resetOnboarding(req.user.userId);

    res.status(200).json({
      status: "success",
      message: "Onboarding reset successfully",
    });
  } catch (err) {
    next(err);
  }
}

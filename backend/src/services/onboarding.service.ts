import { db } from "../config/database.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import type {
  OnboardingQuestionResponse,
  UserOnboardingProgress,
  SaveAnswerInput,
  OnboardingQuestionsWithProgress,
} from "../types/onboarding.types.js";

/**
 * Get all active onboarding questions
 */
export async function getAllOnboardingQuestions(): Promise<
  OnboardingQuestionResponse[]
> {
  const questions = await db.onboarding_questions.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      questionNumber: true,
      category: true,
      questionText: true,
      questionType: true,
      options: true,
      order: true,
    },
  });

  return questions as OnboardingQuestionResponse[];
}

/**
 * Get user's onboarding progress
 */
export async function getUserOnboardingProgress(
  userId: string
): Promise<UserOnboardingProgress | null> {
  // Get progress record
  const progress = await db.onboarding_progress.findUnique({
    where: { userId },
  });

  // If no progress exists, return null (user hasn't started onboarding)
  if (!progress) {
    return null;
  }

  // Get all user's responses
  const responses = await db.onboarding_responses.findMany({
    where: { userId },
    orderBy: {
      questionNumber: "asc",
    },
  });

  // Get total number of active questions
  const totalQuestions = await db.onboarding_questions.count({
    where: { isActive: true },
  });

  // Convert responses to answer map
  const answers: { [key: number]: string } = {};
  responses.forEach((response) => {
    answers[response.questionNumber] = response.answer;
  });

  return {
    currentStep: progress.currentStep,
    isCompleted: progress.isCompleted,
    totalQuestions,
    answers,
  };
}

/**
 * Get questions with user's progress
 */
export async function getQuestionsWithProgress(
  userId: string
): Promise<OnboardingQuestionsWithProgress> {
  const [questions, progress] = await Promise.all([
    getAllOnboardingQuestions(),
    getUserOnboardingProgress(userId),
  ]);

  return {
    questions,
    progress,
  };
}

/**
 * Save user's answer and update progress
 */
export async function saveAnswer(
  userId: string,
  input: SaveAnswerInput
): Promise<UserOnboardingProgress> {
  const { questionId, questionNumber, answer } = input;

  // Validate question exists
  const question = await db.onboarding_questions.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new NotFoundError("Question not found");
  }

  // Validate question number matches
  if (question.questionNumber !== questionNumber) {
    throw new BadRequestError("Question number mismatch");
  }

  // Validate answer is not empty
  if (!answer || answer.trim() === "") {
    throw new BadRequestError("Answer cannot be empty");
  }

  // For single-choice questions, validate the answer is one of the options
  if (question.questionType === "single-choice") {
    if (!question.options.includes(answer)) {
      throw new BadRequestError("Invalid answer option");
    }
  }

  // Get total number of questions to determine next step
  const totalQuestions = await db.onboarding_questions.count({
    where: { isActive: true },
  });

  // Calculate next step (but don't exceed total questions - 1)
  const nextStep = Math.min(questionNumber + 1, totalQuestions - 1);

  // Start a transaction to ensure consistency
  await db.$transaction(async (tx) => {
    // Upsert the response
    await tx.onboarding_responses.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: {
        answer,
        updatedAt: new Date(),
      },
      create: {
        userId,
        questionId,
        questionNumber,
        answer,
      },
    });

    // Upsert progress record - set currentStep to the NEXT question
    await tx.onboarding_progress.upsert({
      where: { userId },
      update: {
        currentStep: nextStep,
        lastUpdatedAt: new Date(),
      },
      create: {
        userId,
        currentStep: nextStep,
      },
    });

    // If this is question 0 (name), update user's name in users table
    if (questionNumber === 0) {
      await tx.users.update({
        where: { id: userId },
        data: {
          name: answer,
          updatedAt: new Date(),
        },
      });
    }
  });

  // Return updated progress
  const updatedProgress = await getUserOnboardingProgress(userId);
  if (!updatedProgress) {
    throw new Error("Failed to get updated progress");
  }

  return updatedProgress;
}

/**
 * Save all answers at once
 */
export async function saveAllAnswers(
  userId: string,
  input: SaveAllAnswersInput
): Promise<UserOnboardingProgress> {
  const { answers } = input;

  if (!answers || answers.length === 0) {
    throw new BadRequestError("No answers provided");
  }

  // Get all active questions to validate
  const questions = await db.onboarding_questions.findMany({
    where: { isActive: true },
    orderBy: { questionNumber: "asc" },
  });

  const totalQuestions = questions.length;

  // Validate all questions are answered
  if (answers.length !== totalQuestions) {
    throw new BadRequestError(
      `Please answer all questions. Provided: ${answers.length}/${totalQuestions}`
    );
  }

  // Validate each answer
  for (const answerData of answers) {
    const { questionId, questionNumber, answer } = answerData;

    // Validate question exists
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      throw new NotFoundError(`Question with ID ${questionId} not found`);
    }

    // Validate question number matches
    if (question.questionNumber !== questionNumber) {
      throw new BadRequestError(
        `Question number mismatch for question ${questionId}`
      );
    }

    // Validate answer is not empty
    if (!answer || answer.trim() === "") {
      throw new BadRequestError(
        `Answer cannot be empty for question ${questionNumber}`
      );
    }

    // For single-choice questions, validate the answer is one of the options
    if (question.questionType === "single-choice") {
      if (!question.options.includes(answer)) {
        throw new BadRequestError(
          `Invalid answer option for question ${questionNumber}`
        );
      }
    }
  }

  // Start a transaction to ensure consistency
  await db.$transaction(async (tx) => {
    // Delete existing responses for this user
    await tx.onboarding_responses.deleteMany({
      where: { userId },
    });

    // Create all new responses
    await tx.onboarding_responses.createMany({
      data: answers.map((answerData) => ({
        userId,
        questionId: answerData.questionId,
        questionNumber: answerData.questionNumber,
        answer: answerData.answer,
      })),
    });

    // Update user's name if question 0 (name) is provided
    const nameAnswer = answers.find((a) => a.questionNumber === 0);
    if (nameAnswer) {
      await tx.users.update({
        where: { id: userId },
        data: {
          name: nameAnswer.answer,
          updatedAt: new Date(),
        },
      });
    }

    // Update progress to mark as completed
    await tx.onboarding_progress.upsert({
      where: { userId },
      update: {
        currentStep: totalQuestions - 1, // Last question
        isCompleted: true,
        completedAt: new Date(),
        lastUpdatedAt: new Date(),
      },
      create: {
        userId,
        currentStep: totalQuestions - 1,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  });

  // Return updated progress
  const updatedProgress = await getUserOnboardingProgress(userId);
  if (!updatedProgress) {
    throw new Error("Failed to get updated progress");
  }

  return updatedProgress;
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(
  userId: string
): Promise<UserOnboardingProgress> {
  // Get user's progress
  const progress = await db.onboarding_progress.findUnique({
    where: { userId },
  });

  if (!progress) {
    throw new NotFoundError("Onboarding progress not found");
  }

  if (progress.isCompleted) {
    throw new BadRequestError("Onboarding already completed");
  }

  // Get total number of questions (including question 0)
  const totalQuestions = await db.onboarding_questions.count({
    where: { isActive: true },
  });

  // Get count of user's responses
  const responseCount = await db.onboarding_responses.count({
    where: { userId },
  });

  // Validate all questions are answered
  if (responseCount < totalQuestions) {
    throw new BadRequestError(
      `Please answer all questions. Answered: ${responseCount}/${totalQuestions}`
    );
  }

  // Mark onboarding as completed
  await db.onboarding_progress.update({
    where: { userId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      lastUpdatedAt: new Date(),
    },
  });

  // Return updated progress
  const updatedProgress = await getUserOnboardingProgress(userId);
  if (!updatedProgress) {
    throw new Error("Failed to get updated progress");
  }

  return updatedProgress;
}

/**
 * Reset user's onboarding (useful for testing or if user wants to redo)
 */
export async function resetOnboarding(userId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    // Delete all responses
    await tx.onboarding_responses.deleteMany({
      where: { userId },
    });

    // Delete progress
    await tx.onboarding_progress.deleteMany({
      where: { userId },
    });
  });
}

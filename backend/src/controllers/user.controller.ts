import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "../services/user.service.js";

export async function getProfileHandler(
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

    const profile = await getUserProfile(req.user.userId);
    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional(),
});

export async function updateProfileHandler(
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

    const body = updateProfileSchema.parse(req.body);
    const profile = await updateUserProfile(req.user.userId, body);

    res.status(200).json({
      status: "success",
      data: profile,
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

export async function deleteAccountHandler(
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

    await deleteUserAccount(req.user.userId);
    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}

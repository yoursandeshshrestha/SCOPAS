import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { signin, signup, logout, logoutAll } from "../services/auth.service.js";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = signupSchema.parse(req.body);
    const tokens = await signup(body.email, body.password, body.name);
    res.status(201).json({
      status: "success",
      data: tokens,
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

export async function signinHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = signinSchema.parse(req.body);
    const tokens = await signin(body.email, body.password);
    res.status(200).json({
      status: "success",
      data: tokens,
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

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = logoutSchema.parse(req.body);
    await logout(body.refreshToken);
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
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

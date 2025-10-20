import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/responseHandler.js";

type KnownError = {
  status?: number;
  statusCode?: number;
  message?: string;
  code?: string | number;
  errors?: unknown;
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isKnown = typeof err === "object" && err !== null;
  const known = (isKnown ? (err as KnownError) : {}) as KnownError;

  const status = Number(known.status || known.statusCode) || 500;
  const message = known.message || "Something went wrong!";
  const errors = known.errors || (known.code ? { code: known.code } : undefined);

  // Log error for debugging
  console.error("[Error Handler]:", err);

  // Use the global response handler for consistent error responses
  ResponseHandler.error(res, message, status, errors);
}

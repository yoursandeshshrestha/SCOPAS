import { Response } from "express";

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SuccessResponse<T> {
  status: "success";
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ErrorResponse {
  status: "error";
  message: string;
  errors?: unknown;
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: SuccessResponse<T> = {
      status: "success",
      data,
      ...(message && { message }),
    };
    res.status(statusCode).json(response);
  }

  static successWithPagination<T>(
    res: Response,
    data: T,
    pagination: PaginationMeta,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: SuccessResponse<T> = {
      status: "success",
      data,
      meta: pagination,
      ...(message && { message }),
    };
    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: unknown
  ): void {
    const response: ErrorResponse = {
      status: "error",
      message,
    };
    if (errors) {
      response.errors = errors;
    }
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, 201);
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }

  static notFound(res: Response, message: string = "Resource not found"): void {
    this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = "Unauthorized"): void {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = "Forbidden"): void {
    this.error(res, message, 403);
  }

  static badRequest(res: Response, message: string, errors?: unknown): void {
    this.error(res, message, 400, errors);
  }

  static internalError(
    res: Response,
    message: string = "Internal server error"
  ): void {
    this.error(res, message, 500);
  }
}


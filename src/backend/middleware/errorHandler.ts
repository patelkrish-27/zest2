// src/backend/middleware/errorHandler.ts — centralized error handling per backend-patterns
import type { Request, Response, NextFunction } from "express"
import { logger } from "./logger"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "AppError"
  }
}

// Alias per skill's ApiError naming — keep both for compat
export class ApiError extends AppError {
  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(statusCode, message, code, details)
    this.name = "ApiError"
  }
}

// Lightweight Zod-like error surface without requiring zod dep
export interface ValidationIssue {
  path: string
  message: string
  code?: string
}
export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public issues: ValidationIssue[] = []
  ) {
    super(400, message, "VALIDATION", issues)
    this.name = "ValidationError"
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as unknown as Record<string, unknown>).requestId as string | undefined

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.issues,
      requestId,
    })
    return
  }

  if (err instanceof AppError) {
    // log 5xx as error, 4xx as warn
    const lvl = err.statusCode >= 500 ? "error" : "warn"
    logger.log(lvl, err.message, { requestId, path: req.originalUrl, statusCode: err.statusCode, code: err.code })
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code ?? "APP_ERROR",
      ...(err.details ? { details: err.details } : {}),
      requestId,
    })
    return
  }

  // ZodError shape if zod is ever added — handle duck-typed
  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "ZodError") {
    const zod = err as { errors?: unknown[]; issues?: unknown[]; message?: string }
    res.status(400).json({
      success: false,
      error: "Validation failed",
      code: "VALIDATION",
      details: (zod.errors ?? zod.issues ?? []) as unknown,
      requestId,
    })
    return
  }

  if (err instanceof SyntaxError && (err as unknown as { status?: number }).status === 400) {
    res.status(400).json({ success: false, error: "Invalid JSON body", code: "BAD_JSON", requestId })
    return
  }

  logger.error("Unhandled error", err as Error, { requestId, path: req.originalUrl })
  const isProd = process.env.NODE_ENV === "production"
  res.status(500).json({
    success: false,
    error: "Internal server error",
    code: "INTERNAL",
    requestId,
    ...(isProd ? {} : { details: err instanceof Error ? err.message : String(err) }),
  })
}

export function notFound(req: Request, res: Response) {
  const requestId = (req as unknown as Record<string, unknown>).requestId as string | undefined
  res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND", path: req.originalUrl, requestId })
}

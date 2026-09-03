// src/backend/middleware/errorHandler.ts — centralized error handling per backend-patterns
import type { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code ?? "APP_ERROR" })
    return
  }
  if (err instanceof SyntaxError && (err as unknown as { status?: number }).status === 400) {
    res.status(400).json({ error: "Invalid JSON body", code: "BAD_JSON" })
    return
  }
  console.error("[backend] unhandled error", err)
  res.status(500).json({ error: "Internal server error", code: "INTERNAL" })
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found", code: "NOT_FOUND" })
}

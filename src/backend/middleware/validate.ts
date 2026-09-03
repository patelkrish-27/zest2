// src/backend/middleware/validate.ts — lightweight validation (Zod if installed, fallback manual)
import type { Request, Response, NextFunction } from "express"
import { AppError } from "./errorHandler"

export function requireJsonBody(req: Request, _res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== "object") {
    next(new AppError(400, "Request body must be JSON", "BAD_BODY"))
    return
  }
  next()
}

export function validateGeneratePrompt(req: Request, _res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>
  if (!body || typeof body.state !== "object" || body.state === null) {
    next(new AppError(400, "Missing required field: state (object)", "VALIDATION"))
    return
  }
  next()
}

export function validateParseResponse(req: Request, _res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>
  if (typeof body.aiResponse !== "string" || !body.aiResponse.trim()) {
    next(new AppError(400, "Missing required field: aiResponse (non-empty string)", "VALIDATION"))
    return
  }
  next()
}

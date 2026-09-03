// src/backend/middleware/logger.ts — structured JSON logger per backend-patterns skill
// Provides requestId, timestamp, method, path, duration, status
import type { Request, Response, NextFunction } from "express"
import crypto from "node:crypto"

export interface LogContext {
  requestId?: string
  method?: string
  path?: string
  statusCode?: number
  durationMs?: number
  userId?: string
  ip?: string
  [key: string]: unknown
}

export class Logger {
  log(level: "info" | "warn" | "error" | "debug", message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    }
    // JSON line for log aggregators; pretty in dev handled by consumer
    const line = JSON.stringify(entry)
    if (level === "error") console.error(line)
    else if (level === "warn") console.warn(line)
    else console.log(line)
  }
  info(message: string, context?: LogContext) { this.log("info", message, context) }
  warn(message: string, context?: LogContext) { this.log("warn", message, context) }
  error(message: string, err?: unknown, context?: LogContext) {
    const e = err instanceof Error ? { error: err.message, stack: err.stack } : { error: String(err ?? "") }
    this.log("error", message, { ...context, ...e })
  }
  debug(message: string, context?: LogContext) { this.log("debug", message, context) }
}

export const logger = new Logger()

// Middleware: attach requestId (X-Request-Id) and log request/response
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.headers["x-request-id"] as string | undefined
  const id = incoming && incoming.trim() ? incoming.trim().slice(0, 128) : crypto.randomUUID()
  // expose via header and req object
  ;(req as unknown as Record<string, unknown>).requestId = id
  res.setHeader("X-Request-Id", id)
  next()
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  const reqId = (req as unknown as Record<string, unknown>).requestId as string | undefined

  // log on finish to capture status + duration
  res.on("finish", () => {
    const durationMs = Date.now() - start
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"
    logger.log(level, `${req.method} ${req.originalUrl} -> ${res.statusCode}`, {
      requestId: reqId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
    })
  })
  next()
}

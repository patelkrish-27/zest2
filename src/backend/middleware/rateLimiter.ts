// src/backend/middleware/rateLimiter.ts — in-memory rate limiter per backend-patterns skill
import type { Request, Response, NextFunction } from "express"

export class RateLimiter {
  private requests = new Map<string, number[]>()
  // periodic cleanup to avoid unbounded growth
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(private windowMs: number = 60_000) {
    // cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60_000)
    // don't prevent process exit
    if (this.cleanupInterval && typeof (this.cleanupInterval as unknown as { unref: () => void }).unref === "function") {
      ;(this.cleanupInterval as unknown as { unref: () => void }).unref()
    }
  }

  async checkLimit(identifier: string, maxRequests: number, windowMs: number = this.windowMs): Promise<boolean> {
    const now = Date.now()
    const reqs = this.requests.get(identifier) || []
    const recent = reqs.filter((t) => now - t < windowMs)
    if (recent.length >= maxRequests) {
      // still update map with pruned list to allow cleanup
      this.requests.set(identifier, recent)
      return false
    }
    recent.push(now)
    this.requests.set(identifier, recent)
    return true
  }

  private cleanup() {
    const now = Date.now()
    for (const [k, arr] of this.requests.entries()) {
      const recent = arr.filter((t) => now - t < this.windowMs)
      if (recent.length === 0) this.requests.delete(k)
      else this.requests.set(k, recent)
    }
  }

  destroy() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval)
  }
}

export const apiRateLimiter = new RateLimiter(60_000)

function clientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"]
  if (typeof fwd === "string" && fwd.trim()) return fwd.split(",")[0].trim()
  if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).split(",")[0].trim()
  return req.ip || (req.socket?.remoteAddress ?? "unknown")
}

/**
 * Express middleware factory: 100 req/min per IP by default (skill's suggested limit)
 * Adds X-RateLimit-* headers and 429 with Retry-After when exceeded.
 */
export function rateLimitMiddleware(opts?: { maxRequests?: number; windowMs?: number }) {
  const max = opts?.maxRequests ?? 100
  const win = opts?.windowMs ?? 60_000
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = clientIp(req)
    const ok = await apiRateLimiter.checkLimit(id, max, win)
    // Informative headers
    res.setHeader("X-RateLimit-Limit", String(max))
    res.setHeader("X-RateLimit-Window-Ms", String(win))
    if (!ok) {
      res.setHeader("Retry-After", String(Math.ceil(win / 1000)))
      res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        code: "RATE_LIMITED",
        details: { limit: max, windowMs: win, retryAfterSec: Math.ceil(win / 1000) },
      })
      return
    }
    next()
  }
}

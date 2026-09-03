// src/backend/server.ts — standalone Express server (Node.js Express default)
// Run: pnpm dev:backend  or  node --loader ts-node/esm src/backend/server.ts
// Vite proxy (vite.config.ts) forwards /api -> this server during dev
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { blueprintRouter } from "./routes/blueprint"
import { healthRouter } from "./routes/health"
import { errorHandler, notFound } from "./middleware/errorHandler"
import { requestIdMiddleware, requestLogger } from "./middleware/logger"
import { rateLimitMiddleware } from "./middleware/rateLimiter"
import { optionalAuth } from "./middleware/auth"

dotenv.config()

const app = express()
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT_BACKEND || "3001", 10)
const HOST = process.env.BACKEND_HOST || "0.0.0.0"

// Trust proxy for X-Forwarded-For when behind Vite or reverse proxy
app.set("trust proxy", 1)

// ── Security headers (helmet-like, no extra dep) ──
function securityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "0") // modern: rely on CSP
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
  res.setHeader("Cross-Origin-Resource-Policy", "same-site")
  // HSTS only when https (prod) — harmless otherwise; set conditionally
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }
  // Minimal CSP for API (no inline scripts needed)
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
  next()
}

// Middleware — order matters: security -> cors -> requestId -> logger -> json -> auth -> rateLimit -> routes -> 404 -> error
app.use(securityHeaders)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean) ?? [
      "http://localhost:8443",
      "http://127.0.0.1:8443",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id", "X-RateLimit-Limit"],
  })
)
app.use(requestIdMiddleware)
app.use(requestLogger)
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true }))
// Auth: optional (allow anon) — attaches req.user if Bearer present, never blocks
app.use(optionalAuth)
// Rate limit applied to /api subtree only (100 req/min per IP per skill)
app.use("/api", rateLimitMiddleware({ maxRequests: 100, windowMs: 60_000 }))

// Routes — mount under /api for Vite proxy compatibility
app.use("/api", healthRouter)
app.use("/api", blueprintRouter)
// Also mount health at root for direct checks
app.use(healthRouter)

// 404 + error (consistent {success, error, code, requestId} shape via errorHandler)
app.use(notFound)
app.use(errorHandler)

const server = app.listen(PORT, HOST, () => {
  console.log(`[zest backend] listening on http://${HOST}:${PORT}  (Vite on 8443 proxies /api -> here)`)
  console.log(`[zest backend] try: curl http://localhost:${PORT}/api/health`)
})

// Graceful shutdown — handle SIGTERM/SIGINT and drain connections
function shutdown(signal: string) {
  console.log(`[zest backend] ${signal} received — shutting down gracefully`)
  server.close((err) => {
    if (err) {
      console.error("[zest backend] error during shutdown", err)
      process.exit(1)
    }
    process.exit(0)
  })
  // force exit after 10s if not closed
  setTimeout(() => {
    console.error("[zest backend] forced shutdown after timeout")
    process.exit(1)
  }, 10_000).unref()
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
// keep unhandled rejections visible but don't crash immediately in dev
process.on("unhandledRejection", (reason) => {
  console.error("[zest backend] unhandledRejection", reason)
})
process.on("uncaughtException", (err) => {
  console.error("[zest backend] uncaughtException", err)
})

export default app

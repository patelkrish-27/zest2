import { Router } from "express"

export const healthRouter = Router()

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "zest-blueprint-api",
    version: "0.1.0",
    env: process.env.NODE_ENV ?? "development",
  })
})

// also mount at /api/health for convenience via app.use("/api", healthRouter)

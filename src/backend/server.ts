// src/backend/server.ts — standalone Express server (Node.js Express default)
// Run: pnpm dev:backend  or  node --loader ts-node/esm src/backend/server.ts
// Vite proxy (vite.config.ts) forwards /api -> this server during dev
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { blueprintRouter } from "./routes/blueprint"
import { healthRouter } from "./routes/health"
import { errorHandler, notFound } from "./middleware/errorHandler"

dotenv.config()

const app = express()
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT_BACKEND || "3001", 10)
const HOST = process.env.BACKEND_HOST || "0.0.0.0"

// Middleware — order matters: cors -> json -> routes -> 404 -> error
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:8443", "http://127.0.0.1:8443"],
    credentials: true,
  })
)
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true }))

// Logging (dev)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[api] ${req.method} ${req.path}`)
    next()
  })
}

// Routes — mount under /api for Vite proxy compatibility
app.use("/api", healthRouter)
app.use("/api", blueprintRouter)
// Also mount health at root for direct checks
app.use(healthRouter)

// 404 + error
app.use(notFound)
app.use(errorHandler)

const server = app.listen(PORT, HOST, () => {
  console.log(`[zest backend] listening on http://${HOST}:${PORT}  (Vite on 8443 proxies /api -> here)`)
  console.log(`[zest backend] try: curl http://localhost:${PORT}/api/health`)
})

process.on("SIGTERM", () => server.close(() => process.exit(0)))
process.on("SIGINT", () => server.close(() => process.exit(0)))

export default app

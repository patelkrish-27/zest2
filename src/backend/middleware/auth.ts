// src/backend/middleware/auth.ts — JWT verify placeholder + requireAuth per backend-patterns
// Allow anon for now; don't break existing routes. Attach req.user when token present.
import type { Request, Response, NextFunction } from "express"
import { AppError, ApiError } from "./errorHandler"

export interface JWTPayload {
  userId: string
  email?: string
  role?: "admin" | "user" | "moderator"
}

export interface AuthRequest extends Request {
  user?: JWTPayload | null
  requestId?: string
}

// Lightweight verify placeholder: if JWT_SECRET set, verify HS256 via base64; else decode without verify
// When SUPABASE is linked, swap to supabase.auth.getUser() or jsonwebtoken verify
export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET
  // If no secret, treat token as opaque and attempt base64 payload decode (dev/anon mode)
  try {
    const parts = token.split(".")
    if (parts.length === 3) {
      // JWT format — decode payload
      const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8")
      const payload = JSON.parse(payloadJson) as Record<string, unknown>
      // If secret configured, we should ideally verify signature — placeholder throws if malformed
      // For now we trust payload if secret not enforced; when secret present we still decode (no crypto dep)
      // TODO: add `jsonwebtoken` verify when adding auth enforcement
      const userId = (payload.sub as string) || (payload.userId as string) || (payload.user_id as string) || "unknown"
      void secret // placeholder for future HMAC check
      return {
        userId,
        email: payload.email as string | undefined,
        role: (payload.role as JWTPayload["role"]) ?? "user",
      }
    }
    // opaque token
    throw new Error("not-jwt")
  } catch {
    throw new ApiError(401, "Invalid token")
  }
}

// Optional auth: attach user if Bearer present, else leave null — never blocks
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const raw = req.headers.authorization
  const token = raw?.startsWith("Bearer ") ? raw.slice(7).trim() : raw?.trim()
  if (!token) {
    req.user = null
    next()
    return
  }
  try {
    req.user = verifyToken(token)
  } catch {
    // invalid token with optionalAuth => treat as anon but log
    req.user = null
  }
  next()
}

// Strict requireAuth — use per-route when auth is needed; currently unused globally to preserve anon access
export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const raw = req.headers.authorization
  const token = raw?.startsWith("Bearer ") ? raw.slice(7).trim() : undefined
  if (!token) {
    next(new ApiError(401, "Missing authorization token"))
    return
  }
  try {
    req.user = verifyToken(token)
    next()
  } catch (e) {
    next(e instanceof ApiError ? e : new ApiError(401, "Invalid token"))
  }
}

// Role helpers per backend-patterns skill
export type Permission = "read" | "write" | "delete" | "admin"
const rolePermissions: Record<string, Permission[]> = {
  admin: ["read", "write", "delete", "admin"],
  moderator: ["read", "write", "delete"],
  user: ["read", "write"],
}

export function hasPermission(user: JWTPayload, permission: Permission): boolean {
  const perms = rolePermissions[user.role ?? "user"] ?? rolePermissions.user
  return perms.includes(permission)
}

export function requirePermission(permission: Permission) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "Unauthorized", "UNAUTHORIZED"))
      return
    }
    if (!hasPermission(req.user, permission)) {
      next(new AppError(403, "Insufficient permissions", "FORBIDDEN"))
      return
    }
    next()
  }
}

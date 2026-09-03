// src/backend/middleware/validate.ts — robust manual validation (Zod-ready if installed)
import type { Request, Response, NextFunction } from "express"
import { AppError, ValidationError, type ValidationIssue } from "./errorHandler"

export function requireJsonBody(req: Request, _res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    next(new AppError(400, "Request body must be JSON object", "BAD_BODY"))
    return
  }
  next()
}

function issue(path: string, message: string, code = "INVALID"): ValidationIssue {
  return { path, message, code }
}

// Validate POST /api/generate-prompt body: { state: PartialBlueprintState, config?: { customSections, skillsCatalog } }
export function validateGeneratePrompt(req: Request, _res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>
  const issues: ValidationIssue[] = []

  if (!body || typeof body.state !== "object" || body.state === null || Array.isArray(body.state)) {
    issues.push(issue("state", "Missing required field: state (object)"))
  } else {
    const state = body.state as Record<string, unknown>
    // Optional but type-checked fields — collect warnings as validation issues only if clearly wrong type
    const stringFields = ["projectName", "projectType", "problemStatement", "frontendFramework", "backendFramework", "database", "dbTables", "pages", "components", "theme", "fontHeading", "fontBody", "fontMono", "fontPairing", "aiResponse"]
    for (const f of stringFields) {
      if (f in state && state[f] !== undefined && state[f] !== null && typeof state[f] !== "string") {
        issues.push(issue(`state.${f}`, `Expected string for ${f}`))
      }
    }
    const arrayStringFields = ["uiLibraries", "features", "themeExtras", "selectedSkills"]
    for (const f of arrayStringFields) {
      if (f in state && state[f] !== undefined && state[f] !== null && !Array.isArray(state[f])) {
        issues.push(issue(`state.${f}`, `Expected array for ${f}`))
      }
    }
    if ("themeModifiers" in state && state.themeModifiers !== undefined && state.themeModifiers !== null) {
      if (typeof state.themeModifiers !== "object" || Array.isArray(state.themeModifiers)) {
        issues.push(issue("state.themeModifiers", "Expected object for themeModifiers"))
      }
    }
    if ("customAnswers" in state && state.customAnswers !== undefined && state.customAnswers !== null) {
      if (typeof state.customAnswers !== "object" || Array.isArray(state.customAnswers)) {
        issues.push(issue("state.customAnswers", "Expected object for customAnswers"))
      }
    }
  }

  if ("config" in body && body.config !== undefined && body.config !== null) {
    if (typeof body.config !== "object" || Array.isArray(body.config)) {
      issues.push(issue("config", "Expected object for config"))
    } else {
      const cfg = body.config as Record<string, unknown>
      if ("customSections" in cfg && cfg.customSections !== undefined && cfg.customSections !== null && !Array.isArray(cfg.customSections)) {
        issues.push(issue("config.customSections", "Expected array for customSections"))
      }
      if ("skillsCatalog" in cfg && cfg.skillsCatalog !== undefined && cfg.skillsCatalog !== null && !Array.isArray(cfg.skillsCatalog)) {
        issues.push(issue("config.skillsCatalog", "Expected array for skillsCatalog"))
      }
    }
  }

  if (issues.length) {
    next(new ValidationError("Validation failed for generate-prompt", issues))
    return
  }
  next()
}

export function validateParseResponse(req: Request, _res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>
  const issues: ValidationIssue[] = []
  if (typeof body.aiResponse !== "string" || !body.aiResponse.trim()) {
    issues.push(issue("aiResponse", "Missing required field: aiResponse (non-empty string)"))
  } else if (body.aiResponse.length > 500_000) {
    issues.push(issue("aiResponse", "aiResponse exceeds 500k chars limit", "TOO_LARGE"))
  }
  if (issues.length) {
    next(new ValidationError("Validation failed for parse-response", issues))
    return
  }
  next()
}

export function validatePagination(req: Request, _res: Response, next: NextFunction) {
  const issues: ValidationIssue[] = []
  const q = req.query as Record<string, string | undefined>
  if (q.limit !== undefined) {
    const n = Number(q.limit)
    if (!Number.isInteger(n) || n < 1 || n > 100) issues.push(issue("limit", "limit must be integer 1..100"))
  }
  if (q.offset !== undefined) {
    const n = Number(q.offset)
    if (!Number.isInteger(n) || n < 0) issues.push(issue("offset", "offset must be integer >= 0"))
  }
  if (q.q !== undefined && typeof q.q !== "string") issues.push(issue("q", "q must be string"))
  if (issues.length) {
    next(new ValidationError("Invalid pagination params", issues))
    return
  }
  next()
}

// Validate POST /api/validate body: { state: PartialBlueprintState }
export function validateBlueprintState(req: Request, _res: Response, next: NextFunction) {
  const body = req.body as Record<string, unknown>
  if (!body || typeof body.state !== "object" || body.state === null || Array.isArray(body.state)) {
    next(new ValidationError("Validation failed for validate", [issue("state", "Missing required field: state (object)")]))
    return
  }
  next()
}

export function validateIdParam(req: Request, _res: Response, next: NextFunction) {
  const id = req.params.id
  if (!id || typeof id !== "string" || !id.trim() || id.length > 128) {
    next(new AppError(400, "Invalid id param", "VALIDATION"))
    return
  }
  // allow bp_... or uuid-like; basic sanity
  if (/[\s/\\]/.test(id)) {
    next(new AppError(400, "Invalid id format", "VALIDATION"))
    return
  }
  next()
}

// src/backend/routes/blueprint.ts — Express router, controller layer thin — delegates to service+repo
import { Router } from "express"
import { blueprintService } from "../services/blueprintService"
import {
  validateGeneratePrompt,
  validateParseResponse,
  requireJsonBody,
  validatePagination,
  validateBlueprintState,
  validateIdParam,
} from "../middleware/validate"

export const blueprintRouter = Router()

// POST /api/generate-prompt — builds master prompt from blueprint state
// Service layer handles business logic; repo persists via service (best-effort)
blueprintRouter.post("/generate-prompt", requireJsonBody, validateGeneratePrompt, async (req, res, next) => {
  try {
    const { state, config } = req.body as {
      state: import("../types").PartialBlueprintState
      config?: { customSections?: { id: string; title: string }[]; skillsCatalog?: import("../types").SkillDTO[] }
    }
    const prompt = blueprintService.buildPrompt({ state, config })
    // Persist optionally (best-effort) — do not block response on write failure
    let savedId: string | undefined
    try {
      const saved = await blueprintService.saveBlueprint({ state, config, prompt })
      savedId = saved.id
    } catch {
      // storage optional — ignore
    }
    res.json({ success: true, prompt, length: prompt.length, blueprintId: savedId })
  } catch (err) {
    next(err)
  }
})

// POST /api/parse-response — parses raw AI markdown into files array
blueprintRouter.post("/parse-response", requireJsonBody, validateParseResponse, async (req, res, next) => {
  try {
    const { aiResponse } = req.body as { aiResponse: string }
    const files = blueprintService.parseResponse(aiResponse)
    res.json({ success: true, files, count: files.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/skills — return catalog (RESTful resource per backend-patterns)
// Caching: client can cache 5m; server could add Cache-Control header
blueprintRouter.get("/skills", (_req, res) => {
  const skills = blueprintService.getSkillsCatalog()
  res.setHeader("Cache-Control", "public, max-age=300")
  res.json({ success: true, items: skills, count: skills.length })
})

// POST /api/validate — validate PartialBlueprintState (no persistence)
blueprintRouter.post("/validate", requireJsonBody, validateBlueprintState, async (req, res, next) => {
  try {
    const { state } = req.body as { state: import("../types").PartialBlueprintState }
    const result = blueprintService.validateState(state)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
})

// GET /api/blueprints — list with pagination & filtering ?limit&offset&q
// RESTful: GET /api/blueprints?status=active&sort=volume&limit=20&offset=0 per skill
blueprintRouter.get("/blueprints", validatePagination, async (req, res, next) => {
  try {
    const q = req.query.q as string | undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0
    const result = await blueprintService.listBlueprints({ q, limit, offset })
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
})

// GET /api/blueprints/:id — get single resource per RESTful skill
blueprintRouter.get("/blueprints/:id", validateIdParam, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const row = await blueprintService.getBlueprint(id)
    res.json({ success: true, data: row })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/blueprints/:id — delete resource
blueprintRouter.delete("/blueprints/:id", validateIdParam, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    await blueprintService.deleteBlueprint(id)
    res.json({ success: true, message: `Blueprint ${id} deleted` })
  } catch (err) {
    next(err)
  }
})

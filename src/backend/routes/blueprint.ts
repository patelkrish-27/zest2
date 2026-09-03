// src/backend/routes/blueprint.ts — Express router, thin controllers
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

// POST /api/generate-architecture-prompt — creates the Gemini prompt used to infer pages/components
blueprintRouter.post("/generate-architecture-prompt", requireJsonBody, async (req, res, next) => {
  try {
    const { state } = req.body as { state: import("../types").PartialBlueprintState }
    if (!state || typeof state !== "object") {
      res.status(400).json({ success: false, error: "Missing required field: state" })
      return
    }
    const prompt = blueprintService.buildArchitecturePlanningPrompt(state)
    res.json({ success: true, prompt, length: prompt.length })
  } catch (err) {
    next(err)
  }
})

// POST /api/parse-architecture-plan — validates/parses Gemini's JSON architecture response
blueprintRouter.post("/parse-architecture-plan", requireJsonBody, async (req, res, next) => {
  try {
    const { response } = req.body as { response: string }
    if (typeof response !== "string" || !response.trim()) {
      res.status(400).json({ success: false, error: "Missing required field: response" })
      return
    }
    const plan = blueprintService.parseArchitecturePlan(response)
    if (!plan) {
      res.status(422).json({ success: false, error: "Gemini response is not valid architecture JSON" })
      return
    }
    res.json({ success: true, plan })
  } catch (err) {
    next(err)
  }
})

// POST /api/generate-prompt — builds master prompt from blueprint state
blueprintRouter.post("/generate-prompt", requireJsonBody, validateGeneratePrompt, async (req, res, next) => {
  try {
    const { state, config } = req.body as {
      state: import("../types").PartialBlueprintState
      config?: { customSections?: { id: string; title: string }[]; skillsCatalog?: import("../types").SkillDTO[] }
    }
    const prompt = blueprintService.buildPrompt({ state, config })
    let savedId: string | undefined
    try {
      const saved = await blueprintService.saveBlueprint({ state, config, prompt })
      savedId = saved.id
    } catch {
      // storage is best-effort
    }
    res.json({ success: true, prompt, length: prompt.length, blueprintId: savedId })
  } catch (err) {
    next(err)
  }
})

blueprintRouter.post("/parse-response", requireJsonBody, validateParseResponse, async (req, res, next) => {
  try {
    const { aiResponse } = req.body as { aiResponse: string }
    const files = blueprintService.parseResponse(aiResponse)
    res.json({ success: true, files, count: files.length })
  } catch (err) {
    next(err)
  }
})

blueprintRouter.get("/skills", (_req, res) => {
  const skills = blueprintService.getSkillsCatalog()
  res.setHeader("Cache-Control", "public, max-age=300")
  res.json({ success: true, items: skills, count: skills.length })
})

blueprintRouter.post("/validate", requireJsonBody, validateBlueprintState, async (req, res, next) => {
  try {
    const { state } = req.body as { state: import("../types").PartialBlueprintState }
    const result = blueprintService.validateState(state)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
})

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

blueprintRouter.get("/blueprints/:id", validateIdParam, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const row = await blueprintService.getBlueprint(id)
    res.json({ success: true, data: row })
  } catch (err) {
    next(err)
  }
})

blueprintRouter.delete("/blueprints/:id", validateIdParam, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    await blueprintService.deleteBlueprint(id)
    res.json({ success: true, message: `Blueprint ${id} deleted` })
  } catch (err) {
    next(err)
  }
})

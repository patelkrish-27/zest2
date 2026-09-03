// src/backend/routes/blueprint.ts — Express router, controller layer thin — delegates to service+repo
import { Router } from "express"
import { promptService } from "../services/promptService"
import { blueprintRepo } from "../repositories/blueprintRepository"
import { validateGeneratePrompt, validateParseResponse, requireJsonBody } from "../middleware/validate"

export const blueprintRouter = Router()

// POST /api/generate-prompt — builds master prompt from blueprint state
blueprintRouter.post("/generate-prompt", requireJsonBody, validateGeneratePrompt, async (req, res, next) => {
  try {
    const { state, config } = req.body as {
      state: import("../types").PartialBlueprintState
      config?: { customSections?: { id: string; title: string }[]; skillsCatalog?: import("../types").SkillDTO[] }
    }
    const prompt = promptService.buildPrompt(state, config?.customSections ?? [], config?.skillsCatalog ?? [])
    // Persist optionally (best-effort) — do not block response on write failure
    try {
      await blueprintRepo.save({ state, prompt })
    } catch {
      // storage optional — ignore
    }
    res.json({ prompt, length: prompt.length })
  } catch (err) {
    next(err)
  }
})

// POST /api/parse-response — parses raw AI markdown into files array
blueprintRouter.post("/parse-response", requireJsonBody, validateParseResponse, async (req, res, next) => {
  try {
    const { aiResponse } = req.body as { aiResponse: string }
    const files = promptService.parseResponse(aiResponse)
    res.json({ files, count: files.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/blueprints — list recent (in-memory; for debug / future persistence)
blueprintRouter.get("/blueprints", async (_req, res, next) => {
  try {
    const items = await blueprintRepo.list(20)
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

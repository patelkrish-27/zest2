# BACKEND_LOG — pane 1.3 (opencode-orch:1.3)

## Goal
Create/Manage Backend for frontend-only Vite+React Blueprint wizard. User selected `backendFrameworks: ["Node.js (Express)", "NestJS", "Python (FastAPI)", ...]` and databases include Supabase/Postgres. Provide minimal Express service with Vite proxy and frontend fallback.

## Inspection — 2026-09-03
- `src/App.tsx` read: `generatePrompt()` at ~940-1041 builds master prompt covering PROJECT_OVERVIEW, FRONTEND, BACKEND, ARCHITECTURE, VISUAL STYLE, TYPOGRAPHY, SKILLS, ADDITIONAL REQUIREMENTS. `processResponse()` regex parses `--- FILE: ... ---` blocks. `backendFramework` + `database` + `dbTables` flow into prompt. `config.customSections` + `skillsCatalog` injected.
- `vite.config.ts` has `@` alias to `src`, dev server `0.0.0.0:8443`, already hosts UI refinements (`src/components/ui`, `src/lib/utils.ts`, `src/lib/supabaseClient.ts`).
- `package.json` initially lacked `express`, `cors`, `dotenv`. `clsx`, `tailwind-merge`, `class-variance-authority` already present from UI pane.
- No existing `src/backend/` or `backend/` directories — scaffold needed.

## Decisions
- **Default stack: Node.js (Express)** — matches project is TS/JS, aligns with `backend-patterns` skill (repository/service layers, no N+1).
- Location `src/backend/` (not top-level `backend/`) so `@` alias + `tsconfig.backend.json` isolation keeps Vite build unaffected.
- **Service layer** extracts `generatePrompt` pure logic into `services/promptService.ts` — backend is source of truth, frontend imports only `client.ts` (fetch, no express).
- **Repository** `InMemoryBlueprintRepository` for file-based coordination; Supabase swap later by DB agent via `src/lib/supabaseClient.ts` typed Database.
- **Vite proxy** `server.proxy["/api"] -> 127.0.0.1:3001` so `VITE_API_BASE=""` works same-origin; frontend `handleCopyPrompt` + `processResponse` try backend with `generatePromptWithFallback`/`parseResponseWithFallback`.
- **Host `0.0.0.0`** for both Vite and Express to satisfy Figma Make preview.

## Scaffolded
- `src/backend/types.ts` — shared DTOs, `PartialBlueprintState`
- `src/backend/services/promptService.ts` — `PromptService.buildPrompt()`, `parseResponse()`, `buildSkillsGuide()`, constants THEMES/MODIFIER_GROUPS/SUB_THEMES/FONTS/PAIRINGS
- `src/backend/repositories/blueprintRepository.ts` — interface + `InMemoryBlueprintRepository` + singleton `blueprintRepo`
- `src/backend/middleware/errorHandler.ts` + `validate.ts` — centralized errors, JSON/field guards
- `src/backend/routes/blueprint.ts` — `POST /api/generate-prompt`, `POST /api/parse-response`, `GET /api/blueprints`
- `src/backend/routes/health.ts` — `GET /health` + `GET /api/health`
- `src/backend/server.ts` — Express app, cors, json limit 2mb, HOST 0.0.0.0, PORT 3001, SIGTERM handling
- `src/backend/client.ts` — `backendClient` fetch wrapper with `generatePromptWithFallback`/`parseResponseWithFallback` (uses `import.meta.env.VITE_API_BASE` workaround for tsc)
- `tsconfig.backend.json` — isolated backend type-check
- `vite.config.ts` patch — added `server.proxy["/api"]`
- `src/App.tsx` patch — imported `backendClient`, made `handleCopyPrompt`/`processResponse` async with backend-first fallback; ran `oxfmt` to keep formatting.
- `package.json` scripts — `dev:backend` (`tsx src/backend/server.ts`), `dev:all` (`concurrently`), `build:backend` (`tsc --project tsconfig.backend.json --noEmit`)
- Deps added — `express`, `cors`, `dotenv`, `tsx`, `concurrently`, `@types/express`, `@types/cors`

## Verification
- `pnpm build:backend` — pass (fixed `import.meta.env` via `(import.meta as unknown as {env}).env`)
- `pnpm build` — pass after `oxfmt src/App.tsx` (vite 8 built 1833 modules, chunks OK)
- Manual smoke via `pnpm exec tsx src/backend/server.ts` (background, 0.0.0.0:3001):
  - `GET /api/health` + `GET /health` -> `{status:"ok", service:"zest-blueprint-api"}`
  - `POST /api/generate-prompt` with `{"state":{"projectName":"Zest Demo"}}` -> prompt contains PROJECT_OVERVIEW, Supabase awareness
  - `POST /api/parse-response` with `--- FILE: TEST.md ---\nhello\n--- END FILE ---` -> `{files:[{name:"TEST.md"}], count:1}`
- Previous `timeout 5 pnpm dev:backend` buffered logs due to pnpm reporter; use `pnpm --reporter=append-only exec tsx` or direct `tsx` for visibility.

## Coordination
- Shared DB schema type in `src/lib/supabaseClient.ts` (`Database` tables) — DB agent owns migrations/RLS; backend repo currently in-memory pending Supabase link.
- `DATABASE.md` generation is via master prompt requirement #5; backend does not pre-render it but supplies `dbTables` context to LLM.
- File-based only — no `supabase/migrations` applied by this pane.

## Remaining Idle
- Backend pane 1.3 idle — awaiting DB agent schema or frontend integration confirmation.
- `pnpm dev:backend` + `pnpm dev` both listen on host 0.0.0.0; preview at http://localhost:8443 proxies /api.
- Next when DB linked: zod validation, Supabase repo swap, auth middleware, pagination for blueprints.

◆

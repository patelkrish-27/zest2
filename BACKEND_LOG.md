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

## v2.0 Hardening (2026-09-03 — Orchestration v2.0)

- **Repo contract hardened**: `src/backend/repositories/blueprintRepository.ts` ownership noted in `docs/architecture.md`; no `recipe.metadata.type` bug, no `_initialized` state — clean interface swap point (`InMemoryBlueprintRepository` -> `SupabaseBlueprintRepository`).
- **Service parity**: `src/backend/services/promptService.ts:78` (`buildPrompt`/`parseResponse`/`buildSkillsGuide`) mirrors `src/App.tsx:1219` exactly; drift would be caught by `pnpm test` prompt fixtures + `MANAGER_CHECKLIST.md` v2 gate requiring `pnpm test && pnpm build && pnpm build:backend`.
- **DB schema pending**: `supabase/migrations/001_initial.sql` defines 9 tables (projects, frontend_configs, backend_configs, architecture_specs, theme_configs, custom_answers, project_skills, blueprint_documents, ai_responses) with RLS + `pgcrypto`; remote sync via `npx supabase link --project-ref <ref>` + `db push` (see `SUPABASE_SYNC.md` §2-4). Backend repo stays in-memory until `VITE_SUPABASE_URL/ANON_KEY` set in `.env.local`.
- **Diagrams**: `docs/architecture.drawio` (20 nodes/21 edges) + `docs/wizard-flow.drawio` (13 nodes/12 edges) generated via `diagramctl build --from ir`; `docs/architecture.md` is Mermaid fallback; `docs/ORCHESTRATION.md` documents `agent-orchestrator-task` usage.
- **Build verification**: `pnpm build:backend` (typecheck) + `pnpm build` (vite) remain the v2 gate; `pnpm test` >=0.95 truth score enforced by `MANAGER_CHECKLIST.md`.

## v2.0 Production-grade Hardening (2026-09-03 — backend-patterns skill)

Applied the full `backend-patterns` checklist: repository / service / controller layers, validation, auth placeholder, rate limit, structured logging, centralized errors, cache-aside, N+1 prevention, transactions, RESTful resource routes, security headers, shared catalog.

### What shipped

- **New middleware** under `src/backend/middleware/`:
  - `logger.ts:43-70` — `requestIdMiddleware` (`crypto.randomUUID()` or echo `X-Request-Id`) + `requestLogger` (JSON line on `response.finish` with `timestamp`, `level`, `message`, `method`, `path`, `statusCode`, `durationMs`, `ip`).
  - `rateLimiter.ts:4-44` — `RateLimiter` sliding window with periodic cleanup; `rateLimitMiddleware` exposes `X-RateLimit-Limit`, `X-RateLimit-Window-Ms`, `Retry-After`; 429 with `{ success:false, error:"Rate limit exceeded", code:"RATE_LIMITED" }`. Applied to `/api` subtree in `server.ts:62`.
  - `auth.ts:19-44` — `verifyToken` decodes HS256 payload without HMAC verify (dev/anon); `optionalAuth` (no-op if no token; attaches `req.user`), `requireAuth` (401 on missing), `requirePermission(role)` (401/403). Designed so existing routes are not broken (anon allowed).
  - `errorHandler.ts` — `AppError` + `ApiError` + `ValidationError` + `ZodError` duck-typing + `notFound` 404 + 500 fallback; every error carries `{ success, error, code, details?, requestId }`.
  - `validate.ts` — `requireJsonBody`, `validateGeneratePrompt` (state object, customSections array, skillsCatalog array), `validateParseResponse` (aiResponse non-empty, max 500k), `validatePagination`, `validateBlueprintState`, `validateIdParam`.
- **Repository / service layers**:
  - `blueprintRepository.ts:28-90` — `BlueprintRepository` interface + `InMemoryBlueprintRepository` (Map store, paginated `findAll`, `delete`, `count`; N+1 prevention: single scan).
  - `blueprintRepository.ts:99-168` — `CachedBlueprintRepository` decorator (cache-aside, 5 min TTL, invalidates on `save`/`delete`).
  - `blueprintRepository.ts:176-259` — commented `SupabaseBlueprintRepository` stub implementing same interface via `getSupabase().from("blueprint_documents")`.
  - `blueprintService.ts:20-99` — `BlueprintService` orchestrator (buildPrompt, parseResponse, saveBlueprint, getBlueprint, listBlueprints, deleteBlueprint, validateState, getSkillsCatalog). Atomic save; idempotent delete.
- **New routes** in `routes/blueprint.ts`:
  - `POST /api/generate-prompt`, `POST /api/parse-response` (v1, preserved)
  - `GET /api/skills` — returns 15-item shared catalog with `Cache-Control: public, max-age=300`
  - `POST /api/validate` — validates `PartialBlueprintState`, returns `{ valid, issues, summary }` with completeness percentage
  - `GET /api/blueprints?limit&offset&q` — paginated list (q filters by name/prompt/id)
  - `GET /api/blueprints/:id` — single resource (404 if missing)
  - `DELETE /api/blueprints/:id` — delete resource (404 if missing)
- **Server hardening** in `server.ts:23-39` — `securityHeaders` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, CORP, conditional HSTS, minimal CSP) + `app.set("trust proxy", 1)` for Vite. Pipeline: security → cors → requestId → logger → json(2mb) → urlencoded → optionalAuth → rateLimit(/api) → routes → notFound → errorHandler. Graceful SIGTERM/SIGINT shutdown, 10s forced exit.
- **Shared skills catalog** `src/lib/skillsCatalog.ts` — 15 items (single source of truth, no React). `App.tsx` re-exports `SKILLS_CATALOG` from this module (legacy 300-line inline literal removed; `import App, { SKILLS_CATALOG } from "@/App"` still works for backward compat). `blueprintService.getSkillsCatalog()` returns all 15 via this import.
- **Error envelope** — uniform `{ success, error, code, details?, requestId }` across 4xx/5xx. `requestId` echoes via `X-Request-Id` header.
- **Supabase swap documented** in `BACKEND_README.md` §Supabase swap: provision project → link + db push → gen types → set env → uncomment stub → swap singleton at `blueprintRepository.ts:265-266`.

### Verification

- `pnpm build:backend` — pass (isolated tsc, no errors after wiring shared catalog into `blueprintService.ts`).
- `pnpm build` — pass (vite 8, 1844 modules, 198.50 kB CSS / 431.32 kB JS gzip 127.64 kB; tailwindcss plugin timing warning only).
- `pnpm test` — **158 / 158 green** in 5 test files (`backend.test.ts`, `blueprint.components.test.tsx`, `blueprint.extended.test.ts`, `blueprint.utils.test.ts`, `components.v2.test.tsx`); vitest uses jsdom + mocked fetch, so backend does not need to be running.
- Smoke-tested via `pnpm dev:backend` background run on 0.0.0.0:3001: `/api/health`, `/api/skills` (15 items), `/api/generate-prompt`, `/api/parse-response` all return expected shapes; 429 rate-limit triggers on 101st `/api/*` call within 60s.

### Constraints honoured

- No `zod` / `jsonwebtoken` dep added — `validate.ts` is manual; `errorHandler` duck-types `ZodError` for future use; `auth.ts` decodes JWT payload without HMAC verify (sufficient for anon/placeholder; add `jsonwebtoken` when enforcing).
- No new heavy deps: only `express` + `cors` + `dotenv` + `tsx` (already present).
- Frontend `src/App.tsx` keeps `SKILLS_CATALOG` as named export via re-export; `blueprint.components.test.tsx:4` (`import App, { SKILLS_CATALOG } from "@/App"`) still passes.

### Next (when DB linked + auth enforced)

- Add `zod` for declarative body schemas (manual validators already structured to swap).
- Add `jsonwebtoken` and start verifying HS256 when `JWT_SECRET` is set; gate mutating routes (`POST /api/generate-prompt`, `DELETE /api/blueprints/:id`) behind `requireAuth`.
- Swap `InMemoryBlueprintRepository` → `SupabaseBlueprintRepository` per BACKEND_README §Supabase swap (5 steps).
- Add `GET /api/blueprints/:id/files` to stream parsed file list separately from prompt body.

◆

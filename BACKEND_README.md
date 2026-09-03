# Zest Blueprint — Backend (v2.0)

Minimal Node.js + Express backend under `src/backend/`, hardened per the
`backend-patterns` skill (repository / service / controller layers, validation,
auth placeholder, rate limiting, structured logging, error handling, cache-aside,
N+1 prevention, transactions, RESTful resource routes).

Default stack: `Node.js (Express)` from `App.tsx` `backendFrameworks`. Mirrors the
frontend-only Vite app until Supabase / Postgres is linked.

## v2.0 hardening summary

| Area | Implementation | File |
|------|----------------|------|
| Repository / service separation | `BlueprintRepository` interface + `BlueprintService` orchestrator | `src/backend/repositories/blueprintRepository.ts`, `src/backend/services/blueprintService.ts` |
| Cache-aside (decorator) | `CachedBlueprintRepository` wraps in-memory store; 5 min TTL; invalidates on save / delete | `src/backend/repositories/blueprintRepository.ts:99-168` |
| Validation | `requireJsonBody`, `validateGeneratePrompt`, `validateParseResponse`, `validatePagination`, `validateBlueprintState`, `validateIdParam` | `src/backend/middleware/validate.ts` |
| Auth (placeholder) | `optionalAuth` + `requireAuth` + `requirePermission`; JWT decode w/o signature check (dev/anon); add `jsonwebtoken` when enforcing | `src/backend/middleware/auth.ts` |
| Rate limit | 100 req/min per IP, sliding window, applied to `/api` subtree, 429 + `Retry-After` | `src/backend/middleware/rateLimiter.ts` |
| Structured logging | JSON lines: `timestamp`, `level`, `message`, `requestId`, `method`, `path`, `statusCode`, `durationMs`, `ip`; `X-Request-Id` header; log on `response.finish` | `src/backend/middleware/logger.ts` |
| Centralized errors | `AppError` / `ApiError` / `ValidationError`, ZodError duck-typing, 404 `notFound`, 500 fallback with `{ success: false, error, code, requestId }` | `src/backend/middleware/errorHandler.ts` |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, conditional HSTS, minimal CSP | `src/backend/server.ts:23-39` |
| N+1 prevention | single scan over store, projection documented, no per-item async fetches | `src/backend/repositories/blueprintRepository.ts:66-67` |
| Transactions | `save()` is atomic; `getBlueprint` / `deleteBlueprint` are idempotent | `src/backend/services/blueprintService.ts:41-65` |
| Shared skills catalog | `src/lib/skillsCatalog.ts` (15 items) imported by `App.tsx` and `blueprintService.ts` | `src/lib/skillsCatalog.ts` |
| CORS + 2 mb JSON | env-driven `CORS_ORIGIN`, `express.json({ limit: "2mb" })` | `src/backend/server.ts:42-58` |

## Layout

```
src/backend/
  types.ts                                  # PartialBlueprintState, SkillDTO, ParsedFile
  services/
    promptService.ts                        # buildPrompt, parseResponse, buildSkillsGuide + THEMES/MODIFIERS/SUB_THEMES/FONTS/FONT_PAIRINGS
    blueprintService.ts                     # BlueprintService orchestrator (repo + prompt + validation)
  repositories/
    blueprintRepository.ts                  # BlueprintRepository interface + InMemory + Cached + Supabase (commented) impls
  middleware/
    logger.ts                               # requestId, structured JSON request logger
    rateLimiter.ts                          # 100 req/min sliding window per IP
    auth.ts                                 # optionalAuth + requireAuth + requirePermission (JWT decode placeholder)
    errorHandler.ts                         # AppError / ValidationError / notFound / errorHandler
    validate.ts                             # request validators
  routes/
    blueprint.ts                            # all /api/* resource routes
    health.ts                               # /health + /api/health
  server.ts                                 # express app + middleware pipeline + graceful shutdown
  client.ts                                 # frontend fetch wrapper with fallback
src/lib/
  skillsCatalog.ts                          # shared 15-item SKILLS_CATALOG (single source of truth)
  supabaseClient.ts                         # typed Database + getSupabase() (unchanged)
tsconfig.backend.json                       # isolated type-check for src/backend
```

## API (v2)

All responses follow `{ success: boolean, ... }` (or `{ success: false, error, code, requestId }` on error).

| Method | Path | Body / Query | Response | File |
|--------|------|--------------|----------|------|
| `GET` | `/api/health` | — | `{ status, uptime, timestamp, service, version, env }` | `routes/health.ts` |
| `GET` | `/health` | — | same as above (mounted at root) | `routes/health.ts` |
| `POST` | `/api/generate-prompt` | `{ state: PartialBlueprintState, config?: { customSections, skillsCatalog } }` | `{ success, prompt, length, blueprintId? }` | `routes/blueprint.ts:17` |
| `POST` | `/api/parse-response` | `{ aiResponse: string }` | `{ success, files, count }` | `routes/blueprint.ts:39` |
| `GET` | `/api/skills` | — | `{ success, items, count }` (15-item catalog; `Cache-Control: public, max-age=300`) | `routes/blueprint.ts:51` |
| `POST` | `/api/validate` | `{ state: PartialBlueprintState }` | `{ success, valid, issues, summary }` | `routes/blueprint.ts:58` |
| `GET` | `/api/blueprints?limit&offset&q` | `limit 1..100`, `offset >=0` | `{ success, items, total, limit, offset }` | `routes/blueprint.ts:70` |
| `GET` | `/api/blueprints/:id` | — | `{ success, data: BlueprintRecord }` (404 if missing) | `routes/blueprint.ts:83` |
| `DELETE` | `/api/blueprints/:id` | — | `{ success, message }` (404 if missing) | `routes/blueprint.ts:94` |

### Error envelope

```json
{
  "success": false,
  "error": "Validation failed for generate-prompt",
  "code": "VALIDATION",
  "details": [{ "path": "state", "message": "Missing required field: state (object)" }],
  "requestId": "uuid"
}
```

Common codes: `VALIDATION`, `BAD_BODY`, `BAD_JSON`, `NOT_FOUND`, `RATE_LIMITED`,
`UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL`. Every response (success or error) carries
`X-Request-Id`; rate-limited responses also include `Retry-After` + `X-RateLimit-Limit`.

### Middleware order (server.ts)

```
securityHeaders  →  cors  →  requestId  →  requestLogger  →
  express.json (2mb)  →  express.urlencoded  →  optionalAuth  →
  rateLimitMiddleware (mounted on /api)  →
  routes (/api/health, /api/blueprints, /api/skills, /api/validate)  →
  /health  →  notFound  →  errorHandler
```

## Run

```bash
# install (already in package.json)
pnpm install

# backend alone — listens on 0.0.0.0:3001
pnpm dev:backend              # tsx src/backend/server.ts

# frontend alone — Vite on 0.0.0.0:8443, proxies /api -> 3001
pnpm dev

# both concurrently (frontend + backend)
pnpm dev:all                  # concurrently "pnpm dev:backend" "pnpm dev"

# type-check backend only (no emit)
pnpm build:backend            # tsc --project tsconfig.backend.json --noEmit

# frontend build (unchanged — backend not bundled into Vite)
pnpm build                    # vite build

# tests (jsdom; mocks fetch so backend does not need to be running)
pnpm test
```

## Env

```
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
CORS_ORIGIN=http://localhost:8443,http://127.0.0.1:8443
# Vite forwards /api -> 127.0.0.1:${BACKEND_PORT} via vite.config.ts server.proxy
VITE_API_BASE=                # empty => same-origin; set to http://localhost:3001 when not using proxy

# Optional: enforce JWT signatures (currently decodes payload w/o verify when set)
JWT_SECRET=                   # HS256 shared secret; when set, requireAuth() will start enforcing signatures
SUPABASE_JWT_SECRET=          # alt env name for Supabase-issued JWTs

# Supabase (when linked) — see .env.example + src/lib/supabaseClient.ts
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=                 # server-side; used by SupabaseBlueprintRepository (commented)
SUPABASE_SERVICE_ROLE_KEY=    # server-side; never expose to client; OR use anon + RLS
```

`NODE_ENV=production` enables HSTS and strips stack traces from 500 responses.

## Vite Proxy

`vite.config.ts` `server.proxy["/api"].target = http://127.0.0.1:3001`. If the
backend is down, `src/backend/client.ts` `backendClient.generatePromptWithFallback`
falls back to the local `generatePrompt` so the UI keeps working.

## Supabase swap (when DB linked)

The `SupabaseBlueprintRepository` stub is committed in commented form at
`src/backend/repositories/blueprintRepository.ts:176-259`. To activate:

1. **Provision project**: `npx supabase projects create --org-id <org> --region ap-south-1`
2. **Link + push schema**: `npx supabase link --project-ref <ref>` then `npx supabase db push` (schema in `supabase/migrations/001_initial.sql`).
3. **Generate types**: `npx supabase gen types typescript --linked > src/lib/database.types.ts`.
4. **Configure env**: set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (server-side only — never commit).
5. **Uncomment the stub** in `blueprintRepository.ts:176`, or import it directly.
6. **Swap the singleton** at `blueprintRepository.ts:265-266`:
   ```ts
   const baseRepo = new SupabaseBlueprintRepository()
   export const blueprintRepo = new CachedBlueprintRepository(baseRepo, 300)
   ```
7. **Verify**: `pnpm build:backend` (typecheck) + `pnpm test` (still 158 green with mocked backend) + `curl /api/blueprints` against a remote DB.

The `Database` type in `src/lib/supabaseClient.ts` declares the `blueprint_documents`
table shape used by the stub. Field mapping (record ↔ row) is documented inline
in the stub. RLS hardening (see `SUPABASE_SYNC.md` §9) is a prerequisite for
production auth.

## Verification

```bash
pnpm build:backend   # tsc noEmit — must pass
pnpm build           # vite build — must pass (backend not bundled)
pnpm test            # vitest run — must pass (158/158)
curl http://localhost:3001/api/health
curl http://localhost:3001/api/skills
curl -X POST http://localhost:3001/api/generate-prompt \
  -H "Content-Type: application/json" \
  -d '{"state":{"projectName":"Demo"}}'
curl -X POST http://localhost:3001/api/parse-response \
  -H "Content-Type: application/json" \
  -d '{"aiResponse":"--- FILE: TEST.md ---\nhello\n--- END FILE ---"}'
```

## Migration from v1 → v2.0

- New endpoints: `GET /api/blueprints/:id`, `DELETE /api/blueprints/:id`, `GET /api/skills`, `POST /api/validate`. Existing `/api/generate-prompt` and `/api/parse-response` unchanged in body shape — `frontend/src/App.tsx` and `src/backend/client.ts` continue to work.
- Errors now include `code` and `requestId`; old consumers that only read `error` are still fine.
- New middleware (`logger`, `rateLimiter`, `auth`) is opt-in for routes; controllers can apply `requireAuth` / `requirePermission` per-route when needed.
- `SkillsCatalog` is now shared with the frontend via `src/lib/skillsCatalog.ts`; backend `GET /api/skills` returns all 15 items (was 8 in v1).

## Next (when DB linked + auth enforced)

- Add `zod` for declarative body schemas (currently manual but duck-types `ZodError`).
- Add `jsonwebtoken` and verify signatures when `JWT_SECRET` set; gate mutating routes (`POST /api/generate-prompt`, `DELETE /api/blueprints/:id`) behind `requireAuth`.
- Move `InMemoryBlueprintRepository` → `SupabaseBlueprintRepository` (see swap above).
- Add `src/lib/parse.ts` to backend route for shared regex (already used by frontend tests).
- Add `GET /api/blueprints/:id/files` to stream parsed file list separately.

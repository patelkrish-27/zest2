# Zest Blueprint — Backend

Minimal Node.js + Express backend scaffolded under `src/backend/` (default stack: `Node.js (Express)` from `App.tsx` `backendFrameworks` selection). Mirrors frontend-only Vite app until Supabase/Postgres is linked.

## Stack & Principles — `backend-patterns` skill

- **Repository / Service separation**: `repositories/blueprintRepository.ts` (data access) + `services/promptService.ts` (business logic). No N+1, no direct DB in controllers.
- **Thin controllers**: `routes/blueprint.ts` only validates + delegates to service+repo.
- **Centralized error + 404 middleware**: `middleware/errorHandler.ts`.
- **Validation**: lightweight request guards in `middleware/validate.ts` (Zod-ready; currently manual to avoid extra deps at boot).
- **CORS + dotenv** at server entry; host `0.0.0.0` to match Vite `8443` preview.
- **Supabase coordination**: `src/lib/supabaseClient.ts` holds typed `Database` shape and `getSupabase()`; backend repository is `InMemoryBlueprintRepository` now, swap to `SupabaseBlueprintRepository` when DB agent finishes schema (see `DATABASE.md` below).

## Layout

```
src/backend/
  types.ts                    # PartialBlueprintState, SkillDTO
  services/promptService.ts   # buildPrompt() + parseResponse() — extracted from src/App.tsx generatePrompt()
  repositories/blueprintRepository.ts  # BlueprintRepository interface + InMemory impl
  middleware/errorHandler.ts  # AppError, errorHandler, notFound
  middleware/validate.ts      # requireJsonBody, validateGeneratePrompt/ParseResponse
  routes/blueprint.ts         # POST /api/generate-prompt, POST /api/parse-response, GET /api/blueprints
  routes/health.ts            # GET /health and GET /api/health
  server.ts                   # Express app + listen (HOST 0.0.0.0, PORT 3001)
  client.ts                   # Frontend fetch wrapper with fallback (imported by App.tsx)
tsconfig.backend.json         # isolated type-check for src/backend
```

## API

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/api/health` | — | `{ status:"ok", uptime, timestamp, service, version }` |
| `GET` | `/health` | — | same (convenience) |
| `POST` | `/api/generate-prompt` | `{ state: PartialBlueprintState, config?: { customSections, skillsCatalog } }` | `{ prompt: string, length }` |
| `POST` | `/api/parse-response` | `{ aiResponse: string }` | `{ files: {name,content}[], count }` |
| `GET` | `/api/blueprints` | — | `{ items: BlueprintRecord[] }` (in-memory, debug) |

`generate-prompt` logic is **identical** to `src/App.tsx` `generatePrompt()` — backend is the source of truth; frontend `backendClient.generatePromptWithFallback()` tries backend via Vite proxy and falls back to local function if offline (see `src/App.tsx:handleCopyPrompt`).

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
```

### Env

```
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
CORS_ORIGIN=http://localhost:8443,http://127.0.0.1:8443
# Vite forwards /api -> 127.0.0.1:${BACKEND_PORT} via vite.config.ts server.proxy
VITE_API_BASE=                # empty => same-origin; set to http://localhost:3001 when not using proxy
```

Supabase (when linked) — see `.env.example` + `src/lib/supabaseClient.ts`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=...
```

## Vite Proxy

`vite.config.ts` `server.proxy["/api"].target = http://127.0.0.1:3001`. If backend is down, frontend `backendClient` fallback keeps `Copy Prompt` and `Parse Blueprint` working offline.

## DATABASE.md Coordination

`promptService.buildPrompt()` emits a `DATABASE.md` section via the master prompt (`Required files: ... 5. DATABASE.md`). When Supabase is live, replace `InMemoryBlueprintRepository` with a Supabase impl:

```ts
export class SupabaseBlueprintRepository implements BlueprintRepository {
  async save(r) { const { data, error } = await supabase.from("blueprint_documents").insert(...) }
}
```

Schema lives in `src/lib/supabaseClient.ts` `Database` type (tables: `projects`, `frontend_configs`, `backend_configs`, `architecture_specs`, `theme_configs`, `custom_answers`, `project_skills`, `blueprint_documents`, `ai_responses`). Share final `DATABASE.md` generation with DB agent via `supabase/migrations/*`.

## Verification

```bash
pnpm build:backend   # tsc noEmit — must pass
pnpm build           # vite build — must pass (backend not bundled)
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/generate-prompt -H "Content-Type: application/json" -d '{"state":{"projectName":"Demo"}}'
curl -X POST http://localhost:3001/api/parse-response -H "Content-Type: application/json" -d '{"aiResponse":"--- FILE: TEST.md ---\nhello\n--- END FILE ---"}'
```

Backend is **file-based coordination only** per project brief — no supabase migration applied yet; DB agent owns RLS/policies.

## Next (when DB linked)

- Add `zod` + `supabase-js` server validation.
- Swap `InMemoryBlueprintRepository` -> `SupabaseBlueprintRepository`.
- Add auth middleware (`src/backend/middleware/auth.ts`) for `project_skills` RLS.
- Add `GET /api/blueprints/:id` + pagination.

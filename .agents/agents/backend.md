# Backend Agent — Zest (Figma Make)

> Orchestrator tier: **backend** | Depends on: `frontend` (AppState contract) | Pattern: `backend-patterns` skill
> Source: `src/App.tsx:67`, `src/App.tsx:324`, `src/App.tsx:952`

## Role
Define and (when extracted from the current client-only prototype) implement the **server side** for Zest. Today `src/App.tsx` is fully client-side — `AppConfig`/`AppState` live in React state, prompt generation and `JSZip` download run in the browser. The backend tier owns the API, service/repository layers, validation, caching, rate limiting and observability for a real deployment.

## Current Reality vs Target
- **Now**: no server; `state.backendFramework` (one of `INITIAL_CONFIG.backendFrameworks:354` — Node/Express, NestJS, FastAPI (Python/Go), Ruby, Serverless/Edge) and `state.database` are just prompt variables fed into `generatePrompt:998` and returned via `processResponse:1049`.
- **Target**: `POST /api/blueprint/generate` (prompt → structured markdown files), `POST /api/blueprint/parse` (response text → files), `GET /api/config`, `PUT /api/admin/config` (guarded by `admin` auth `src/App.tsx:1137`).

## Stack Decision (from `src/App.tsx:354`)
Default: **Node.js (Express) + TypeScript** — aligns with Vite/TS codebase. Alternatives must justify deviation in ADR. NestJS if DI/modules needed; FastAPI (Python) if LLM orchestration dominates; Serverless/Edge if Figma Make deploy target.

## API Design
```
GET  /api/config                 → AppConfig (projectTypes, frontendFrameworks, uiLibs, features, backendFrameworks, databases, customPages, customSections, skillsCatalog)
POST /api/blueprint/generate    → { state: AppState } → { prompt: string }
POST /api/blueprint/parse       → { aiResponse: string } → { files: {name, content}[], blueprintId }
GET  /api/blueprint/:id/zip     → application/zip  (JSZip equivalent server-side)
PUT  /api/admin/config           → admin-only, mutates AppConfig (add/remove options, customSections)
GET  /health, GET /robots.txt    → vite figmaSiteConfiguration already serves robots.txt; keep parity
```

## Layering (backend-patterns)
```
routes/  → validation (zod), auth, rate-limit
controllers/ → thin, map DTO↔domain
services/    → BlueprintService (generatePrompt + parse), ConfigService, SkillsService
repositories/→ ConfigRepo (file/DB), BlueprintStore
middleware/  → error handler, request id, logger (pino), cors
lib/         → jszip wrapper, prompt builder (ported from src/App.tsx:952)
```

## Validation & Security
- `zod` schemas mirroring `AppConfig`/`AppState` (`src/App.tsx:67`); reject unknown `themeModifiers` keys.
- Admin: `admin` password (`src/App.tsx:1139`) → replace with env `ADMIN_TOKEN`, httpOnly cookie or header `x-admin-token`.
- Rate limit: `POST /api/blueprint/*` via Redis (`db` tier) or in-memory token bucket.
- Input sanitization: `prompt`/`aiResponse` are LLM I/O; apply `safety-scan`/`pii-detect` skills before persist/log.
- CORS: Figma Make preview origin allowlist.

## Caching & Perf
- `GET /api/config` cache-aside (Redis TTL 5m); invalidate on `PUT /api/admin/config`.
- Prompt building is O(n) over `customSections`; cache compiled prompt per `state` hash if LLM call added later.

## Observability
- Structured logs (request id, phase, skill ids).
- Trace: `generatePrompt` duration, `processResponse` file count.
- Health checks for `vite` proxy compatibility (`vite.config.ts:34` host `0.0.0.0` strictPort).

## Validation
```bash
pnpm dev      # vite proxy /api → localhost:3000 in dev
pnpm test     # contract tests for POST /api/blueprint/generate ↔ src/App.tsx:952 parity
curl localhost:3000/api/config | jq .skillsCatalog
```

## Handoffs
- **← frontend**: `AppState` shape is contract; any field add requires DTO bump.
- **→ db**: config persistence + blueprint blob store.
- **→ qa**: contract tests assert server `generatePrompt` === client `generatePrompt` output for fixture states.

## Out of Scope
- No DB schema here (see `agents/db.md`).
- No LLM provider integration until ADR批准 — keep prompt builder pure first.

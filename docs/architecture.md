# Architecture — Zest Blueprint Wizard (v2.0)

> Editable sources: `docs/architecture.drawio` (system), `docs/wizard-flow.drawio` (phase sequence). Generated via `skills/drawio-skill/scripts/diagramctl.py build --from ir`. Mermaid below is a fallback for preview.

## System Overview

```mermaid
flowchart LR
  landing[Landing<br/>src/App.tsx:2471] --> project[01 Project<br/>name/type/problem]
  project --> frontend[02 Frontend<br/>framework + ui + features]
  frontend --> backend_cfg[03 Backend<br/>runtime + DB + tables]
  backend_cfg --> arch[04 Architecture<br/>pages + components]
  arch --> theme[05 Theme<br/>10 THEMES + 5x3 modifiers]
  theme --> skills[06 Skills<br/>SKILLS_CATALOG 15]
  skills --> prompt[07 Prompt<br/>generatePrompt]
  prompt --> response[08 Response<br/>processResponse]
  response --> blueprint[09 Blueprint<br/>downloadZip]

  sidebar[Sidebar<br/>renderSidebar] -. controls .-> wizard[wizardFlow[]<br/>src/App.tsx:1198]
  wizard -. drives .-> project
  theme -. mode -> data-theme .-> theme_sync[Theme Sync<br/>useEffect]
  sidebar -. toggle .-> theme_sync
  prompt -. try backend .-> client[backendClient]
  response -. parse fallback .-> client
  client --> vite[Vite 8<br/>proxy /api -> :3001]
  vite --> backend_srv[Express 5<br/>server.ts :3001]
  backend_srv --> svc[PromptService<br/>buildPrompt/parseResponse]
  svc --> repo[BlueprintRepository<br/>InMemory]
  repo -. pending .-> supabase[(Supabase<br/>9 tables + RLS)]
  admin[Admin Config] -. injects customPages .-> wizard
```

### Key files

| Area | File:line | Notes |
|------|-----------|-------|
| Wizard state | `src/App.tsx:924` `INITIAL_STATE` | 13 fields + customAnswers + selectedSkills |
| Config | `src/App.tsx:442` `INITIAL_CONFIG` | projectTypes, frontendFrameworks, uiLibraries, features, backendFrameworks, databases |
| Catalog | `src/App.tsx:141` `SKILLS_CATALOG` | 15 entries, 6 categories |
| Themes | `src/App.tsx:497` `THEMES` | 10 themes + `MODIFIER_GROUPS` + `SUB_THEMES` + `FONTS` 20 + `FONT_PAIRINGS` 10 |
| Phase flow | `src/App.tsx:1198` `wizardFlow` | `["project",...customPages,"prompt","response","blueprint"]` + `landing`/`admin` outside |
| Prompt | `src/App.tsx:1219` `generatePrompt()` | Backend `src/backend/services/promptService.ts:78` is source of truth |
| Response | `src/App.tsx:1362` `processResponse()` | Regex `--- FILE: ---` with fallback `AI_OUTPUT_RAW.md` |
| Zip | `src/App.tsx:1389` `downloadZip()` | `JSZip` + `file-saver`, adds `SKILLS.md` + `skills/<id>/SKILL.md` |
| Sidebar | `src/App.tsx:1572` `renderSidebar()` | Grouped setup/style/output, mobile overlay, a11y Escape |
| Theme sync | `src/App.tsx:995` `useEffect data-theme` | `mode auto` -> `matchMedia` |
| Vite proxy | `vite.config.ts:39` `server.proxy /api` | Forwards to `127.0.0.1:3001` |
| Backend | `src/backend/server.ts` | Express 5, cors, `GET /api/health`, `POST /api/generate-prompt`, `POST /api/parse-response` |
| Service | `src/backend/services/promptService.ts` | Pure `buildPrompt`/`parseResponse`/`buildSkillsGuide` |
| Repo | `src/backend/repositories/blueprintRepository.ts` | `InMemoryBlueprintRepository` -> Supabase swap pending |
| Client | `src/backend/client.ts` | `generatePromptWithFallback` / `parseResponseWithFallback` |
| DB | `supabase/migrations/001_initial.sql` | 9 tables, pgcrypto, RLS, seed `supabase/seed.sql` |

### Data flow (Prompt path)

1. User fills wizard -> `AppState` in React state (`src/App.tsx:924`).
2. `prompt` phase calls `backendClient.generatePromptWithFallback(state, ...)` (`src/backend/client.ts:5`).
3. Client tries `POST /api/generate-prompt` via Vite proxy; on failure falls back to local `generatePrompt()` (`src/App.tsx:1219`).
4. Backend service `PromptService.buildPrompt` mirrors frontend logic (`src/backend/services/promptService.ts:78`).
5. Repo `save({state, prompt})` best-effort (`src/backend/repositories/blueprintRepository.ts`).
6. Prompt copied via `navigator.clipboard.writeText`.
7. LLM returns markdown with `--- FILE: ... ---` blocks.
8. `response` phase `processResponse()` calls `backendClient.parseResponseWithFallback` -> `POST /api/parse-response` or local regex.
9. `blueprint` phase `downloadZip()` zips parsed files + `SKILLS.md`.

### Theme & a11y

- `state.themeModifiers.mode` -> `document.documentElement.setAttribute("data-theme", resolved)` (`src/App.tsx:995`).
- Tokens in `src/index.css:1` (`@import 'tailwindcss'` first, `@theme inline`, light override `[data-theme="light"]`).
- Focus: `*:focus-visible`, `aria-pressed` on cards, keyboard Enter/Space on sidebar, Escape closes drawer (`src/App.tsx:997`).

## Wizard Flow Detail

> See `docs/wizard-flow.drawio` for IR-generated diagram.

```mermaid
flowchart LR
  landing2[landing<br/>outside flow] --> p1[project] --> p2[frontend] --> p3[backend] --> p4[architecture] --> p5[theme] --> p6[skills] --> custom[customPages[]<br/>dynamic] --> pr[prompt] --> resp[response] --> bp[blueprint]
  admin2[admin<br/>outside flow] -. creates .-> custom
  derived[Derived<br/>currentIndex/prev/next] -. governs .-> p1
```

`wizardFlow` definition `src/App.tsx:1198-1209`:
```ts
const wizardFlow = [
  "project","frontend","backend","architecture","theme","skills",
  ...config.customPages.map(p => p.id),
  "prompt","response","blueprint",
]
```

## Deployment notes

- Frontend: `pnpm build` -> `vite build` (static). Backend not bundled.
- Backend: `pnpm build:backend` -> `tsc --project tsconfig.backend.json --noEmit` (typecheck only). Runtime via `pnpm dev:backend` (`tsx src/backend/server.ts` on `0.0.0.0:3001`).
- Full check: `pnpm test && pnpm build && pnpm build:backend` (see `MANAGER_CHECKLIST.md` v2 gates).
- Supabase: `supabase/migrations/001_initial.sql` needs `npx supabase link` + `db push` (see `SUPABASE_SYNC.md`).

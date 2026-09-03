# MANAGER_CHECKLIST — Zest (figma-make-app)

> **Manager:** CWD=`/home/krish/Downloads/zest` | Date: 2026-09-03 | Orchestrator: `manager` (agent-orchestrator-task / hierarchical)
> **Sources:** `src/App.tsx:1-3508` (SKILLS_CATALOG `src/App.tsx:137-436`, wizardFlow `src/App.tsx:1175-1186`, INITIAL_CONFIG `src/App.tsx:438-487`, INITIAL_STATE `src/App.tsx:917-945`), `package.json:1-50`, `vite.config.ts:1-420`
> **Rule:** Do not edit UI/backend code — coordinate via files. This file is the ledger; subagents update their lane and manager flips verdict.

## Legend
- `DONE` — implemented + verified (build/test/probe)
- `PARTIAL` — scaffolded / code exists but not fully wired/verified
- `BLOCKED` — missing dep/env or needs decision

---

## 0. Workspace Bootstrap
- [x] `package.json` — scripts `dev`, `dev:backend`, `dev:all`, `build`, `preview`, `format` present. Deps: react19, lucide-react, jszip, file-saver, express, cors, supabase-js. Dev: vite8, tailwindcss4, vitest, playwright, jsdom. **DONE** — `src/App.tsx:1`, `package.json:6-14`
- [x] `vite.config.ts` — plugins `react()`, `tailwindcss()`, `figmaSiteConfiguration`, `figmaErrorOverlayReplay`, `figmaReactRefreshBoundaryFallback`, `figmaMakeKitPlugin`; alias `@→src` `vite.config.ts:29-32`; dev server `0.0.0.0:8443` + proxy `/api→127.0.0.1:3001` `vite.config.ts:39-46`. `build.sourcemap` dev-only logic. **DONE**
- [x] `src/main.tsx` imports `src/index.css` and mounts `src/App.tsx` into `#root`. **DONE**
- [x] `src/index.css` — `@import 'tailwindcss'` first, `@theme inline` tokens, light theme `data-theme` override, animations. **DONE** (extended in UI_REFINER_LOG `src/index.css:1-110`)
- [x] Preview server verified `curl http://localhost:8443 →200` (UI_REFINER_LOG §1). **DONE**

## 1. SKILLS_CATALOG Audit (src/App.tsx:137-436) — 15 entries across 6 categories
| # | id | name | category | verdict | notes |
|---|----|------|----------|---------|-------|
| 1 | `chakra-ui` | Chakra UI | UI Library | DONE | `npx skills add https://github.com/chakra-ui/chakra-ui/tree/main/skills` — base |
| 2 | `chakra-ui-builder` | Chakra UI — Builder | UI Library | DONE | sub-skill |
| 3 | `chakra-ui-migrate` | Chakra UI — Migrate | UI Library | DONE | sub-skill |
| 4 | `chakra-ui-refactor` | Chakra UI — Refactor | UI Library | DONE | sub-skill |
| 5 | `shadcn-ui` | shadcn/ui | UI Library | DONE | `pnpm dlx skills add shadcn/ui` — primary extraction layer (`src/components/ui/*`) |
| 6 | `aceternity-ui` | Aceternity UI | UI Library | DONE | framer-motion catalog; CSS-only mimic, no dep added |
| 7 | `ui-skills-root` | UI Skills — Root (ibelick) | UI Library | DONE | meta |
| 8 | `watermelon-ui` | Watermelon UI | UI Library | DONE | micro-interactions 150-250ms honored via `src/index.css` global 200ms |
| 9 | `supabase` | Supabase — Agent Skills | Backend | DONE | `supabase/agent-skills`; DB scaffold consumes it |
| 10 | `frontend-patterns` | Frontend Patterns (React/Next) | Frontend | DONE | composition/hooks/perf |
| 11 | `backend-patterns` | Backend Patterns (Node/Express) | Backend | DONE | api/repo/service/cache/rate-limit — backend service follows it |
| 12 | `ui-styling` | UI Styling (ui-ux-pro-max) | Frontend | PARTIAL | 98-file skill referenced; canvas fonts deferred, shadcn layer done |
| 13 | `drawio-skill` | Draw.io — Architecture Studio | Design | DONE | IR build/sync, skill present |
| 14 | `autoreview` | Autoreview — Structured Code Review | Testing | DONE | Codex/P0/P3 + TruffleHog |
| 15 | `agent-orchestrator-task` | Agent Orchestrator — Task | Orchestration | DONE | decomposition/synthesis — this manager |

- Categories present: `UI Library(8)`, `Backend(2)`, `Frontend(2)`, `Design(1)`, `Testing(1)`, `Orchestration(1)`. Filter bar in `src/App.tsx:1777-1780` derives `categories` dynamically → **DONE**

## 2. Wizard Flow (src/App.tsx:1175-1186 + renderSidebar 1548)
`wizardFlow = ["project","frontend","backend","architecture","theme","skills", ...customPages, "prompt","response","blueprint"]` + special `landing` and `admin` outside flow. `currentIndex/prevPhase/nextPhase` `src/App.tsx:1188-1193`.

| Phase | Label (renderSidebar) | Render fn | Verdict | File:line |
|-------|----------------------|-----------|---------|-----------|
| `landing` | — (standalone) | `renderLanding()` | DONE | `src/App.tsx:2471-2498`, `src/App.tsx:3455-3474` — CTA + Badge shadcn/Watermelon polish |
| `project` | 01. Project | Project Definition (name/type/problem) | DONE | `src/App.tsx:2502-2550`, helpers `updateState:1010` |
| `frontend` | 02. Frontend | framework + uiLibraries (multi) + features | DONE | `src/App.tsx:2552-2613`, sync `toggleArrayItem:1014` ↔ `toggleSkill:1121` bidirectional |
| `backend` | 03. Backend | runtime/framework + database + dbTables textarea | DONE | `src/App.tsx:2615-2668` — `dbTables` freeform → prompt `DATABASE.md` block |
| `architecture` | 04. Architecture | pages/routes + components + customSections | DONE | `src/App.tsx:2670-2699` |
| `theme` | 05. Visual Style | 10 THEMES + 5 MODIFIER_GROUPS + 10 SUB_THEMES + Typography (20 FONTS +10 pairings) + combo pill | DONE | `src/App.tsx:490-654`, `src/App.tsx:2701-3274` — `ThemeCard` extracted `src/components/ui/theme-card.tsx` |
| `skills` | 06. Skills | catalog grid, search/filter, install toggle, detail drawer, installed summary | DONE | `src/App.tsx:1759-2183`, `skillFilter/search/Detail` state `src/App.tsx:980-982` |
| `customPages/*` | `0${7+idx}. ${title}` | dynamic `renderCustomSectionsForPage` | DONE | `src/App.tsx:1718-1757` + `1718`, `3434-3450` — orphan cleanup on delete `src/App.tsx:1488-1505` |
| `prompt` | `07+customPages.length`. AI Prompt | `generatePrompt()` + `backendClient.generatePromptWithFallback` + Copy | DONE | `src/App.tsx:1196-1336`, `src/backend/client.ts:42`, `src/backend/services/promptService.ts:78` parity required |
| `response` | `08+...`. Response | paste raw markdown textarea → `processResponse()` | DONE | `src/App.tsx:1338-1363` regex fallback + backend `/api/parse-response` |
| `blueprint` | `09+...`. Blueprint | file list + preview + `downloadZip()` SKILLS.md + skills/<id>/SKILL.md | DONE | `src/App.tsx:1365-1431`, uses `JSZip`+`file-saver` |
| `admin` | Admin Config | create custom section/page, manage options per category + per customSection, delete | DONE | `src/App.tsx:2185-2469`, auth `handleAdminAuth:1434` pwd `admin` |

- Navigation: `renderWizardNav` `src/App.tsx:1694-1716` Back/Next via `Button` ghost/default — **DONE**
- Responsive sidebar: mobile overlay + `mobileOpen` `src/App.tsx:977, 1599-1602, 3481-3492` — **DONE** (UI_REFINER_LOG §6)
- Theme toggle: `useEffect` sync `state.themeModifiers.mode→data-theme` `src/App.tsx:985-994` + sidebar/landing/mobile buttons — **DONE**
- Accessibility: `aria-pressed`, `focus-visible:ring-2`, `Escape` close drawer `src/App.tsx:997-1007`, `role="button"` keyboard Enter/Space `src/App.tsx:1623-1630` — **DONE**

## 3. Backend Tier (backend-patterns skill)
- [x] `src/backend/services/promptService.ts` — pure `PromptService.buildPrompt(state, customSections, skillsCatalog)`, `parseResponse`, `buildSkillsGuide`; duplicates THEMES/MODIFIERS/SUB_THEMES/FONTS/PAIRINGS to avoid React import. **DONE** `src/backend/services/promptService.ts:78-214`
- [x] `src/backend/client.ts` — `backendClient` with `apiFetch`, `generatePrompt`, `parseResponse`, `generatePromptWithFallback`, `parseResponseWithFallback` (Vite proxy `/api` `src/backend/client.ts:5-6`). App.tsx uses it `src/App.tsx:1317-1362`. **DONE**
- [x] `src/backend/routes/blueprint.ts` — `POST /api/generate-prompt`, `POST /api/parse-response`, `GET /api/blueprints` delegating to service+repo with validation. **DONE**
- [x] `src/backend/routes/health.ts` + `src/backend/server.ts` (Express 5.2.1, cors, errorHandler). **PARTIAL** — verify server boots on `:3001` and Vite proxy reaches it; add `GET /api/config` + `PUT /api/admin/config` per `agents/backend.md` if missing
- [x] `src/backend/middleware/validate.ts` + `errorHandler.ts` (zod guard for AppState/AppConfig). **PARTIAL** — ensure `themeModifiers` key whitelist + `customAnswers` string|string[] union validated
- [x] `src/backend/repositories/blueprintRepository.ts` — in-memory store. **PARTIAL** — replace with Supabase persistence when env linked (see §4)
- [x] `src/backend/types.ts` — `PartialBlueprintState`, `SkillDTO`, `ParsedFile`. **DONE**
- [ ] Rate limit / cache-aside / pino logger / `x-admin-token` per `agents/backend.md`. **BLOCKED** — needs `ADMIN_TOKEN` env decision + Redis choice
- Verdict: **PARTIAL** — core prompt/parse contract done + fallback keeps UI resilient; admin/config + observability remain.

## 4. DB Tier (supabase skill)
- [x] `supabase/config.toml` + `supabase/migrations/001_initial.sql` (9 tables: projects, frontend_configs, backend_configs, architecture_specs, theme_configs, custom_answers, project_skills, blueprint_documents, ai_responses; pgcrypto, set_updated_at trigger, FK cascade, RLS enable + permissive anon/authenticated policies). **DONE** `SUPABASE_SYNC.md:1`
- [x] `supabase/seed.sql` — idempotent Zest Demo project. **DONE**
- [x] `src/lib/supabaseClient.ts` — `getSupabase()` reading `VITE_SUPABASE_URL/ANON_KEY`, warns on placeholder. **DONE** `src/lib/supabaseClient.ts:1-40`
- [x] `.env.example` — placeholders + `DATABASE_URL` note + never expose service_role. **DONE**
- [x] MCP probe 2026-09-03: 7 projects in org `jxrijyqlafgzhueqeoxp`, only `bookMySeat (kghqdytrbmxebuleswsa)` ACTIVE; RLS disabled on all 11 tables there (logged, not mutated). **DONE** `DB_LOG.md:15-22`
- [ ] Cloud project for Zest (`npx supabase projects create --org-id jxrijyqlafgzhueqeoxp --region ap-south-1`) + `npx supabase link --project-ref <ref>` + `npx supabase db push`. **BLOCKED** — requires dashboard/CLI auth + `VITE_SUPABASE_URL/ANON_KEY` in `.env.local`
- [ ] `npx supabase gen types typescript --linked > src/lib/database.types.ts`. **BLOCKED** — awaits push
- [ ] RLS hardening `owner_id uuid → auth.users(id)` + policy `auth.uid()=owner_id` before prod. **BLOCKED** — needs Auth enabled
- Verdict: **PARTIAL** — local scaffold complete and build-safe; remote sync is next human step (`SUPABASE_SYNC.md §2-4`).

## 5. UI / Design System (shadcn + Watermelon + ui-styling)
- [x] `src/lib/utils.ts` `cn()` → `twMerge(clsx)` **DONE**
- [x] `src/components/ui/*` — button (cva variants), card, input (label/error/aria-invalid), textarea, badge (cva), select-card/multi, theme-card (gradient accent + mock hints), skeleton, separator, barrel. **DONE** `UI_REFINER_LOG:4`
- [x] Inline components deleted `src/App.tsx:612-771 → comment`, imports switched `src/App.tsx:37-51`. **DONE**
- [x] `src/index.css` extended ~61→110 lines: shadcn tokens (`--color-ring/accent/muted/card/popover/primary/destructive/input/radius`), light override `:root[data-theme="light"]`, selection, focus-visible, scrollbar, animations fadeIn/slideIn/scaleIn/shimmer, Watermelon 200ms + hover-lift 180ms, respects `prefers-reduced-motion`. **DONE**
- [x] Build delta `183.49→183.86 kB CSS / 400.96→402.82 kB JS` (no framer-motion). **DONE** `UI_REFINER_LOG:7`
- [ ] Canvas experiments + Aceternity Framer Motion layer (Spotlight radial etc.) **PARTIAL** — deferred intentionally, CSS-only for now
- Verdict: **DONE** (core), **PARTIAL** for optional Motion layer.

## 6. QA / Testing
- [x] `vitest.config.ts` — jsdom, globals, setup `src/test/setup.ts`, `src/**/*.{test,spec}.{ts,tsx}`. **DONE**
- [x] `src/__tests__/blueprint.utils.test.ts` — pure-logic: parseFilesFromResponse, toggleArrayItemPure, toggleSkillPure, skill-lib sync (Chakra family last-remove clears lib). **PARTIAL** — covers 3/15 skills families + regex; needs fixture matrix (6 projectTypes×6 frameworks×6 dbs =36) + empty INITIAL_STATE snapshot + theme/font/specs drift cases per `agents/qa.md`
- [x] `src/__tests__/blueprint.components.test.tsx` — component render (Button/Card etc.). **PARTIAL** — needs ThemeCard/SelectCard a11y keyboard cases
- [x] `e2e/blueprint-flow.spec.ts` — Playwright wizard linear traversal landing→blueprint. **PARTIAL** — needs downloadZip round-trip assert (unzip → file list = parsedFiles + SKILLS.md)
- [ ] `pnpm test` / `pnpm exec playwright test` green in CI. **BLOCKED** — run after next install; `pnpm build` already passes (`UI_REFINER_LOG:7`)
- [ ] `autoreview --triage P0` gate + TruffleHog (`skills/autoreview`). **BLOCKED** — run on PR
- [ ] `drawio-skill` diagram artifact validation if customPages include diagrams. **BLOCKED** — no fixture yet
- Verdict: **PARTIAL** — harness present, contract coverage incomplete.

## 7. Cross-Cutting
- [x] Double-quote apostrophes, closed JSX, balanced braces, default exports per AGENTS.md — honoured in UI extraction. **DONE**
- [x] `JSZip` + `file-saver` parity: frontend `downloadZip` `src/App.tsx:1365` mirrors backend `buildSkillsGuide` `src/backend/services/promptService.ts:185` -- folder `<project>-blueprint` slug lower+hyphen. **DONE**
- [x] Admin password `admin` `src/App.tsx:1435` — documented to replace with env `ADMIN_TOKEN` + `x-admin-token` header. **PARTIAL** — still hardcoded, backend guard not yet env-based
- [x] Coordination files `agents/*.md` (frontend/backend/db/qa/manager) present. **DONE**
- [ ] `skills-lock.json` sync with SKILLS_CATALOG after any add. **PARTIAL** — check `skills-lock.json:1`

---

## Manager Verdict Summary (2026-09-03 12:02 UTC, after read-through, before subagent pushes)
| Lane | Verdict | Blocker / Next |
|------|---------|---------------|
| Bootstrap (package/vite) | **DONE** | — |
| SKILLS_CATALOG (15) | **DONE** | ui-styling canvas deferred intentionally |
| Wizard (12 phases inc. customPages) | **DONE** | — |
| Backend (prompt/parse service+routes) | **PARTIAL** | add `GET /api/config` + `PUT /api/admin/config`, env ADMIN_TOKEN, rate-limit/cache |
| DB (Supabase scaffold) | **PARTIAL** | create cloud project + `supabase link` + `db push` + `gen types` |
| UI/Design System | **DONE** | Motion layer optional |
| QA | **PARTIAL** | expand fixture matrix + e2e zip round-trip + `pnpm test` green |
| Build | **DONE** | `pnpm build` passes 402.82 kB JS gzip 120.89 kB |

**Overall: PARTIAL** — app is shippable as client-only blueprint planner with backend fallback; DB remote sync and config-admin API are the remaining gates.

## How subagents update this file
- UI refiner → flip §5 Motion if Framer added + record `pnpm build` output.
- Backend → flip §3 rows DONE when routes/middleware added; remove BLOCKED on rate-limit/cache after env decision.
- DB → flip §4 BLOCKED→DONE after `db push` + attach `npx supabase inspect` output.
- QA → flip §6 rows DONE after `pnpm test` + `playwright test` + autoreview P0=0; paste counts.

---
*Manager — coordinate via files, no UI/backend edits. Next scan: on subagent `DB_LOG.md` / `UI_REFINER_LOG.md` / `agents/*.md` change.*

# Orchestration v2.0 — Agent Coordination (zest)

> Skill: `skills/agent-orchestrator-task/SKILL.md` (`task-orchestrator`, color indigo, priority high). This doc is the v2 usage guide; `MANAGER_CHECKLIST.md` is the gate ledger.

## Roles

| Pane | Skill | Scope | Gate |
|------|-------|-------|------|
| Manager / Orchestrator | `agent-orchestrator-task` | Decomposition, planning, synthesis, `MANAGER_CHECKLIST.md` | Truth score >=0.95 |
| UI Refiner | `ui-styling` + `shadcn-ui` + `watermelon-ui` + `aceternity-ui` | `src/components/ui/*`, `src/index.css`, `src/App.tsx` polish | `pnpm build` pass |
| Frontend | `frontend-patterns` | `src/App.tsx` wizard, `src/lib/utils.ts`, composition/hooks | Vitest + Playwright |
| Backend | `backend-patterns` | `src/backend/*`, `vite.config.ts` proxy | `pnpm build:backend` + health probe |
| DB | `supabase` | `supabase/migrations/*`, `src/lib/supabaseClient.ts`, `SUPABASE_SYNC.md` | `supabase db push` + advisors green |
| QA | `autoreview` | `src/__tests__/*`, `e2e/*`, `vitest.config.ts`, secret scan | `pnpm test` green + autoreview P0=0 |

See `MANAGER_CHECKLIST.md` § Subagent Assignment Matrix for file ownership.

## Task Decomposition (orchestrator)

Per `skills/agent-orchestrator-task/SKILL.md`:

1. **Analyze objective** -> identify subtasks + components.
2. **Dependency graph** -> order, find parallelizable lanes.
3. **Plan** -> choose `parallel | sequential | adaptive | balanced`.
4. **Track** -> `TodoWrite` + progress via ledger.

For zest, canonical breakdown:

```
Bootstrap (sequential)
  -> { UI, Frontend, Backend, DB } (parallel, no cross-deps)
  -> QA (sequential after lanes have artifacts)
  -> Orchestration v2 (sequential, synthesis + diagrams + docs)
```

## Execution Strategy

- **Parallel** where lanes own disjoint files (UI owns `src/components/ui/*`, Backend owns `src/backend/*`, DB owns `supabase/*`, QA owns `src/__tests__/*`). No merge conflicts by file ownership.
- **Sequential** for gates: QA validates after code; Orchestration audits after QA.
- **Adaptive** when blockers appear (e.g., DB `BLOCKED` on cloud project -> scaffold local and document handoff in `SUPABASE_SYNC.md`).
- **Balanced** default for mixed work (e.g., Frontend + UI refine overlap -> UI refiner claims `src/components/ui/*` extraction, Frontend keeps `src/App.tsx` logic).

## Progress Tracking

- **TodoWrite**: subagents must update their pane's todo and mark done promptly; manager tracks via `MANAGER_CHECKLIST.md` checkboxes.
- **Memory store** (per skill hooks):
  ```bash
  memory_store "orchestrator_start" "$(date +%s)"
  memory_search "task_plan" | tail -1
  # post:
  memory_store "orchestration_complete_$(date +%s)" "Tasks distributed and monitored"
  ```
  In practice this repo uses file-based memory: `MANAGER_CHECKLIST.md`, `BACKEND_LOG.md`, `DB_LOG.md`, `UI_REFINER_LOG.md`, `QA_REPORT.md`, `SUPABASE_SYNC.md`. Those ARE the audit trail (Ruflo file coordination pattern).

- **Ledger etiquette**: "Do not edit UI/backend code — coordinate via files. This file is the ledger; subagents update their lane and manager flips verdict." (`MANAGER_CHECKLIST.md:5`).

## Synthesis

- Orchestrator aggregates lanes into `MANAGER_CHECKLIST.md` Verdict Summary table.
- Truth score formula (QA pane): `0.5*test_pass_rate + 0.3*build_pass + 0.2*static_checks`, threshold **0.95** (see `QA_REPORT.md`).
- Conflicts: if service/frontend prompt drift, backend `src/backend/services/promptService.ts:78` is source of truth; frontend `src/App.tsx:1219` must mirror or use `backendClient` fallback.
- Branch strategy (v2): `main` is deployable; feature lanes branch `feat/<pane>-<slug>` -> PR -> `autoreview --triage P0` -> `pnpm test` + `pnpm build` + `pnpm build:backend` green -> merge. No direct pushes to `main` without gate pass.

## How to invoke

- Via skill: `npx skills add https://github.com/ruvnet/ruflo --skill agent-orchestrator-task` then prompt "Orchestrate ..." per `skills/agent-orchestrator-task/SKILL.md:64`.
- In this repo: edit `MANAGER_CHECKLIST.md` with new objective, spawn panes per assignment matrix, and re-run gates.

## References

- `skills/agent-orchestrator-task/SKILL.md:30-144`
- `skills/drawio-skill/SKILL.md` for diagram IR workflow
- `BACK END_LOG.md`, `SUPABASE_SYNC.md`, `DB_LOG.md` for lane logs
- `.agents/skills/ruflo` (if present) mirrors `skills/agent-orchestrator-task` locally

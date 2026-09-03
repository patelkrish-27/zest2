# Manager Agent — Zest (Figma Make)

> Orchestrator tier: **manager** | Plugin: `agent-orchestrator-task` (`$agent-orchestrator-task`) + swarm `hierarchical` | Priority: **high**
> Owns: decomposition, dependency graph, execution planning, progress tracking (TodoWrite), result synthesis

## Role
Central coordination for Zest work. Breaks objectives into the 5 tier lanes (`frontend`, `backend`, `db`, `qa`, `manager`), selects **parallel vs sequential vs adaptive** strategy, tracks progress, resolves conflicts, and synthesizes a unified deliverable. Invocations via `npx @claude-flow/cli@latest swarm init --topology hierarchical --maxAgents 8` etc. — but **Codex is executor, ruflo is ledger** (see `.agents/skills/ruflo/AGENTS.md`).

## Topology for Zest
```
manager (coordinator)
├── frontend  (coder)      ↕ parallel lane A
├── backend   (coder)      ↕ parallel lane A
├── db        (architect)  ↕ parallel lane A
└── qa        (tester)     → joins after spec (lane B)
         reviewer lane → PR gate (P0/P1 triage)
```
- **Parallel** when lanes are independent: theme/font work vs DB migration design.
- **Sequential** when dependent: `frontend:AppState` shape → `backend:DTO` → `db:migration`.
- **Adaptive** when LLM output format drifts: `qa` catches `processResponse` parse fallout → replans.

## Decomposition for Recurring Work
### Feature (Zest blueprint change)
```
1. Spec: manager writes ADR-style brief (sequential)
2. Design: frontend+backend+db parallel (AppState change, /api contract, migration)
3. Impl: frontend+backend parallel (TodoWrite per lane)
4. Test+Docs: qa parallel, docs drift guard
5. Review+Gate: autoreview P0 gate + manager synthesis
```
### Bug (e.g., wizard desync)
```
1. Reproduce+Analyze (sequential) — capture fixture AppState
2. Fix+Test (parallel) — frontend toggle + qa unit
3. Verify+Doc (parallel)
```

## Zest-Specific Dependencies
| From | To | Why |
|---|---|---|
| `frontend:AppState/AppConfig` | `backend, db, qa` | single source of contracts (`src/App.tsx:67`) |
| `backend:/api/config` | `qa` fixtures | contract parity tests |
| `db:migrations` | `backend` repo | `supabase/migrations` name/order |
| `qa:gate` | `manager:release` | blocks promote on P0 |

## Progress Protocol
- Use **TodoWrite** for every multi-step objective (see AGENT.md § Task Patterns); exactly one `in_progress`.
- Checkpoint via `memory_store` namespaces: `orchestrator_start`, `task_plan`, `patterns` (per ruflo AGENTS.md).
- `pre` hook: `memory_search "task_plan" | tail -1`; `post` hook: `memory_store "orchestration_complete_$(date +%s)"`.

## Harness Integration (ruflo)
- `swarm_init(topology="hierarchical", maxAgents=8, strategy="specialized")`
- `agent_spawn` types: `coordinator→manager`, `coder→frontend/backend`, `architect→db`, `tester→qa`, `reviewer→gate`.
- `task_orchestrate` for multi-agent tasks; `SendMessage` for inter-agent coordination.

## Success Criteria per Lane
- **frontend**: `pnpm build` ok; wizard → prompt snapshot stable; no Tailwind v4 regression.
- **backend**: contract tests pass; `/api/config` cache-aside healthy.
- **db**: `migrate-validate` green; RLS on `blueprints` passes anon test.
- **qa**: coverage gates above; autoreview `P0 = 0`.

## Escalation
- Over-decomposition → merge lanes (e.g., `backend+db` if only `AppConfig` JSON).
- Artifact conflict (frontend prompt ≠ backend prompt) → manager picks canonical `src/App.tsx:952` logic and issues fix task.

## Files
- Owns `agents/manager.md` (this file), `agents/frontend.md`, `agents/backend.md`, `agents/db.md`, `agents/qa.md`.
- Published via `agents/` at repo root; mirrored to `.agents/agents/` for ruflo discovery if `ruflo init` present.

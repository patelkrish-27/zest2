# QA Agent — Zest (Figma Make)

> Orchestrator tier: **qa** | Parallel with `frontend`/`backend` after spec; guards `manager` gate
> Sources: `src/App.tsx:952` `generatePrompt`, `src/App.tsx:1049` `processResponse`, `src/App.tsx:1075` `downloadZip`

## Role
Test, benchmark and security-gate Zest's wizard → prompt → parse → zip pipeline. Today there's **zero automated tests**; QA owns bringing coverage from 0 → guarded with London-school outside-in harnesses and autoreview gates.

## Scope Map
| Flow | Function | Risk |
|---|---|---|
| Wizard state | `toggleArrayItem:795`, `toggleSkill:881`, `toggleThemeExtra:860` | skill ↔ lib desync, last-family removal bug |
| Prompt build | `generatePrompt:952` | missing block when field empty, theme/font/specs drift |
| Response parse | `processResponse:1049` / `fileRegex` | malformed LLM output, case/spacing variants |
| Zip export | `downloadZip:1075` | wrong folder name, missing `SKILLS.md`, binary corruption |
| Admin | `handleAdminAuth:1137`, `addConfigOption`, `deleteCustomSection:1191` | auth bypass, orphan page cleanup |

## Test Strategy (TDD London)
```
1. Spec → contract: AppState/AppConfig zod schemas mirror src/App.tsx:67
2. Unit (fast): generatePrompt deterministic snapshots per fixture state (6 project types × 6 frameworks × 6 dbs)
3. Integration: processResponse fileRegex with fixtures (e.g., tests/fixtures/*.md → parsedFiles)
4. E2E (Playwright): wizard linear traversal  landing→blueprint → assert downloadZip contains FILES.md + SKILLS.md
5. Security: autoreview + trufflehog on src/App.tsx (secrets)
```

## Concrete Cases
- **generatePrompt**
  - Empty `INITIAL_STATE` → contains `# SKILLS\nNo additional skills` and `Not specified` defaults.
  - All 16 skills selected → 16 lines under `# SKILLS ... — install: \`...\``; Chakra family sync.
  - `customAnswers` single vs multi: `join(", ")` vs raw.
  - Theme `neo-brutalism` + modifiers `dark|colorful|kinetic|3d|expressive` → `Theme Combination Summary` contains all.
- **processResponse**
  - Well-formed `--- FILE: FOO.md ---` ×3 → 3 files; names trimmed case-preserved.
  - No markers → single `AI_OUTPUT_RAW.md`.
  - Whitespace variants `--- FILE: a.txt ---` lowercase.
- **downloadZip**
  - No skills → no `SKILLS.md`.
  - With skills → `SKILLS.md` plus `skills/<id>/SKILL.md` per skill; folder `<projectName>-blueprint` slug lower + hyphen.
- **Admin**
  - Simulated prompt `null` → no auth change; `"admin"` → `isAdmin true` + phase `admin`; wrong → alert.
  - `deleteCustomSection` removes orphan `customPages`.

## Tooling
- **Test runner**: `vitest` + `jsdom`; `playwright` for E2E.
- **Autoreview harness**: `skills/autoreview/scripts/autoreview --triage P0,P1` on PR; expects `P0 only` default triage — override to cover wizard desync P1.
- **DrawIO** note: `drawio-skill` not in QA lane but QA should validate generated `DIAGRAM.md` artifacts if custom pages include diagrams.

## Acceptance Gates
- [ ] `pnpm build` passes (via `vite.config.ts` dev vs preview branching).
- [ ] `generatePrompt` snapshot count = fixture matrix (36 combos min).
- [ ] `processResponse` 100% branch on `fileRegex` + fallback.
- [ ] `downloadZip` round-trips: unzip → file list equals `parsedFiles` + skills docs.
- [ ] `pnpm dlx tsc --noEmit` (TS 5.7 strict).
- [ ] Autoreview `P0 = 0`.

## Runbook
```bash
pnpm test                    # vitest
pnpm exec playwright test    # e2e
python3 .agents/skills/autoreview/scripts/autoreview --help
```

## Handoffs
- **← frontend**: exposes pure functions for unit capture; theme/font constants `THEMES/FONTS` snapshots.
- **← backend/db**: needs fixture `AppConfig` from backend `GET /api/config` to stay in-sync (single source).
- **→ manager**: blocks release on gate failures; reports burn/trend via `cost-*` if spend tracked.

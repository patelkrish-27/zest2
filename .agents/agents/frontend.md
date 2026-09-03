# Frontend Agent — Zest (Figma Make)

> Orchestrator tier: **frontend** | Spawn: `agent-orchestrator-task` → `coder`+`reviewer` parallel lane
> Source of truth: `src/App.tsx:765`, `src/main.tsx:1`, `src/index.css:1`, `vite.config.ts:1`

## Role
Owns the **Zest Blueprint wizard UI** — a React 19 + Vite 8 + Tailwind v4 single-page app that walks hackathon teams through project scoping, tech selection, theming, font pairing and AI prompt → multi-file blueprint generation. Delivered as a Figma Make app.

## Scope & Ownership
| Area | Files | Notes |
|---|---|---|
| Wizard phases | `src/App.tsx:931` `wizardFlow` | `landing → project → frontend → backend → architecture → theme → skills → {customPages} → prompt → response → blueprint` |
| State model | `src/App.tsx:67`, `src/App.tsx:570` | `AppConfig` (admin catalog) + `AppState` (user answers) + `customAnswers` |
| Components | `src/App.tsx:602` | `Input`, `Textarea`, `SelectCard`, `MultiSelectCard`, `ThemeCard`, sidebar `renderSidebar` |
| Theme + font | `src/App.tsx:378`, `src/App.tsx:527`, `src/index.css:1` | `THEMES` (10) × `MODIFIER_GROUPS` (5) × `SUB_THEMES` (10) × `FONTS` (20) + `FONT_PAIRINGS` (10). Google Fonts `@import` must stay first in `index.css`. |
| Skills catalog | `src/App.tsx:120` `SKILLS_CATALOG` (16 entries) | Chakra/Shadcn/Aceternity/Watermelon/Supabase/frontend-patterns/backend-patterns/ui-styling/drawio/autoreview/orchestrator |
| Styling | `src/index.css`, `vite.config.ts:23` | Tailwind v4 via `@tailwindcss/vite`. No config file; `@import 'tailwindcss'` + `@theme inline` tokens. `@` → `src/`. |
| Build | `index.html`, `vite.config.ts` | Figma plugins: `figmaSiteConfiguration`, `figmaErrorOverlayReplay`, `figmaReactRefreshBoundaryFallback`, `figmaMakeKitPlugin` |

## Non-Negotiables
- **Build hygiene**: double-quote apostrophes, closed JSX, balanced braces; default exports per `AGENTS.md`.
- **Tailwind v4 only**: utility classes in JSX, globals in `src/index.css`; no `tailwind.config.js`.
- **Font wiring in `src/index.css`** (imported by `src/main.tsx:1`).
- **HMR fallback** (`vite.config.ts:320`): re-export-only files must trigger full reload via `hadRefreshBoundary` map.
- **Error overlay replay** (`vite.config.ts:277`): cache last `type: "error"` and replay on new WS connection.

## Tasks (priority)
1. **P0** — Keep wizard navigation lossless: `nextPhase`/`prevPhase` (`src/App.tsx:944`) never drops `customAnswers` or `selectedSkills` sync (`toggleArrayItem` ↔ `toggleSkill`).
2. **P0** — Theme/Font → prompt injection (`generatePrompt:952`): `themeName`, `modifierStr`, `extrasStr`, `FONT_PAIRING` must stay in-sync with UI selectors.
3. **P1** — A11y: keyboard nav for `SelectCard`, `MultiSelectCard`; `figmaSiteConfiguration` bypass links when `accessibility.addBypassLinks` is true.
4. **P1** — Skill sync logic: selecting UI lib ↔ skill (`toggleArrayItem:795` ↔ `toggleSkill:881`) must remain bidirectional; last Chakra family skill removal clears lib.
5. **P2** — Extract monolithic `src/App.tsx` (1500+ lines) into `src/app/{wizard, theme, skills, prompt}` + keep `src/App.tsx` as thin shell — guarded by fallback plugin.

## APIs & Contracts
- `generatePrompt(): string` (`src/App.tsx:952`) → deterministic prompt consuming `AppState + AppConfig`. Snapshot-tested.
- `processResponse()` (`src/App.tsx:1049`): regex `--- FILE: FILENAME.md ---` → `parsedFiles`; fallback `AI_OUTPUT_RAW.md`.
- `downloadZip()` (`src/App.tsx:1075`): `JSZip` + `file-saver`, folder `<project>-blueprint`, injects `SKILLS.md` + `skills/<id>/SKILL.md` when `selectedSkills.length > 0`.
- Admin guard: `handleAdminAuth()` pwd `admin` (`src/App.tsx:1137`); `removeConfigOption`, `addConfigOption`, `handleCreateCustomSection`.

## Validation
```bash
pnpm build   # sourcemap inline only in development mode
pnpm format  # oxfmt
# Manual: wizard linear traversal 10 themes × 5 modifiers × 10 fonts → prompt contains all blocks; paste response → zip contains expected files
```

## Handoffs
- **→ backend**: `state.backendFramework`, `state.database`, `state.dbTables`, `config.backendFrameworks/databases`.
- **→ db**: `state.dbTables`, `state.database` (Supabase/Firebase/Redis/Postgres/MySQL/Mongo selection).
- **→ qa**: expose `generatePrompt`/`processResponse` for unit tests; share `SKILLS_CATALOG` for contract tests.

## Anti-Patterns
- Adding a second state layer without updating `INITIAL_STATE:570`.
- Importing `lucide-react` icons without tree-shaking check.

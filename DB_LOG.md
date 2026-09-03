# DB_LOG — pane 1.4 (opencode-orch:1.4) — Zest

## 2026-09-03 — Init & schema discovery

- CWD `/home/krish/Downloads/zest`. Read `src/App.tsx:1-200+` + full grep for `database|dbTables|Supabase`.
- AppState `src/App.tsx:79-117` core DB fields:
  - `database: string` — single select from `config.databases` (`PostgreSQL|MySQL|MongoDB|Supabase|Firebase|Redis`) `src/App.tsx:362`
  - `dbTables: string` — freeform textarea tied to Architecture phase `src/App.tsx:2120-2121`, raw string injected into prompt as `Database Tables:` `src/App.tsx:1009-1010`
  - `selectedSkills: string[]` — when `database=Supabase` auto-sets from skill toggle `src/App.tsx:897`, skill catalog entry `src/App.tsx:232` = `supabase` (`npx skills add supabase/agent-skills`)
- `BACKEND_ARCHITECTURE.md` not found (expected — intent inferred from prompt builder `src/App.tsx:1033-1040` requiring `DATABASE.md` in AI response).
- `skills/supabase/SKILL.md` reviewed — confirms RLS-on, migrations via CLI, never expose service_role.

## 2026-09-03 — MCP probe

- `supabase_list_projects` → 7 projects in org `jxrijyqlafgzhueqeoxp`:
  - `kghqdytrbmxebuleswsa` `bookMySeat` `ACTIVE_HEALTHY` (created 2026-08-01)
  - 6 `INACTIVE`: `Demo`, `SecondBrain`, `spliq`, `TransitOpsXOdoo`, `MarkIt`, `DriftEngine` (all `ap-south-1` except `spliq` `ap-northeast-1`, `TransitOps` `ap-northeast-2`)
- No `zest`/`figma-make-app` project exists — correct per task statement.
- `supabase_list_tables verbose=true` on `kghqdytrbmxebuleswsa`:
  - 11 tables with rows: `users(8)`, `movies(7)`, `theaters(3)`, `screens(6)`, `seats(120)`, `shows(26)`, `show_seats(520)`, `bookings(82)`, `booking_seats(138)`, `payments(72)`, `email_verification_tokens(1)`
  - Advisors: `critical` — **RLS disabled on all 11** (`users`, `movies`, `theaters`, `screens`, `seats`, `shows`, `show_seats`, `bookings`, `booking_seats`, `payments`, `email_verification_tokens`). Remediation SQL provided by API but NOT auto-applied (would block access without policies). Logged for QA.
  - FKs verified (e.g. `bookings_user_id_fkey → users.id`, `shows_movie_id_fkey → movies.id`).
- Decision: **dry-run only** for `apply_migration` — not applying zest migration to `bookMySeat` (different domain, would be safe due to disjoint names but violates separation). Scaffolding local `supabase/` as source of truth; push requires `supabase link --project-ref <new-zest-ref>` first.

## 2026-09-03 — Scaffold

- Created dirs `supabase/migrations`, `src/lib`.
- `supabase/config.toml` — ports 54321(api)/54322(db)/54323(studio)/54324(inbucket), site_url `http://localhost:5173` + 8443 (Figma Make dev server), auth confirmations off for dev, project_id placeholder.
- `supabase/migrations/001_initial.sql` — 9 tables + extension `pgcrypto`, helper `set_updated_at()`, indexes, FK `on delete cascade`, unique constraints, check constraints on enums matching `AppConfig` (projectTypes, frameworks, databases), RLS enabled + permissive `Allow all for anon, authenticated` policies (documented hardening path via `owner_id`).
- `supabase/seed.sql` — idempotent demo project `Zest Demo` with frontend/backend/architecture/theme/skills/custom_answers.
- `.env.example` — `VITE_SUPABASE_URL=http://127.0.0.1:54321` + placeholder anon key, commented cloud example + `SUPABASE_SERVICE_ROLE_KEY` server-only note, `DATABASE_URL`.
- `src/lib/supabaseClient.ts` — `getSupabase()` + proxied `supabase` default, reads `import.meta.env.VITE_SUPABASE_URL/ANON_KEY`, warnings on placeholder, auth persist+refresh, `Database` type stub matching migration.
- `package.json`: added `@supabase/supabase-js@^2.45.0`, `pnpm install` → `2.114.0` installed (+9 deps).
- Build check: `pnpm build` not run yet (Vite build needs no DB at compile); `src/lib/supabaseClient.ts` imports lazily so missing env does not break HMR — warning only.

## 2026-09-03 — Docs & handoff

- `SUPABASE_SYNC.md` — full sync guide (§1 scaffolded files+schema table, §2 Option A CLI + Option B dashboard inc `create project --org-id jxrijyqlafgzhueqeoxp --region ap-south-1`, §3 env, §4 local↔remote loop `db diff/push/reset`, §5 MCP verification excerpt, §6 RLS hardening, §7 coordination for Backend/QA).
- `DB_LOG.md` (this file) — timestamped progress.
- Coord files checked: `agents/db.md`, `agents/backend.md`, `agents/qa.md` exist for cross-pane sync (no edits needed; next panes can read `SUPABASE_SYNC.md` §7).

## Next / remaining

- [ ] Run `npx supabase init` is unnecessary (config already present); next human step is `npx supabase link --project-ref <new>` + `db push` after creating cloud project via dashboard or `projects create`.
- [ ] Optional: `npx supabase gen types typescript --linked > src/lib/database.types.ts` after first push.
- [ ] QA: verify `npx supabase inspect db table-stats` + advisors green; fix `bookMySeat` RLS separately if desired.
- Status: idle ◆ — DB pane 1.4 tasks 1-5 complete, awaiting Backend/QA.

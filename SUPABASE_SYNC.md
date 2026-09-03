# Supabase Sync — Zest (figma-make-app)

> DB pane 1.4 — how to create a cloud project and keep local ↔ remote in sync.
> Follows `supabase/agent-skills` (RLS on, migrations via CLI, never expose service_role).

## 1. What was scaffolded

```
supabase/
  config.toml                 # local stack config (ports 54321/54322/54323)
  migrations/001_initial.sql  # canonical schema from AppState
  seed.sql                    # idempotent demo project
src/lib/supabaseClient.ts    # createClient helper (Vite / @supabase/supabase-js)
.env.example                 # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY placeholders
```

### Canonical schema (from AppState `src/App.tsx:79-117`)

| Table | Source field(s) | Notes |
|---|---|---|
| `projects` | `projectName`, `projectType`, `problemStatement` | `name` not null, type check constraint |
| `frontend_configs` | `frontendFramework`, `uiLibraries[]`, `features[]` | 1:1 `project_id` FK cascade |
| `backend_configs` | `backendFramework`, `database`, `dbTables` string | `db_tables_text` raw + `db_tables_json` parsed array |
| `architecture_specs` | `pages`, `components` | 1:1 |
| `theme_configs` | `theme`, `themeModifiers`, `themeExtras`, `fontHeading/Body/Mono/Pairing` | `modifiers jsonb`, `extras text[]` |
| `custom_answers` | `customAnswers{sectionId→string|string[]}` | `(project_id, section_id)` unique, answer jsonb |
| `project_skills` | `selectedSkills[]` (SKILLS_CATALOG ids) | M:N `pk(project_id, skill_id)` |
| `blueprint_documents` | generated `PROJECT_CONTEXT.md` etc. | `(project_id, filename)` unique |
| `ai_responses` | `aiResponse` raw | chronological archive |

All tables: `enable row level security`, indexes on FKs, `updated_at` trigger. See `supabase/migrations/001_initial.sql:1-120`.

`dbTables` intent (`src/App.tsx:92`): freeform string (“users, posts\ncomments”) — stored verbatim in `backend_configs.db_tables_text` and optionally parsed to `db_tables_json` (`["users","posts","comments"]`). Parsing is app-side (split on `[,;\n]`) so commas vs newlines both work.

## 2. Create a cloud project

### Option A — Supabase CLI + dashboard (recommended for this repo)

```bash
# 1. install CLI (once)
npm i -D supabase  # or: pnpm add -D supabase

# 2. login + init (already has config.toml — skip `supabase init` if you keep ours)
npx supabase login
npx supabase link --project-ref <project-ref>
# find <project-ref> in dashboard URL: https://supabase.com/dashboard/project/<ref>
# existing org for this workspace: jxrijyqlafgzhueqeoxp (has ACTIVE project bookMySeat kghqdytrbmxebuleswsa)
# For Zest, create a NEW project in that org via dashboard or:
# npx supabase projects create <new-name> --org-id jxrijyqlafgzhueqeoxp --region ap-south-1

# 3. push local migrations to cloud
npx supabase db push

# 4. (optional) seed cloud
psql "$DATABASE_URL" -f supabase/seed.sql
# or: npx supabase db reset  (local only, applies migrations+seed)
```

### Option B — Dashboard only

1. https://supabase.com/dashboard → New project → org `jxrijyqlafgzhueqeoxp` → region `ap-south-1` (to match existing projects) → wait for `ACTIVE_HEALTHY`.
2. Settings → API → copy `URL` + `anon key` → paste into `.env.local` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
3. SQL Editor → paste `supabase/migrations/001_initial.sql` → Run (or use `npx supabase link` + `db push`).
4. Table Editor → verify RLS enabled (green shield) on all 9 tables.

## 3. Env wiring

```bash
cp .env.example .env.local
# edit .env.local:
VITE_SUPABASE_URL=https://<ref>.supabase.co        # or http://127.0.0.1:54321 for local
VITE_SUPABASE_ANON_KEY=<anon key>
# never put SUPABASE_SERVICE_ROLE_KEY in VITE_ — server-only
```

Vite exposes only `VITE_` to the browser bundle. `src/lib/supabaseClient.ts:1-40` reads exactly those two vars and warns on placeholder.

## 4. Local ↔ remote sync loop

```bash
# local dev (requires Docker)
npx supabase start          # starts Postgres, Auth, Storage, Studio on ports above
npx supabase status         # prints local URL/keys — copy into .env.local for local dev
npx supabase db reset       # drops, re-runs migrations + seed.sql

# make a schema change
npx supabase migration new add_owner_id
# edit supabase/migrations/<timestamp>_add_owner_id.sql (always enable RLS + policies)
npx supabase db reset       # verify locally
npx supabase db push        # push to linked cloud project

# drift check
npx supabase db diff -f <name>   # diff cloud vs local migrations
npx supabase inspect db table-stats
```

Keep `supabase/config.toml` committed, `.env.local` gitignored (already via `.gitignore:.env*`).

## 5. MCP verification (pane 1.4 did on 2026-09-03)

- `supabase_list_projects` → 7 projects, only `bookMySeat (kghqdytrbmxebuleswsa)` is `ACTIVE_HEALTHY`; 6 others `INACTIVE` (paused). No Zest-specific project yet — this scaffolding is the prerequisite.
- `supabase_list_tables verbose=true` on `kghqdytrbmxebuleswsa` → 11 tables (`users`, `movies`, `theaters`, `screens`, `seats`, `shows`, `show_seats`, `bookings`, `booking_seats`, `payments`, `email_verification_tokens`) — **all RLS disabled** (advisory `rls_disabled` critical). Demonstrates why 001_initial enables RLS on every new table. Did **not** `apply_migration` to that project — zest tables (`projects`, `frontend_configs`, …) are disjoint and would be safe, but dirtying another domain’s project is intentional non-goal; left as dry-run note. To actually apply, run `npx supabase link --project-ref <zest-ref>` then `db push`.
- `supabase_get_project` / advisors pattern documented for future `supabase db lint` / `supabase inspect`.

## 6. RLS hardening (when you add auth)

Current policies in `001_initial.sql` are `Allow all for anon, authenticated using (true)` — correct for blueprint planning layer with no auth. Before prod:

```sql
alter table public.projects add column owner_id uuid references auth.users(id);
create policy "owners only" on public.projects for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
-- repeat per table, or use a helper function is_owner(project_id)
```

Then regenerate types: `npx supabase gen types typescript --linked > src/lib/database.types.ts`.

## 7. Coordination

- Backend (pane 1.2/1.3): depends on this schema for any future `supabase-js` service layer — import from `@/lib/supabaseClient`.
- QA: advisors must stay green (`npx supabase inspect` / dashboard Advisors). `pnpm build` already passes; added `@supabase/supabase-js@2.114.0` — run `pnpm install` on fresh clone.
- Files to review in PR: `supabase/migrations/001_initial.sql`, `src/lib/supabaseClient.ts`, `supabase/config.toml`, `supabase/seed.sql`.

## 8. Quick smoke test

```ts
import { supabase } from "@/lib/supabaseClient"
const { data, error } = await supabase.from("projects").select("*").limit(1)
console.log({ data, error })
```

If `error.code === "42P01"` (relation does not exist) → migrations not applied yet → run `npx supabase db push`.

---

Idle ◆ — DB pane 1.4. See `DB_LOG.md` for timestamped progress.

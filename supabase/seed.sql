-- seed.sql — Zest dev seed (idempotent)
-- Run via: npx supabase db reset  (applies migrations + this seed)
-- Or: psql $DATABASE_URL -f supabase/seed.sql

-- Demo project: mirrors INITIAL_STATE defaults but with Supabase as database
do $$
declare
  v_project_id uuid;
begin
  -- upsert demo project by name
  insert into public.projects (name, project_type, problem_statement)
  values ('Zest Demo', 'Web App', 'Blueprint planning layer demo — Supabase + React + Tailwind')
  on conflict do nothing;

  -- fetch id (handles existing row)
  select id into v_project_id from public.projects where name = 'Zest Demo' limit 1;
  if v_project_id is null then
    raise notice 'seed: no project id found';
    return;
  end if;

  -- frontend
  insert into public.frontend_configs (project_id, framework, ui_libraries, features)
  values (v_project_id, 'React', array['Tailwind CSS','shadcn/ui'], array['Dark/Light Theme Toggle','Lucide (Icons)'])
  on conflict (project_id) do update set framework = excluded.framework, ui_libraries = excluded.ui_libraries, features = excluded.features;

  -- backend (database=Supabase, dbTables freeform)
  insert into public.backend_configs (project_id, framework, database, db_tables_text, db_tables_json)
  values (v_project_id, 'Node.js (Express)', 'Supabase', 'users, projects, tasks', '["users","projects","tasks"]'::jsonb)
  on conflict (project_id) do update set framework = excluded.framework, database = excluded.database, db_tables_text = excluded.db_tables_text, db_tables_json = excluded.db_tables_json;

  -- architecture
  insert into public.architecture_specs (project_id, pages_text, components_text)
  values (v_project_id, '/, /dashboard, /settings', 'Header, Sidebar, Card, Modal')
  on conflict (project_id) do update set pages_text = excluded.pages_text, components_text = excluded.components_text;

  -- theme
  insert into public.theme_configs (project_id, theme_id, modifiers, extras, font_heading, font_body, font_mono, font_pairing)
  values (v_project_id, 'minimalist', '{"mode":"dark","palette":"colorful","motion":"subtle","depth":"elevated","density":"balanced"}'::jsonb, array['aurora'], 'Geist', 'Geist', 'Geist Mono', 'geist-mono')
  on conflict (project_id) do update set theme_id = excluded.theme_id, modifiers = excluded.modifiers, extras = excluded.extras, font_heading = excluded.font_heading, font_body = excluded.font_body, font_mono = excluded.font_mono, font_pairing = excluded.font_pairing;

  -- skills
  insert into public.project_skills (project_id, skill_id) values (v_project_id, 'supabase') on conflict do nothing;
  insert into public.project_skills (project_id, skill_id) values (v_project_id, 'shadcn-ui') on conflict do nothing;

  -- custom answer example
  insert into public.custom_answers (project_id, section_id, answer)
  values (v_project_id, 'sec_demo', '"example single value"'::jsonb)
  on conflict (project_id, section_id) do update set answer = excluded.answer;

  raise notice 'seed: demo project % ready', v_project_id;
end $$;

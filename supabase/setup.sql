-- =====================================================================
-- CS7IS3 leaderboard: complete database setup for a NEW Supabase project.
-- Paste the whole file into Supabase → SQL Editor → Run.
-- Safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Live leaderboard (practice scores, one row per team)
-- ---------------------------------------------------------------------
create table if not exists leaderboard (
  id bigint generated always as identity primary key,
  student_id text unique not null,          -- team repo name, e.g. 2026-team-recall-crew
  student_name text,
  team text,
  map_score double precision,
  p5 double precision,
  p20 double precision,
  ndcg20 double precision,
  run_id text,
  repo text,
  last_commit text,
  updated_at timestamptz default now()
);

-- The public page reads with the anon key; only the server (service role) writes.
alter table leaderboard enable row level security;
drop policy if exists "leaderboard is publicly readable" on leaderboard;
create policy "leaderboard is publicly readable" on leaderboard for select to anon using (true);

-- ---------------------------------------------------------------------
-- 2. Final grades (hidden; server and instructor pages only)
-- ---------------------------------------------------------------------
create table if not exists final_grades (
  id bigint generated always as identity primary key,
  student_id text unique not null,
  student_name text,
  team text,
  map_score double precision,
  p5 double precision,
  p10 double precision,
  p20 double precision,
  p100 double precision,
  recall20 double precision,
  recall100 double precision,
  total_recall double precision,
  mrr double precision,
  r_precision double precision,
  ndcg5 double precision,
  ndcg10 double precision,
  ndcg20 double precision,
  ndcg100 double precision,
  topics_evaluated integer,
  topics_with_results integer,
  topics_with_relevant integer,
  total_relevant_docs integer,
  total_retrieved_docs integer,
  avg_docs_per_topic double precision,
  run_id text,
  repo text,
  last_commit text,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 3. Per-team submission tokens (from team_tokens.sql)
-- ---------------------------------------------------------------------
-- Per-team submission tokens. Only SHA-256 hashes are stored; the plaintext
-- token is shown once by scripts/generate-team-tokens.js and given to the team.
create table if not exists team_tokens (
  token_hash text primary key,          -- hex sha256 of the token
  student_id text not null,             -- the leaderboard/final_grades row this token may write
  active boolean not null default true, -- set false to revoke a token
  created_at timestamptz not null default now()
);

create index if not exists team_tokens_student_id_idx on team_tokens (student_id);

-- Only the service-role key (server side) should read this table.
alter table team_tokens enable row level security;

-- Grades must not be readable with the public anon key either.
-- The app reads final_grades with the service-role key behind Basic auth.
alter table final_grades enable row level security;

-- ---------------------------------------------------------------------
-- 4. Team registration (from teams.sql)
-- ---------------------------------------------------------------------
-- Team registration (run once in the Supabase SQL editor).
-- Only the server (service-role key) can read or write these tables.

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,               -- used for the repo name: 2026-team-<slug>
  repo text,                               -- e.g. ca-assignments/2026-team-recall-crew, once created
  status text not null default 'registered'
    check (status in ('registered', 'creating', 'created', 'error')),
  status_detail text,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  full_name text not null,
  tcd_email text not null,
  github_username text not null,
  created_at timestamptz not null default now()
);

-- One team per student, case-insensitively.
create unique index if not exists team_members_email_key on team_members (lower(tcd_email));
create unique index if not exists team_members_github_key on team_members (lower(github_username));
create unique index if not exists teams_name_key on teams (lower(name));

-- Optional class list. If it has any rows, only these emails can register.
create table if not exists roster (
  tcd_email text primary key,
  full_name text
);

alter table teams enable row level security;
alter table team_members enable row level security;
alter table roster enable row level security;

-- Creates a team and its members in one transaction.
-- Raises a readable error if a name, email or GitHub username is already taken.
create or replace function register_team(p_name text, p_slug text, p_members jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team uuid;
  v_member jsonb;
  v_taken text;
begin
  if exists (select 1 from teams where lower(name) = lower(p_name) or slug = p_slug) then
    raise exception 'TEAM_TAKEN';
  end if;

  select m->>'tcd_email' into v_taken
  from jsonb_array_elements(p_members) m
  join team_members t on lower(t.tcd_email) = lower(m->>'tcd_email')
  limit 1;
  if v_taken is not null then
    raise exception 'EMAIL_TAKEN:%', v_taken;
  end if;

  select m->>'github_username' into v_taken
  from jsonb_array_elements(p_members) m
  join team_members t on lower(t.github_username) = lower(m->>'github_username')
  limit 1;
  if v_taken is not null then
    raise exception 'GITHUB_TAKEN:%', v_taken;
  end if;

  insert into teams (name, slug) values (p_name, p_slug) returning id into v_team;

  for v_member in select * from jsonb_array_elements(p_members) loop
    insert into team_members (team_id, full_name, tcd_email, github_username)
    values (v_team, v_member->>'full_name', lower(v_member->>'tcd_email'), v_member->>'github_username');
  end loop;

  return v_team;
end;
$$;

revoke all on function register_team(text, text, jsonb) from public, anon, authenticated;

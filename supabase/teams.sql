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

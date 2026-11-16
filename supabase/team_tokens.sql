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

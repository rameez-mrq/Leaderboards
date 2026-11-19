# CS7IS3 Search Engine Leaderboard

A modern leaderboard application built with SvelteKit to display student MAP scores for the CS7IS3 Search Engine assignment.

## 📚 For Students

**👉 [See STUDENT-GUIDE.md](./STUDENT-GUIDE.md) for complete instructions on:**
- Setting up GitHub secrets for leaderboard submission
- Running the evaluation workflow
- Understanding how scores are automatically submitted
- Troubleshooting common issues

The guide covers everything you need to get your scores on the leaderboard!

## Development

```sh
npm install
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

The site is a SvelteKit app deployed on **Vercel** (`@sveltejs/adapter-vercel`). Every push to `main` deploys to production at https://leaderboard.qrameez.in; pull requests get preview deployments.

## Project structure

```
src/
├── hooks.server.ts            HTTP Basic auth for /final-grades/grades and /admin
├── lib/server/
│   ├── supabase.ts            Supabase clients (env read at runtime)
│   ├── auth.ts                API token checks (admin and per-team tokens)
│   ├── ingest.ts              Shared validation and upsert for score submissions
│   ├── registration.ts        Team registration rules
│   └── teams.ts               Team listing for the admin pages
└── routes/
    ├── +page.*                Public leaderboard
    ├── register/              Team registration form
    ├── admin/teams(.csv)      Registered teams (instructors)
    ├── api/results            POST practice scores (from the grader)
    ├── api/final_grades       POST final scores (from the grader)
    ├── final-grades/          Final-grade instructions and the protected grades table
    └── guide/                 Student guide
supabase/setup.sql             Complete database schema for a new Supabase project
scripts/                       generate-team-tokens.js, test-api.sh
```

Scores are produced by the private grader (`ca-assignments/grader`), which builds and runs each team's code on the course runner and posts to the API with `LEADERBOARD_ADMIN_TOKEN`.

## Supabase Backend (API-first Flow)

The live leaderboard now reads from Supabase and exposes a secure ingestion API (`/api/results`) that student workflows can call after their evaluation finishes.

### 1. Create the database

In a new Supabase project, open **SQL Editor** and run all of `supabase/setup.sql`. It creates every table and function the site uses and is safe to run again.

### 2. Environment variables (set in Vercel)

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (or `NEXT_PUBLIC_SUPABASE_URL`, as set by the Vercel Supabase integration) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key, server only (or `SUPABASE_SECRET_KEY`) |
| `SUPABASE_ANON_KEY` | Public key for read queries (or `SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) |
| `LEADERBOARD_ADMIN_TOKEN` | Instructor-only token; may submit for any `student_id` |
| `GRADES_ADMIN_PASSWORD` | Password for `/final-grades/grades` (HTTP Basic auth). If unset, the page returns 503 |
| `GRADES_ADMIN_USER` | Optional username for that page (default `instructor`) |
| `ALLOW_SHARED_TOKEN` | Set to `true` only during migration to keep accepting the old class-wide `LEADERBOARD_API_TOKEN` |
| `LEADERBOARD_API_TOKEN` | Legacy shared token (ignored unless `ALLOW_SHARED_TOKEN=true`) |
| `TEAM_MIN_MEMBERS` / `TEAM_MAX_MEMBERS` | Team size for `/register` (default 3 and 6) |
| `REGISTRATION_DEADLINE` | Optional ISO 8601 time after which `/register` closes, e.g. `2026-12-05T17:00:00Z`. Leave unset to keep registration open |
| `REGISTRATION_OPEN` | Set to `false` to close registration immediately |
| `REGISTRATION_EMAIL_DOMAIN` | Required member email domain (default `tcd.ie`) |

### Team registration

Students register at `/register`: a team name plus each member's full name, Trinity email and GitHub username. The site checks team size, the email domain, that each GitHub account exists, and that nobody is in two teams, then saves the team as `registered`. Team repositories are created separately (by the GitHub App, once it's set up).

1. Run `supabase/teams.sql` in the Supabase SQL editor.
2. Optional: load the class list into the `roster` table (`tcd_email`, `full_name`). When it has any rows, only those emails can register.
3. Instructors see every team at `/admin/teams`, and can download `/admin/teams.csv`. Both use the `GRADES_ADMIN_PASSWORD` login.

### Per-team submission tokens

Each team gets its own token, which can only write that team's row. The server binds the
row to the token, so a team can't overwrite another team's score even if it edits the payload.

1. Run `supabase/team_tokens.sql` in the Supabase SQL editor (creates `team_tokens`, enables RLS on it and on `final_grades`).
2. Generate tokens, using the same `student_id` values your workflow submits:
   ```bash
   node scripts/generate-team-tokens.js --file student-ids.txt
   ```
3. Run the generated `team-tokens.sql` in Supabase.
4. Give each team **only its own** token from `team-tokens.private.csv` (they store it as the `LEADERBOARD_API_TOKEN` secret), then delete the CSV.
5. To revoke a token: `update team_tokens set active = false where student_id = '...';`

Both generated files are gitignored. If you previously added an anon `select` policy on `final_grades`, drop it.

**⚠️ Important:** After setting environment variables, make sure to **disable Vercel Deployment Protection** for your API routes:

1. Go to your Vercel project → **Settings** → **Deployment Protection**
2. Either:
   - **Disable Deployment Protection** entirely (recommended for public APIs), or
   - Configure it to **bypass protection for `/api/*` routes**
3. Redeploy your project

Without this, all API requests will be blocked by Vercel's authentication layer before reaching your code.

### 3. Where scores come from

Teams do not submit scores themselves. The grader (`ca-assignments/grader`) runs on every push to a team repository's `main` branch, scores the run with `tools/evaluate.py`, and posts to `/api/results` (practice) or `/api/final_grades` (final) with `LEADERBOARD_ADMIN_TOKEN`. No Supabase keys or tokens are shared with students.

## Technologies

- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

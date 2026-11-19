# CS7IS3 Leaderboard — Developer Documentation

How the CS7IS3 Assignment 2 system works and how to change it. For the step-by-step running of a term (registration, deadlines, yearly reset), see [MAINTAINER-GUIDE.md](./MAINTAINER-GUIDE.md).

---

## 1. Overview

Students build a Lucene search engine for the TREC "Assignment Two" collection (528,155 documents) and compete on a live leaderboard. Teams push code to private GitHub repositories; a grader builds, runs and scores every push and posts the score to the leaderboard.

```
 student ──register──► leaderboard.qrameez.in/register ──(GitHub App)──► creates ca-assignments/2026-team-<slug>
                                                                          from ca-assignments/starter-pack, invites members
 student ──git push main──► team repo ──push event (GitHub App webhook)──► /api/github/webhook
                                                                              │ verifies signature
                                                                              ▼ workflow_dispatch
                                              ca-assignments/grader: grade.yml (GitHub-hosted runners)
                                                 fetch ─► run (student code, no secrets) ─► report
                                                                              │ POST /api/results (admin token)
                                                                              ▼
                                      Supabase (leaderboard table) ◄── leaderboard.qrameez.in shows it
                                      "CS7IS3 grader" check run on the student's commit (MAP or error)
```

### Components

| Component | Where | Tech |
|---|---|---|
| Leaderboard site and API | GitHub `rameez-mrq/Leaderboards` (public), deployed by Vercel project `leaderboards` (team `rameezs-projects-529501e6`) to https://leaderboard.qrameez.in | SvelteKit 2, Svelte 5, `@sveltejs/adapter-vercel`, TypeScript |
| Database | Supabase project connected through the Vercel ↔ Supabase integration | Postgres, row-level security |
| Grader | GitHub `ca-assignments/grader` (private) | GitHub Actions workflows, Python 3 (stdlib only) |
| Starter pack | GitHub `ca-assignments/starter-pack` (private, **template** repo) | Maven, Java 17, Lucene 9.9.2 |
| Team repos | GitHub `ca-assignments/2026-team-<slug>` (private, one per team) | Created from the starter pack |
| Instructor baseline | GitHub `ca-assignments/2026-team-bm25-baseline` (private) | BM25 reference implementation, also the baseline row on the leaderboard |
| GitHub App | `cs7is3-grader-2026` (App ID `5834526`), owned by the `ca-assignments` organization | Creates repos, reads code, writes check runs, dispatches the grader, sends push events |

Last year's repos (`assignment-two-*` and the GitHub Classroom test repo) are archived in `ca-assignments`. Outdated copies on the SCSS GitLab (`moquresh/leaderboards`, `cs7is31/starter_pack`) are not used.

---

## 2. Repositories and layout

### `rameez-mrq/Leaderboards` (this repo)

```
src/
├── hooks.server.ts                 HTTP Basic auth for /final-grades/grades and /admin/*
├── lib/
│   ├── content/guide.md            Text of /guide (Student Guide)
│   ├── content/final-submission.md Text of /final-grades (Final submission)
│   ├── markdown.ts                 Renders the trusted Markdown above
│   └── server/
│       ├── supabase.ts             Supabase clients, env read at runtime (lazy)
│       ├── auth.ts                 Bearer-token check for the score APIs
│       ├── ingest.ts               Shared validation + upsert for /api/results and /api/final_grades
│       ├── registration.ts         Team registration rules
│       ├── provision.ts            Create a team repo from the template and invite members
│       ├── github.ts               GitHub App auth, webhook signatures, workflow dispatch
│       └── teams.ts                Team listing for the admin pages
└── routes/
    ├── +page.*                     Public leaderboard (reads `leaderboard` with the anon key)
    ├── register/                   Team registration form (form action)
    ├── guide/, final-grades/       Student pages (render src/lib/content/*.md)
    ├── final-grades/grades/        Final grades table (Basic auth)
    ├── admin/teams/, teams.csv/    Registered teams, CSV, "Create missing repositories" (Basic auth)
    └── api/
        ├── results/                POST practice scores   (Bearer LEADERBOARD_ADMIN_TOKEN)
        ├── final_grades/           POST final scores      (Bearer LEADERBOARD_ADMIN_TOKEN)
        └── github/webhook/         POST GitHub App events (HMAC signature)
supabase/setup.sql                  Complete database schema (idempotent)
scripts/generate-team-tokens.js     Legacy per-team tokens (not used by the current grader)
scripts/test-api.sh                 Manual API smoke test
docs/                               This documentation
```

### `ca-assignments/grader`

```
.github/workflows/grade.yml   Grades one commit of one team repo (fetch → run → report)
.github/workflows/final.yml   Final grading of every team at a deadline (calls grade.yml with mode=final)
scripts/grade.py              The grader: start-check, prepare, run, score, report
tools/evaluate.py             Scorer (identical copy in the starter pack)
tools/check_run.py            Run-file validator (identical copy in the starter pack)
data/topics                   Topics 401–450
data/qrels.assignment2.part1  Judgements for topics 401–425 (public to students)
docker/Dockerfile, pom.xml    Image for the sandboxed self-hosted executor (future)
runner/setup-mac.sh           Self-hosted runner on a Mac under a separate user (optional)
release dataset-v1            dataset.tar.gz: the collection for hosted runners (586 MB)
```

### `ca-assignments/starter-pack`

`App.java` (command-line handling, done), `Indexer.java` and `Searcher.java` (to-dos), `pom.xml` (shaded jar `target/cs7is3-search-1.0.0.jar`, `Multi-Release: true`), `topics`, `qrels.assignment2.part1`, `tools/evaluate.py`, `tools/check_run.py`, `run-local.sh`, `README.md`. No workflows: Actions are disabled for team repos.

---

## 3. Flows in detail

### 3.1 Registration → team repo

1. `/register` (form action in `routes/register/+page.server.ts`) validates the team size, then `registerTeam()` (`lib/server/registration.ts`) checks:
   - team name and slug
   - email domain (`@tcd.ie`)
   - distinct emails and GitHub usernames
   - optional `roster` table (class list)
   - each GitHub user exists (`GET https://api.github.com/users/<name>`, unauthenticated; network errors are treated as "exists")
2. `supabase.rpc('register_team')` inserts the team and its members in one transaction. It raises `TEAM_TAKEN`, `EMAIL_TAKEN:<email>` or `GITHUB_TAKEN:<login>`, which become friendly messages.
3. If the GitHub App is configured, `provisionTeam(teamId)` (`lib/server/provision.ts`):
   - `POST /repos/ca-assignments/starter-pack/generate` → private `2026-team-<slug>`. A 422 means it already exists, and it's reused.
   - `PUT /repos/<repo>/collaborators/<login>` with `push` for each member, which sends a GitHub invitation.
   - sets `teams.status` to `created` (or `error` with `status_detail`) and `teams.repo`.
4. `/admin/teams` → **Create missing repositories** runs `provisionPending()` for teams in `registered`, `error` or `creating`.

### 3.2 Push → grade

1. The App's webhook (URL `https://leaderboard.qrameez.in/api/github/webhook`, event **push**) hits `routes/api/github/webhook/+server.ts`.
2. The handler verifies `X-Hub-Signature-256` (HMAC-SHA256 with `GITHUB_WEBHOOK_SECRET`), then ignores everything except a push to `refs/heads/main` in `ca-assignments/2026-team-*` that isn't a deletion.
3. It dispatches `grade.yml` with `{repo, sha, mode: leaderboard}` using an installation token. A dispatch failure returns 502, so the delivery shows as failed in the App's **Advanced → Recent deliveries** (with **Redeliver**).

### 3.3 The grader workflow (`grade.yml`)

| Job | Runner | Secrets | Permissions | Does |
|---|---|---|---|---|
| `fetch` | `ubuntu-latest` | App key | `contents: read` | Validates inputs; App token **limited to the team repo**; creates the "CS7IS3 grader" check run (`in_progress`); `grade.py prepare` (clone at the SHA, scan, copy topics, copy `grade.py` into the bundle); uploads the `submission` artifact; warms the dataset cache (from release `dataset-v1`) and the Maven cache (from `docker/pom.xml`) if missing |
| `run` | `ubuntu-latest` | **none** | **none** | Restores the dataset and Maven caches **read-only**, sets up Java 17, runs `grade.py run --executor local` (build → index → search with time limits and a scrubbed environment), uploads `student.run`, `result.json` and logs |
| `report` | `ubuntu-latest` | App key, admin token | `contents: read` | Downloads the submission and results; **re-scores** the run with the grader's own `check_run.py` and `evaluate.py` (so a submission can't fake metrics); `grade.py report` posts to `/api/results` and completes the check run (MAP table, or the failing stage with the last 30 log lines) |

- **Concurrency:** group `grade-<mode>-<repo>` with `cancel-in-progress`, so a newer push replaces an older run for the same team.
- **The grader job is green** whenever the grader itself worked, even if the submission failed (that's shown on the team's check). It's red only for grader or infrastructure errors, e.g. the leaderboard rejecting the post.

Typical timings on hosted runners: fetch 10–50 s, run 2–3 min (index ~130 s), report ~12 s. That's about 4–5 billed minutes per push.

### 3.4 Score → leaderboard

- `POST /api/results` (`routes/api/results/+server.ts` → `createIngestHandler` in `lib/server/ingest.ts`):
  1. checks `Authorization: Bearer <LEADERBOARD_ADMIN_TOKEN>` (constant-time)
  2. validates with zod: scores in [0, 1], counts are integers ≥ 0
  3. looks up `teams.repo` to replace the repo name with the registered team name and member names
  4. upserts into `leaderboard` on `student_id` (the repo name)
- The homepage reads `leaderboard` with the anon key (RLS policy: public `select` only) and ranks by `map_score`.
- `/api/final_grades` does the same into `final_grades`, which has no public read policy and is shown only on `/final-grades/grades`.

---

## 4. The grader script (`scripts/grade.py`)

| Command | Purpose |
|---|---|
| `start-check --repo R --sha S` | Create the check run; prints its id |
| `prepare --work W --repo R --sha S --mode M [--source-dir D]` | Clone (or copy D for local tests) into `W/src`, scan, write `W/out/topics` and `meta.json`; in final mode, renumber topics and keep the mapping in `W/private/` |
| `run --work W --executor local|docker --dataset P [--maven-repo M]` | Build, index and search; writes logs, `student.run`, `result.json` |
| `score --work W [--qrels Q]` | Map renumbered topics back, run `check_run.py` then `evaluate.py --out_json` |
| `report --work W --repo R --mode M [--check-run-id N] [--dry-run]` | Post the score and complete the check run. Identity comes from arguments, never from files the submission could write |

**Scan rules (before any student code runs):**
- a file is rejected if it has ≥100 qrels-style lines, unless it's byte-identical to the official part-1 file
- a file with ≥200 TREC document IDs is rejected (hard-coded answers); 20 or more gives a warning
- any file over 20 MB, or more than 50 MB in total, is rejected

**Limits** (environment variables, defaults in brackets):
- `GRADER_BUILD_TIMEOUT` (600 s), `GRADER_INDEX_TIMEOUT` (1200 s), `GRADER_SEARCH_TIMEOUT` (300 s)
- `GRADER_JAVA_HEAP` (8g)
- `GRADER_MAX_REPO_MB` (50)
- `GRADER_DOCKER_MEMORY` (10g), `GRADER_DOCKER_CPUS` (4)

These are published to students in `src/lib/content/guide.md` and the starter-pack README, so **change all three together**.

**Executors:**
- `local` runs the student process directly with a minimal environment. It's safe on hosted runners only because the `run` job holds no secrets.
- `docker` (`--network none`, memory, CPU and PID limits, read-only dataset, `cap-drop ALL`) is for a self-hosted runner, and is **required for final mode**.

**Final mode** renumbers topics to random 7000–9999 IDs (defeats hard-coded answers) and scores against hidden qrels at `GRADER_FINAL_QRELS` on the runner.

---

## 5. Scoring (`tools/evaluate.py`)

- Follows `trec_eval` conventions:
  - documents ranked by score (descending), ties by docno (descending); the rank column is ignored
  - duplicate docnos per topic are dropped
  - at most 1000 documents per topic
  - averaged over every qrels topic with at least one relevant document; topics without results score 0
- Metrics: MAP, P@5/10/20/100, Recall@20/100/1000, MRR, R-precision, and nDCG@5/10/20/100 (graded gains, log2(rank+1) discount).
- `--out_json` uses the same field names as `/api/final_grades` (`map`, `p5`, …, `ndcg20`, …).
- Judgements: `qrels.assignment2.part1` is exactly TREC Robust 2004 for topics 401–425. The final round uses 426–450 from Robust 2004. **These judgements are public on the internet**, which is why final grading renumbers topics and the top teams' code is reviewed.

Reference numbers (instructor BM25 baseline, title + description query): **MAP 0.2998** on 401–425, 0.2140 on 426–450, 0.2569 on all 50.

---

## 6. Database (`supabase/setup.sql`)

| Table / function | Purpose | Access |
|---|---|---|
| `leaderboard` | One row per team (`student_id` = repo name): MAP, P@5, P@20, nDCG@20, repo, commit time | RLS: anon `select`; writes via service role |
| `final_grades` | Final scores, all metrics | Service role only |
| `teams` | Registered teams: name, slug, repo, `status` (`registered`, `creating`, `created`, `error`), `status_detail` | Service role only |
| `team_members` | Name, Trinity email, GitHub username (unique, case-insensitive) | Service role only |
| `roster` | Optional class list (`tcd_email`); when it has rows, only those emails can register | Service role only |
| `team_tokens` | Legacy per-team API tokens (hashed); unused by the current grader | Service role only |
| `register_team(name, slug, members)` | Atomic team insert with duplicate checks | Service role only |

The script is idempotent: rerun it after schema changes, and add new columns with `alter table … add column if not exists`.

---

## 7. Configuration reference

### Vercel (project `leaderboards`, Production)

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (the integration sets the `NEXT_PUBLIC_*` names) |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` | Server-side full access |
| `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_*_KEY` | Public read key |
| `LEADERBOARD_ADMIN_TOKEN` | Bearer token the grader uses to post scores (**must equal** the grader repo secret) |
| `GRADES_ADMIN_PASSWORD` (+ optional `GRADES_ADMIN_USER`, default `instructor`) | Basic auth for `/final-grades/grades` and `/admin/*`; if unset, those pages return 503 |
| `GRADER_APP_ID`, `GRADER_APP_PRIVATE_KEY` | GitHub App credentials (repo creation, dispatch) |
| `GITHUB_WEBHOOK_SECRET` | Webhook HMAC secret (**must equal** the App's webhook secret) |
| `TEAM_MIN_MEMBERS` / `TEAM_MAX_MEMBERS` | Team size (default 3–6) |
| `REGISTRATION_DEADLINE` (ISO 8601), `REGISTRATION_OPEN=false` | Close registration |
| `REGISTRATION_EMAIL_DOMAIN` | Default `tcd.ie` |
| `GITHUB_ORG`, `GRADER_REPO`, `TEMPLATE_REPO`, `TEAM_REPO_PREFIX` | Defaults `ca-assignments`, `ca-assignments/grader`, `ca-assignments/starter-pack`, `2026-team-` |
| `ALLOW_SHARED_TOKEN`, `LEADERBOARD_API_TOKEN` | Legacy; leave unset |

**Vercel applies variable changes only on the next deployment: redeploy after editing.**

### Grader repo (`ca-assignments/grader` → Settings → Secrets and variables → Actions)

| Kind | Name | Purpose |
|---|---|---|
| Secret | `GRADER_APP_PRIVATE_KEY` | App private key |
| Secret | `LEADERBOARD_ADMIN_TOKEN` | Same value as in Vercel |
| Variable | `GRADER_APP_ID` | `5834526` |
| Variable | `GRADER_REPO_PREFIX` | `ca-assignments/2026-team-` |
| Variable | `LEADERBOARD_URL` | `https://leaderboard.qrameez.in` |
| Variable | `GRADER_DATASET_RELEASE` | Optional, default `dataset-v1` |
| Variable | `GRADER_EXECUTOR`, `GRADER_DATASET`, `GRADER_FINAL_QRELS` | Self-hosted runner only (not used on hosted runners) |

### GitHub App `cs7is3-grader-2026`

- **Repository permissions:** Actions write, Administration write, Checks write, Contents read, Metadata read
- **Event:** Push
- **Webhook URL:** `/api/github/webhook` (see above)
- **Installation:** `ca-assignments`, all repositories

### Organization `ca-assignments`

- **Actions:** enabled for **selected repositories → `grader` only** (team repos and the starter pack can't run workflows)
- **Base member permission:** none
- **Students** are outside collaborators on their own team repo only

---

## 8. Security model

- **No student-controlled code runs where a secret exists:**
  - the `run` job has no secrets and no token permissions, on a fresh VM per job
  - the clone token is limited to one repo and expires within an hour
  - the caches are written only by `fetch` and restored read-only by `run`
- **Metrics come from the grader's own scoring** in `report`, not from files the submission produced.
- **Webhook requests must carry a valid HMAC signature.** Score APIs require the admin token. Admin pages require Basic auth.
- **Secrets live only in Vercel and GitHub Actions secrets,** never in repos or files.
- **Known weak point:** the relevance judgements are public (TREC Robust 2004). Mitigations: the scan rules, topic renumbering in final grading, the integrity rules on the student pages, and code review of top teams.
- **History:** a GitHub App private key was committed to this public repo in 2025. It and its app have been removed; don't reuse old keys.

---

## 9. Local development

```bash
npm ci
# Optional: create .env with SUPABASE_URL and keys for a separate dev Supabase project
npm run dev         # http://localhost:5173 (without Supabase the leaderboard is empty)
npx svelte-check --tsconfig ./tsconfig.json
```

- Builds don't need any env vars (everything is read at runtime).
- `vite build` compiles locally, but the Vercel adapter refuses Node 24; use Node 20/22 to build fully.
- One pre-existing `svelte-check` error in `final-grades/grades/+page.svelte` is known.

**Testing the grader without GitHub:**

```bash
cd grader
python3 scripts/grade.py prepare --work /tmp/gw --source-dir ../baseline
python3 scripts/grade.py run     --work /tmp/gw --dataset "/path/to/Assignment Two"
python3 scripts/grade.py score   --work /tmp/gw
python3 scripts/grade.py report  --work /tmp/gw --repo o/2026-team-test --mode leaderboard --dry-run
```

**On GitHub:** grader repo → **Actions → grade → Run workflow**, with a team repo and a full commit SHA. Or push to `ca-assignments/2026-team-bm25-baseline`, which should score MAP 0.2998.

---

## 10. Common changes

| Change | Where |
|---|---|
| Student-facing wording | `src/lib/content/guide.md`, `final-submission.md`; `starter-pack/README.md` |
| Time or memory limits | `grade.py` defaults (or env), plus `guide.md` and the starter-pack README |
| New metric on the leaderboard | `evaluate.py` (both copies), `ingest.ts` schemas, `supabase/setup.sql`, `+page.svelte` |
| New year / repo prefix | Vercel `TEAM_REPO_PREFIX`, grader variable `GRADER_REPO_PREFIX`, `REPO_PREFIX` default in `grade.yml` |
| Different dataset | Upload a new release (e.g. `dataset-v2`) and set `GRADER_DATASET_RELEASE` |
| Self-hosted runner | Register a runner on the grader repo with label `cs7is3-grader`, change `runs-on` in `grade.yml` |

---

## 11. Not done yet (known gaps)

1. **Final grading isn't runnable yet.**
   - `grade.yml` refuses `mode=final` on hosted runners: hidden qrels and renumbered topics need the Docker sandbox on a self-hosted runner (planned: the A6000 machine), with `GRADER_EXECUTOR=docker`, `GRADER_FINAL_QRELS` and the image from `docker/`.
   - Until then, final grading can be done manually by an instructor with `grade.py` on a trusted machine.
   **Interim manual final grading** (until the sandboxed runner exists):
   1. Use a **throwaway Linux VM or cloud machine** with no other credentials. Student code runs unsandboxed here.
   2. Install Java 17, Maven and Python 3. Copy the dataset, the grader repo and the hidden judgements for topics 426–450 onto it.
   3. For each team, using its last commit on `main` before the deadline:
      ```bash
      git clone https://github.com/ca-assignments/2026-team-<name> src-<name> && git -C src-<name> checkout <sha>
      python3 scripts/grade.py prepare --work /tmp/fg-<name> --repo ca-assignments/2026-team-<name> --sha <sha> --source-dir src-<name>
      python3 scripts/grade.py run     --work /tmp/fg-<name> --executor local --dataset /data/AssignmentTwo
      python3 scripts/grade.py score   --work /tmp/fg-<name> --qrels /secure/qrels.final
      LEADERBOARD_ADMIN_TOKEN=… python3 scripts/grade.py report --work /tmp/fg-<name> \
        --repo ca-assignments/2026-team-<name> --mode final --api-url https://leaderboard.qrameez.in
      ```
      `prepare` runs in leaderboard mode here, so topics are **not** renumbered (renumbering needs the sandbox). Review the code of top-scoring teams before publishing.
   4. Destroy the VM afterwards.

2. **No deadline freeze script.** At the deadline, team members must be switched to read access (repo **Settings → Collaborators**, or `PUT /repos/{repo}/collaborators/{user}` with `permission: pull`).
3. **Live repo creation is untested.** Push-triggered grading was verified end to end on 2026-11-19 (baseline, MAP 0.2998), but creating team repos and invitations hasn't been tried on GitHub yet.
4. **No rate limit per team.** Concurrency cancels superseded runs, but heavy pushing can use up Actions minutes.
5. **Leaderboard UI:** the improvements from the mockup (search, sorting, baseline row, grading status) aren't built. The baseline currently appears as a ranked team.
6. **Ownership:** the site repo, Vercel project, Supabase project and the `qrameez.in` domain belong to personal accounts. See the maintainer guide's handover section.

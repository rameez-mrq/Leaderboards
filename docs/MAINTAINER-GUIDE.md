# CS7IS3 Leaderboard — Maintainer Guide

For whoever runs the CS7IS3 Assignment 2 leaderboard: setting it up each year, running it during term, and handling the deadline. No programming knowledge is needed for the routine tasks. For how the system works inside, see [DEVELOPER.md](./DEVELOPER.md).

---

## 1. What the system does

Students form teams and build a search engine. They:

1. **register their team** on the website, which creates a private GitHub repository for the team and invites everyone
2. **push their code** to GitHub
3. a **grader** automatically builds and runs the code on the document collection, **scores it** (MAP), and puts the score on the **live leaderboard** and next to the commit on GitHub

The live leaderboard is **practice**: unlimited pushes, scored on topics 401–425, whose answers students have. The **final grade** is a separate run after the deadline on topics 426–450, whose answers are kept from students.

| Website page | Who uses it |
|---|---|
| https://leaderboard.qrameez.in | Everyone: the live leaderboard |
| `/register` | Students: one person registers the team |
| `/guide` | Students: full instructions |
| `/final-grades` | Students: how final grading works |
| `/admin/teams` | Instructors: registered teams, CSV export, "Create missing repositories" |
| `/final-grades/grades` | Instructors: final scores |

Instructor pages ask for a login: username **`instructor`**, password = the `GRADES_ADMIN_PASSWORD` setting in Vercel (see section 6).

---

## 2. Where everything lives

| What | Where | Owned by |
|---|---|---|
| Website code | GitHub `rameez-mrq/Leaderboards` | Rameez's personal GitHub account |
| Website hosting | Vercel project `leaderboards` (team `rameezs-projects-529501e6`) | Rameez's Vercel account |
| Domain `leaderboard.qrameez.in` | DNS for `qrameez.in` | Rameez (personal domain) |
| Database | Supabase, connected to Vercel through the Supabase integration | Rameez's Supabase account |
| GitHub organization | `ca-assignments` | Owners: Rameez (add another owner, see below) |
| Starter pack (what students start from) | `ca-assignments/starter-pack` (private template) | Organization |
| Grader | `ca-assignments/grader` (private) | Organization |
| Team repositories | `ca-assignments/2026-team-<team-name>` | Organization |
| Reference solution (BM25 baseline) | `ca-assignments/2026-team-bm25-baseline` (private) | Organization |
| GitHub App `cs7is3-grader-2026` | Organization settings → Developer settings → GitHub Apps | Organization |
| Document collection (dataset) | Release `dataset-v1` in the grader repo (586 MB) | Organization |
| Relevance judgements | `qrels.assignment2.part1` (topics 401–425) in the starter pack; topics 426–450 come from the TREC Robust 2004 judgements, kept by the module coordinator | — |

### ⚠️ Handover: do this before Rameez leaves

Several pieces are on **personal** accounts. If those accounts become unavailable, the site stops working.

1. **GitHub organization:** add the new maintainer (and the module coordinator) as **Owners** of `ca-assignments` (Organization → People → Invite member → Role: Owner).
2. **Website code:** transfer `rameez-mrq/Leaderboards` into the `ca-assignments` organization (repo → Settings → Danger zone → Transfer), then reconnect it in Vercel.
3. **Vercel:** invite the new maintainer to the Vercel team, or move the project to a team they own.
4. **Supabase:** invite the new maintainer to the Supabase organization/project.
5. **Domain:** either keep `leaderboard.qrameez.in` pointing to Vercel (Rameez keeps the domain), or add a School domain in Vercel and tell students the new address.
6. **Passwords and secrets:** hand over the instructor password and webhook secret through a password manager. Don't send them by email.

---

## 3. Yearly checklist (before term starts)

Allow about **2 hours**. Do it a week before announcing the assignment.

### 3.1 Clean up last year
1. **Archive last year's team repos.** In `ca-assignments`, open each `<year>-team-*` repo → Settings → **Archive this repository**. That keeps them read-only for the record.
2. **Export last year's results first,** if they aren't saved elsewhere: `/admin/teams.csv`, plus a copy of `/final-grades/grades`.
3. **Empty the database tables** in **Supabase → Table Editor**: `leaderboard`, `final_grades`, `team_members`, `teams` (in that order), and `roster`.

### 3.2 Set the new year
4. **Choose the new repo prefix**, e.g. `2027-team-`, and set it in **three** places:
   - **Vercel** → `leaderboards` → Settings → Environment Variables: `TEAM_REPO_PREFIX` = `2027-team-`
   - **Grader repo** → Settings → Secrets and variables → Actions → **Variables**: `GRADER_REPO_PREFIX` = `ca-assignments/2027-team-`
   - **Grader repo** file `.github/workflows/grade.yml`, line `REPO_PREFIX: … 'ca-assignments/2026-team-'`: change it to 2027 (edit on GitHub and commit)
5. **Rename the baseline repo** to `2027-team-bm25-baseline` (repo → Settings → Repository name).
6. **Team size:** if it isn't 3–6, set `TEAM_MIN_MEMBERS` / `TEAM_MAX_MEMBERS` in Vercel.
7. **Optional class list:** to restrict registration to enrolled students, add their Trinity emails to the `roster` table (Supabase → Table Editor → `roster` → Insert, or import a CSV with a `tcd_email` column).
8. **Update the student pages** for the year: dates, contact person and any rule changes. Edit `src/lib/content/guide.md` and `final-submission.md` in the website repo (GitHub's web editor is fine); the site redeploys by itself. Also update the README in `ca-assignments/starter-pack` if the instructions changed.

### 3.3 Fresh credentials (recommended every year)
9. **Instructor password:** change `GRADES_ADMIN_PASSWORD` in Vercel.
10. **Grader → website token:** make a new one and set it in both places with one command (it copies the token to your clipboard for Vercel):
    ```bash
    T=$(openssl rand -base64 32); printf %s "$T" | pbcopy; gh secret set LEADERBOARD_ADMIN_TOKEN --repo ca-assignments/grader --body "$T"; unset T
    ```
    Then paste it into Vercel as `LEADERBOARD_ADMIN_TOKEN`.
11. **After changing anything in Vercel:** Deployments → latest → **⋯ → Redeploy**. Vercel ignores new settings until it redeploys.

### 3.4 Check it works (about 10 minutes)
12. **Push a small change to the baseline repo** (e.g. edit its README on GitHub).
13. **Within ~5 minutes:**
    - the commit shows a green **"CS7IS3 grader"** check with **MAP 0.2998**
    - the baseline appears on the leaderboard
14. **Register a test team** using GitHub accounts you control. Check its repo appears in `ca-assignments` and the invitations arrive. Then delete the test repo and its row in `teams`.

If any step fails, see section 7.

---

## 4. During term

### 4.1 Opening registration
- Share **https://leaderboard.qrameez.in/register** and **/guide** with the class.
- Every student needs a GitHub account. One person registers the whole team.
- Watch **/admin/teams**. Each team should show status **created** with a repository link.
  - **registered** means the repo hasn't been created yet; **error** means creating it failed. Click **Create missing repositories** to create or retry.
  - Common cause of **error**: a misspelled GitHub username (the invitation fails). Fix the username in Supabase (`team_members`) and click the button again.
- **Close registration** by setting `REGISTRATION_DEADLINE` (e.g. `2026-12-05T17:00:00Z`) or `REGISTRATION_OPEN` = `false` in Vercel, then redeploy.

### 4.2 Changing a team
Students can't edit their registration. To change a team:

| Change | How |
|---|---|
| Add or remove a member | In GitHub: team repo → Settings → Collaborators. Also update `team_members` in Supabase so names on the leaderboard are right |
| Wrong GitHub username | Fix it in `team_members`, then invite the correct user from the repo's Collaborators page |
| Delete a team | Delete its row in `teams` (members are removed with it), archive or delete its repo, and delete its `leaderboard` row |

### 4.3 Keeping an eye on it
- **Grading activity:** grader repo → **Actions** shows every grading run. A **green** run means the grader worked, even if the team's code failed: the team sees their error on their own commit. A **red** run means something is wrong with the grader (section 7).
- **Webhook deliveries:** organization Settings → Developer settings → GitHub Apps → `cs7is3-grader-2026` → **Advanced → Recent deliveries**. Failed deliveries can be **redelivered**.
- **Actions minutes:** organization Settings → **Billing → Usage**. The free plan has 2,000 minutes a month, and each push uses about 4–5. Applying for **GitHub Education** for the organization raises the allowance and is free.

### 4.4 Re-grading a commit by hand
Grader repo → **Actions → grade → Run workflow**:
- **repo:** `ca-assignments/2026-team-<name>`
- **sha:** the full 40-character commit ID (from the team repo's commit list)
- **mode:** `leaderboard`

---

## 5. At the deadline

1. **Freeze the code.** For each team repo → Settings → Collaborators, change every member's role from **Write** to **Read**. (Not automated yet; a script is on the to-do list.)
2. **Note each team's final commit:** the last commit on `main` before the deadline (from the commit list, or `/admin/teams.csv` plus GitHub).
3. **Run the final grading.**
   - ⚠️ **The automatic final grading isn't ready yet.** It needs the sandboxed grading machine (planned on the lab's A6000 server) with the hidden judgements for topics 426–450 on it. See DEVELOPER.md, "Not done yet".
   - Until then, a developer or instructor follows **"Interim manual final grading"** in DEVELOPER.md: each team's final commit is run in a throwaway virtual machine, scored against the hidden judgements, and posted to `/api/final_grades`.
4. **Review before publishing.** Check `/final-grades/grades`.
   - For the top teams and any suspicious score (very high, or far above their leaderboard score), **look at the code** for hard-coded document IDs or use of relevance judgements. The public TREC judgements make this the main integrity risk.
5. **Publish the results** through the usual module channels. Optionally re-open repos (set members back to Write) or leave them read-only.

---

## 6. Accounts, settings and secrets

| Setting | Where | Notes |
|---|---|---|
| Instructor password (`GRADES_ADMIN_PASSWORD`) | Vercel | Username `instructor`. Change yearly |
| `LEADERBOARD_ADMIN_TOKEN` | Vercel **and** grader repo secret | Must be identical in both. Change both together (section 3.3) |
| `GRADER_APP_PRIVATE_KEY` | Vercel **and** grader repo secret | The GitHub App's key. To replace: App settings → Private keys → Generate, put it in both places, delete the old key on GitHub |
| `GITHUB_WEBHOOK_SECRET` | Vercel **and** GitHub App → Webhook secret | Must be identical in both |
| `GRADER_APP_ID` | Vercel and grader repo variable | `5834526` (not secret) |
| Supabase keys | Vercel (set by the Supabase integration) | Managed by the integration |

**Rules:** secrets go only into Vercel, GitHub secrets and a password manager. Never put them in files, repos, chat or email. If one leaks, replace it in both places straight away and redeploy Vercel.

---

## 7. When something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Leaderboard empty, but teams have pushed | Grading isn't running, or posting fails | Check grader repo → Actions (section 4.3) |
| Grader run red at "Post the score": **401 Unauthorized** | `LEADERBOARD_ADMIN_TOKEN` differs between Vercel and the grader | Set a new token in both (section 3.3), then redeploy Vercel |
| No grader run after a push | Webhook delivery failed, or the push wasn't to `main` | App → Recent deliveries: **503** "Webhook not configured" means set `GITHUB_WEBHOOK_SECRET` in Vercel and redeploy; **401** "Invalid signature" means the secret differs between GitHub and Vercel; **502** means the App key in Vercel is wrong. Then Redeliver |
| Team stuck on "registered" or "error" | Repo creation failed | `/admin/teams` → **Create missing repositories**; check `status_detail` for the reason |
| Students say they got no invitation | Wrong username, or they missed the email | Check `/admin/teams`; students can also accept from https://github.com/notifications |
| Every team's check fails at "build" or "index" with the same Java error | Something changed in the starter pack or Lucene | Push to the baseline repo: if it fails too, it's the grader or starter pack. Ask a developer |
| Grader runs stuck in "Queued" | Actions minutes used up, or Actions disabled | Organization → Billing → Usage; organization → Settings → Actions: `grader` must be allowed |
| Instructor pages say "not available" (503) | `GRADES_ADMIN_PASSWORD` not set | Set it in Vercel and redeploy |
| Site shows an error page | Vercel or Supabase problem | Vercel → Deployments → latest → Logs; Supabase → Project status (free projects **pause after 7 days without use**: click **Restore**) |

---

## 8. Costs and limits

| Service | Plan | Limit that matters |
|---|---|---|
| GitHub (`ca-assignments`) | Free | 2,000 Actions minutes a month for private repos (about 400 grading runs) |
| Vercel | Hobby | Fine for this traffic |
| Supabase | Free | Pauses after 7 days of inactivity; 500 MB database |

Nothing here costs money at the current scale.

---

## 9. Contacts

- **Built by:** Rameez Qureshi (moquresh@tcd.ie), 2025–2026
- **Technical details:** [DEVELOPER.md](./DEVELOPER.md) in the website repo, and the README in `ca-assignments/grader`

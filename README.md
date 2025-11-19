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

## Deploying to GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Push your code to GitHub**
   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repository**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
   - Save the settings

3. **The deployment will run automatically**
   - Every push to `main` or `master` branch will trigger a deployment
   - You can also manually trigger it from the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

4. **Access your site**
   - Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
   - If your repository name is `Leaderboards`, the URL will be: `https://YOUR_USERNAME.github.io/Leaderboards/`

### If deploying to a subdirectory

If your repository name is not the root path, update `svelte.config.js`:

```js
kit: {
  paths: {
    base: '/your-repo-name'  // Uncomment and set your repo name
  }
}
```

### Manual Deployment

If you prefer to deploy manually:

```sh
npm run build
# Then push the 'build' folder contents to the 'gh-pages' branch
```

## Project Structure

```
├── src/
│   ├── routes/
│   │   ├── +layout.svelte    # Layout wrapper
│   │   ├── +layout.ts        # Prerender configuration
│   │   └── +page.svelte      # Main leaderboard page
│   └── app.css               # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment workflow
└── svelte.config.js          # SvelteKit configuration with static adapter
```

## Updating Leaderboard Data

The leaderboard data is stored in `static/leaderboard.json`. You can update it in several ways:

### Method 1: Manual Script (Recommended)

Use the update script to add or update student entries:

```bash
node scripts/update-leaderboard.js --name "Student Name" --team "Team Name" --map 0.35 --commit "1 hour ago"
```

See `scripts/README.md` for detailed usage.

### Method 2: Direct JSON Edit

Edit `static/leaderboard.json` directly:

```json
[
  {
    "id": 1,
    "name": "Student Name",
    "team": "Team Name",
    "map": 0.35,
    "lastCommit": "2 hours ago"
  }
]
```

Then commit and push:
```bash
git add static/leaderboard.json
git commit -m "Update leaderboard"
git push
```

### Method 3: Automatic Sync from Student Repos (Recommended for Production)

The leaderboard can automatically fetch MAP scores from each student group's GitHub Actions runs.

**Setup:**
1. Edit `students.json` with student repository information:
   ```json
   {
     "id": 1,
     "name": "Student Name",
     "team": "Team Name",
     "repo": "username/repo-name",
     "workflowName": "evaluation.yml",
     "resultsFile": "results/metrics.json"
   }
   ```

2. Add a GitHub token as a secret:
   - Go to Settings → Secrets and variables → Actions
   - Add secret: `GITHUB_TOKEN` (token with `repo` and `actions:read` permissions)

3. The workflow runs automatically every 30 minutes, or you can trigger it manually from Actions → Sync Student Results

**How it works:**
- Checks each student repo for results files (e.g., `results/metrics.json`)
- Extracts MAP scores from the files
- Updates the leaderboard automatically
- Commits and redeploys the site

See `scripts/README-STUDENT-SYNC.md` for detailed setup instructions.

### Method 4: Manual Workflow Trigger

Use the manual workflow trigger:
1. Go to **Actions** → **Update Leaderboard**
2. Click **Run workflow**
3. Fill in the student details
4. The workflow will update the JSON and trigger a redeploy

## Supabase Backend (API-first Flow)

The live leaderboard now reads from Supabase and exposes a secure ingestion API (`/api/results`) that student workflows can call after their evaluation finishes.

### 1. Create the `leaderboard` table

```sql
create table leaderboard (
  id bigint generated always as identity primary key,
  student_id text unique not null,
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
```

### 2. Environment variables (set in Vercel)

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (used only on the server/API route) |
| `SUPABASE_ANON_KEY` | Public anon key (used server-side for read queries) |
| `LEADERBOARD_API_TOKEN` | Shared secret that student workflows send in the `Authorization: Bearer ...` header |

**⚠️ Important:** After setting environment variables, make sure to **disable Vercel Deployment Protection** for your API routes:

1. Go to your Vercel project → **Settings** → **Deployment Protection**
2. Either:
   - **Disable Deployment Protection** entirely (recommended for public APIs), or
   - Configure it to **bypass protection for `/api/*` routes**
3. Redeploy your project

Without this, all API requests will be blocked by Vercel's authentication layer before reaching your code.

### 3. Student workflow snippet

Add this step after metrics are generated (replace the env values per repo):

```yaml
- name: Submit metrics to leaderboard
  if: ${{ success() }}
  run: |
    curl -X POST "${{ secrets.LEADERBOARD_API_URL }}/api/results" \
      -H "Authorization: Bearer ${{ secrets.LEADERBOARD_API_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{
            "student_id": "team-lucene",
            "student_name": "Team Lucene",
            "team": "Lucene",
            "map": '${{ steps.metrics.outputs.map }}',
            "p20": '${{ steps.metrics.outputs.p20 }}',
            "ndcg": '${{ steps.metrics.outputs.ndcg }}',
            "run_id": "${{ github.run_id }}",
            "repo": "${{ github.repository }}",
            "last_commit": "${{ github.event.head_commit.timestamp }}"
          }'
```

Each student repo only needs:
- `LEADERBOARD_API_URL` (e.g., `https://leaderboard.qrameez.in`)
- `LEADERBOARD_API_TOKEN` (shared secret you provide)

No Supabase keys are shared with students.

## Technologies

- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

# Automatic Student Results Sync

This system automatically fetches MAP scores from each student group's GitHub Actions runs and updates the leaderboard.

## How It Works

1. **Student Repositories**: Each student repo runs evaluation workflows that produce MAP scores
2. **Leaderboard Sync**: This leaderboard repo periodically checks student repos for latest results
3. **Auto-Update**: When new results are found, the leaderboard is automatically updated

## Setup Instructions

### 1. Configure Student Repositories

Edit `students.json` with your student information:

```json
[
  {
    "id": 1,
    "name": "Avery Chen",
    "team": "Team Lucene",
    "repo": "averychen/cs7is3-assignment",
    "workflowName": "evaluation.yml",
    "resultsFile": "results/metrics.json"
  }
]
```

**Fields:**
- `id`: Unique student ID
- `name`: Student name
- `team`: Team name
- `repo`: GitHub repository in format `owner/repo-name`
- `workflowName`: Name of the evaluation workflow file (default: `evaluation.yml`)
- `resultsFile`: Path to results file in the repo (optional, default: `results/metrics.json`)

### 2. Set Up GitHub Token

The workflow needs a GitHub token to access student repositories:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Create a token with `repo` and `actions:read` permissions
3. Add it as a secret in your leaderboard repository:
   - Go to Settings → Secrets and variables → Actions
   - Add secret named `GITHUB_TOKEN` with your token value

### 3. How Results Are Fetched

The script tries multiple methods to get MAP scores:

1. **Results File** (Preferred): Reads from a JSON file in the student repo
   - Path: `results/metrics.json` (or custom path)
   - Format: `{ "map": 0.35 }` or `{ "MAP": 0.35 }` or `{ "metrics": { "map": 0.35 } }`

2. **Workflow Artifacts**: Downloads artifacts from successful workflow runs
   - Looks for artifacts named `metrics` or `results`

3. **Workflow Summary**: Parses the Actions summary if results are published there

### 4. Student Repository Setup (Optional - Real-time Updates)

For real-time updates when students push, students can add a webhook workflow to their repo:

1. Copy `.github/workflows/student-webhook-template.yml` to student repo
2. Update the repository name in the workflow
3. Add `LEADERBOARD_TOKEN` secret to student repo (token with access to leaderboard repo)

This will trigger immediate updates when evaluation completes.

### 5. Manual Sync

You can manually trigger a sync:

```bash
# Set token
export GITHUB_TOKEN=your_token_here

# Run sync
node scripts/fetch-student-results.js
```

Or use GitHub Actions:
- Go to Actions → Sync Student Results → Run workflow

## Results File Format

Students should commit a results file in their repo. Example formats:

**Option 1: Simple JSON**
```json
{
  "map": 0.3524,
  "p20": 0.28,
  "ndcg20": 0.31
}
```

**Option 2: Nested**
```json
{
  "metrics": {
    "map": 0.3524,
    "p20": 0.28,
    "ndcg20": 0.31
  }
}
```

**Option 3: With MAP key**
```json
{
  "MAP": 0.3524,
  "P@20": 0.28,
  "nDCG@20": 0.31
}
```

## Troubleshooting

### No results found
- Check that the repo path in `students.json` is correct
- Verify the student repo has successful workflow runs
- Check if results file exists at the specified path
- Ensure GitHub token has access to student repos

### Permission errors
- Make sure `GITHUB_TOKEN` secret is set correctly
- Token needs `repo` scope for private repos
- Token needs `actions:read` for workflow access

### Results not updating
- Check workflow logs in Actions tab
- Verify student repos are accessible
- Ensure results file format matches expected structure


# Leaderboard Update Scripts

## Manual Update Script

Update the leaderboard manually using the Node.js script:

```bash
node scripts/update-leaderboard.js --name "Student Name" --team "Team Name" --map 0.35 --commit "1 hour ago"
```

### Options:
- `--name` (required): Student name
- `--team`: Team name
- `--map` (required): MAP score (number)
- `--commit`: Last commit time/description
- `--id`: Student ID (for updating existing entries)

### Examples:

**Add a new student:**
```bash
node scripts/update-leaderboard.js --name "John Doe" --team "Team Alpha" --map 0.42 --commit "2 hours ago"
```

**Update existing student:**
```bash
node scripts/update-leaderboard.js --id 1 --name "John Doe" --map 0.45 --commit "30 minutes ago"
```

**Bulk update from CSV:**
You can create a simple script to read from a CSV file and update multiple students at once.

## Automated Updates

### Option 1: GitHub Actions (Recommended)

Create a workflow that runs after evaluation results are available. See `.github/workflows/update-leaderboard.yml` for an example.

### Option 2: Direct File Edit

Simply edit `static/leaderboard.json` directly and commit:

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

After updating, rebuild and redeploy:
```bash
npm run build
git add static/leaderboard.json
git commit -m "Update leaderboard"
git push
```


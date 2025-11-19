# CS7IS3 Assignment 2 - Evaluation & Leaderboard Submission Guide

This guide explains how to run the evaluation workflow and automatically submit your MAP scores to the leaderboard.

## 📋 Prerequisites

- Your search engine implementation is complete (`App.java`, `Indexer.java`, `Searcher.java`)
- Your repository has the evaluation workflow (`.github/workflows/evaluation.yml`)
- You have access to your repository's Settings page

## 🔐 Step 1: Add Leaderboard API Secrets

Before your evaluation can submit scores, you need to add two secrets to your repository:

1. **Go to your repository on GitHub**
2. **Navigate to Settings → Secrets and variables → Actions**
3. **Click "New repository secret"** and add the following:

### Secret 1: `LEADERBOARD_API_URL`
- **Name:** `LEADERBOARD_API_URL`
- **Value:** `https://your-leaderboard-app.vercel.app` (your instructor will provide this URL)
- Click **Add secret**

### Secret 2: `LEADERBOARD_API_TOKEN`
- **Name:** `LEADERBOARD_API_TOKEN`
- **Value:** (your instructor will provide this token)
- Click **Add secret**

> ⚠️ **Important:** Keep these secrets private. Never commit them to your code or share them publicly.

## 🚀 Step 2: Run the Evaluation Workflow

The evaluation workflow runs automatically when you push code to your repository. Here's what happens:

### Automatic Trigger
- **Push to any branch** → Workflow runs automatically
- **Create a Pull Request** → Workflow runs automatically

### Manual Trigger (Optional)
1. Go to your repository's **Actions** tab
2. Select **"CS7IS3 Assignment 2 - Search Engine Evaluation"** workflow
3. Click **"Run workflow"** → **"Run workflow"** (green button)

## 📊 What the Workflow Does

The evaluation workflow performs these steps:

1. **✅ Validates Project Structure**
   - Checks for `pom.xml`, Java source code, `topics` file, and dataset directory

2. **🔨 Builds Your Project**
   - Runs `mvn clean package` to compile your search engine

3. **📚 Indexes Documents**
   - Executes: `java -jar target/cs7is3-search-1.0.0.jar index --docs "Assignment Two" --index index`
   - Creates a Lucene index from the dataset

4. **🔍 Searches Topics**
   - Executes: `java -jar target/cs7is3-search-1.0.0.jar search --index index --topics topics --output runs/student.run --numDocs 1000`
   - Generates search results for all topics

5. **📈 Evaluates Results**
   - Generates evaluation data using `tools/generate_qrels.py`
   - Calculates metrics using `tools/evaluate.py`
   - Produces `out/standings.csv` and `out/standings.md` with your scores

6. **📤 Submits to Leaderboard** (if secrets are configured)
   - Automatically extracts MAP, P@5, P@20, and nDCG@20 scores
   - Sends them to the leaderboard API
   - Updates your position on the live leaderboard

## ✅ Step 3: Verify Your Submission

### Check Workflow Status
1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Look for the **"Submit metrics to leaderboard"** step
4. If it shows ✅ (green checkmark), your scores were submitted successfully

### Check the Leaderboard
1. Visit the leaderboard URL (provided by your instructor)
2. Look for your team/student name
3. Your MAP score should appear, sorted from highest to lowest

### View Detailed Results
In the workflow run, you can see:
- **Step Summary:** Click on the workflow run → Scroll to the bottom to see a formatted summary
- **Console Output:** Each step shows detailed logs
- **Artifacts:** Download `search-engine-evaluation-results` to see CSV and markdown files

## 📝 Understanding Your Scores

The evaluation calculates these metrics:

- **MAP (Mean Average Precision):** Primary ranking metric (0.0 to 1.0, higher is better)
- **P@5 (Precision at 5):** Fraction of top 5 results that are relevant
- **P@20 (Precision at 20):** Fraction of top 20 results that are relevant
- **nDCG@20 (Normalized DCG at 20):** Ranking quality considering position

The leaderboard displays **MAP score** as the primary ranking metric.

## 🔄 Updating Your Score

Every time you:
- Push new code
- Make a pull request
- Manually trigger the workflow

The evaluation runs again and **automatically updates** your leaderboard entry with the latest scores. You don't need to do anything extra!

## 🐛 Troubleshooting

### "Submit metrics to leaderboard" step is skipped

**Problem:** The step shows as skipped (gray) instead of running.

**Solution:**
- Check that both `LEADERBOARD_API_URL` and `LEADERBOARD_API_TOKEN` secrets are set
- Go to Settings → Secrets and variables → Actions
- Verify both secrets exist and have correct values

### Workflow fails before evaluation

**Common causes:**
- Missing `pom.xml` or Java source files
- Build errors in your code
- Missing `topics` file or `Assignment Two` dataset

**Solution:**
- Check the workflow logs to see which step failed
- Fix the issue and push again

### Scores not appearing on leaderboard

**Check:**
1. Did the "Submit metrics to leaderboard" step succeed? (green checkmark)
2. Are your secrets correct? (verify with instructor)
3. Wait a few seconds and refresh the leaderboard page

**If still not working:**
- Check the workflow logs for error messages
- Verify the API URL is correct (should be your Vercel app URL)
- Contact your instructor if the issue persists

### Evaluation runs but shows 0.0 scores

**Possible causes:**
- Search engine didn't produce results
- `runs/student.run` file is empty or malformed
- Evaluation script couldn't parse the results

**Solution:**
- Check the "Build and Test Search Engine" step logs
- Verify your search engine is producing output
- Check that `runs/student.run` file exists and has content

## 📚 Workflow File Location

Your evaluation workflow is located at:
```
.github/workflows/evaluation.yml
```

You can view and modify it in your repository. The workflow is already configured to:
- Run on push and pull requests
- Build your project
- Run evaluation
- Submit scores automatically (if secrets are set)

## 🎯 Best Practices

1. **Test Locally First**
   - Run `mvn clean package` locally to catch build errors
   - Test your search engine before pushing

2. **Check Workflow Logs**
   - Always review the Actions tab after pushing
   - Look for any warnings or errors

3. **Keep Secrets Secure**
   - Never commit secrets to your code
   - Never share your `LEADERBOARD_API_TOKEN` publicly

4. **Regular Updates**
   - Push frequently to get updated scores
   - The leaderboard shows your latest successful evaluation

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the workflow logs in the Actions tab
3. Contact your instructor with:
   - Your repository URL
   - The workflow run number
   - Screenshot of the error (if any)

## 🔗 Quick Reference

- **Leaderboard URL:** (provided by instructor)
- **Workflow File:** `.github/workflows/evaluation.yml`
- **Secrets Location:** Settings → Secrets and variables → Actions
- **Actions Tab:** `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

---

**Good luck with your search engine implementation! 🚀**


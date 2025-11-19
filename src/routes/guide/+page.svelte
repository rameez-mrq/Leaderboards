<script lang="ts">
	import { marked } from 'marked';

	const markdownContent = `# CS7IS3 Assignment 2 - Evaluation & Leaderboard Guide

This guide shows you how to run the evaluation workflow and automatically submit your MAP scores to the leaderboard.

## 📋 Required Files

Before running the evaluation, ensure your repository has these files and directories. You can download them from the links below:

### Required Files (Root Directory):
- ✅ \`pom.xml\` - Maven project configuration
  - 📥 [Download pom.xml](https://drive.google.com/file/d/1f3X7Q5PtiDjbemFU3Hv4heeMsrLEAZVC/view?usp=drive_link)
- ✅ \`topics\` - Search topics file
  - 📥 [Download topics](https://drive.google.com/file/d/13FB15WEDbGO_cP1x9ule_pFZYqkbLYqp/view?usp=drive_link)
- ✅ \`qrels.assignment2.part1\` - Relevance judgments for evaluation
  - 📥 [Download qrels.assignment2.part1](https://drive.google.com/file/d/1PzOTutqdPd4gwz37RyLjtSD64pN7mHDB/view?usp=drive_link)

### Required Files (Tools Directory):
- ✅ \`tools/evaluate.py\` - Python script for evaluating search results
  - 📥 [Download evaluate.py](https://drive.google.com/file/d/1uCiJTSSP52dhOJsAnw9X2BTJEY6fOLZA/view?usp=drive_link)

### Required Files (GitHub Workflow):
- ✅ \`.github/workflows/evaluation.yml\` - Evaluation workflow file
  - 📥 [Download evaluation.yml](https://drive.google.com/file/d/16-fZZqy-U6F8zzkJhuvafD6AJ6mhKaWZ/view?usp=drive_link)

### Required Directory:
- ✅ \`Assignment Two/\` - Dataset directory containing:
  - \`fbis/\` - FBIS documents
  - \`fr94/\` - Federal Register documents (subdirectories 01-12)
  - \`ft/\` - Financial Times documents (subdirectories ft911-ft944)
  - \`latimes/\` - LA Times documents
  - \`dtds/\` - DTD files for document parsing
    - \`fbisdtd.dtd\`
    - \`fr94dtd\`
    - \`ftdtd\`
    - \`latimesdtd.dtd\`
  - 📥 [Download Assignment Two dataset](YOUR_DOWNLOAD_LINK/Assignment-Two.zip) (large file, ~XXX MB)

> 💡 **Tip:** After downloading, extract the \`Assignment Two\` directory to your repository root. For other files, place them in the exact locations shown in the [File Structure Reference](#-file-structure-reference) section below.

### Your Java Source Code:
- ✅ \`src/main/java/App.java\`
- ✅ \`src/main/java/Indexer.java\`
- ✅ \`src/main/java/Searcher.java\`

### Required for leaderboard submission:
- GitHub Secrets: \`LEADERBOARD_API_URL\` and \`LEADERBOARD_API_TOKEN\`
- Optional: \`TEAM_NAME\` - Your team name (if not set, repository name will be used)
- Optional: \`TEAM_MEMBERS\` - Names of team members, comma-separated (e.g., "John Doe, Jane Smith")

## 🚀 Quick Start

### Step 1: Configure GitHub Secrets (One-time setup)

To submit scores to the leaderboard, add these secrets to your repository:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add:

   **Secret 1:**
   - **Name:** \`LEADERBOARD_API_URL\`
   - **Value:** \`https://leaderboard.qrameez.in\`
   
   **Secret 2:**
   - **Name:** \`LEADERBOARD_API_TOKEN\`
   - **Value:** (provided by your instructor)
   
   **Secret 3 (Optional):**
   - **Name:** \`TEAM_NAME\`
   - **Value:** Your team name (e.g., "Team Lucene", "Query Rangers")
   - If not set, your repository name will be used as the team name
   
   **Secret 4 (Optional):**
   - **Name:** \`TEAM_MEMBERS\`
   - **Value:** Names of team members, comma-separated (e.g., "John Doe, Jane Smith, Bob Johnson")
   - If not set, your GitHub username will be used

> ⚠️ **Note:** Without \`LEADERBOARD_API_URL\` and \`LEADERBOARD_API_TOKEN\`, the evaluation will still run but won't submit to the leaderboard.

### Step 2: Run the Evaluation

The evaluation runs automatically when you **push code** to your repository. You can also trigger it manually:

1. Go to **Actions** tab
2. Select **"CS7IS3 Assignment 2 - Search Engine Evaluation"**
3. Click **"Run workflow"** → **"Run workflow"**

### Step 3: Check Results

1. **View workflow output:**
   - Go to **Actions** tab → Click the latest workflow run
   - Check the **"Submit metrics to leaderboard"** step (should show ✅)
   - View detailed metrics in the workflow summary

2. **View leaderboard:**
   - Visit: \`https://leaderboard.qrameez.in\`
   - Find your team and members' names with MAP score

## 📊 What the Evaluation Does

The workflow automatically:

1. **Validates** your project structure (checks for required files)
2. **Builds** your project (\`mvn clean package\`)
3. **Indexes** documents from \`Assignment Two/\` directory
4. **Searches** all topics from the \`topics\` file
5. **Evaluates** results using \`qrels.assignment2.part1\`
6. **Submits** scores to leaderboard (if secrets are configured)

## 📝 Understanding Your Scores

The evaluation calculates these metrics:

- **MAP (Mean Average Precision)** - Primary ranking metric (0.0 to 1.0, higher is better)
- **P@5** - Precision at 5 (fraction of top 5 results that are relevant)

**The leaderboard ranks by MAP score.**

## 🔄 Updating Your Score

Every time you:
- Push new code
- Create a pull request
- Manually trigger the workflow

Your leaderboard entry **automatically updates** with the latest scores. No extra steps needed!

## 🐛 Troubleshooting

### Workflow fails at "Build and Test Search Engine"

**Check:**
- ✅ \`pom.xml\` exists in root directory
- ✅ Java source files are in \`src/main/java/\`
- ✅ \`topics\` file exists in root directory
- ✅ \`Assignment Two/\` directory exists with dataset files

**Fix:** Add missing files and push again.

### Workflow fails at "Evaluate Results"

**Check:**
- ✅ \`tools/evaluate.py\` exists in your repository
- ✅ \`qrels.assignment2.part1\` file exists in root directory
- ✅ \`runs/student.run\` file was generated (check previous step logs)

**Fix:** Ensure \`tools/evaluate.py\` is present and the search step completed successfully.

### "Submit metrics to leaderboard" step is skipped

**Problem:** Step shows as gray (skipped)

**Solution:**
- Go to **Settings** → **Secrets and variables** → **Actions**
- Verify both \`LEADERBOARD_API_URL\` and \`LEADERBOARD_API_TOKEN\` are set
- Ensure URL is exactly: \`https://leaderboard.qrameez.in\` (no trailing slash)

### Scores show 0.0 on leaderboard

**Possible causes:**
- Search engine didn't produce results
- \`runs/student.run\` file is empty
- Build or search step failed

**Solution:**
- Check workflow logs in the **"Build and Test Search Engine"** step
- Verify your search engine produces output
- Ensure evaluation completed successfully

### Scores not appearing on leaderboard

**Check:**
1. Did "Submit metrics to leaderboard" step succeed? (✅ green checkmark)
2. Wait 10-30 seconds and refresh the leaderboard page
3. Verify secrets are correct

**If still not working:**
- Check workflow logs for error messages
- Verify API URL in secrets matches: \`https://leaderboard.qrameez.in\`

## 📚 File Structure Reference

Your repository should look like this:

\`\`\`
your-repo/
├── pom.xml
├── topics
├── qrels.assignment2.part1
├── src/
│   └── main/
│       └── java/
│           ├── App.java
│           ├── Indexer.java
│           └── Searcher.java
├── Assignment Two/
│   ├── fbis/
│   ├── fr94/
│   │   ├── 01/
│   │   ├── 02/
│   │   └── ... (subdirectories 03-12)
│   ├── ft/
│   │   ├── ft911/
│   │   ├── ft921/
│   │   └── ... (other ft subdirectories)
│   ├── latimes/
│   └── dtds/
│       ├── fbisdtd.dtd
│       ├── fr94dtd
│       ├── ftdtd
│       └── latimesdtd.dtd
├── tools/
│   └── evaluate.py
└── .github/
    └── workflows/
        └── evaluation.yml
\`\`\`

## 🎯 Best Practices

1. **Test locally first:**
   \`\`\`bash
   mvn clean package
   \`\`\`
   Fix build errors before pushing.

2. **Check workflow logs:**
   - Always review the Actions tab after pushing
   - Look for warnings or errors in each step

3. **Keep secrets secure:**
   - Never commit secrets to your code
   - Never share your \`LEADERBOARD_API_TOKEN\`

4. **Push frequently:**
   - The leaderboard shows your latest successful evaluation
   - Push after each improvement to update your score

## 🔗 Quick Reference

- **Leaderboard:** \`https://leaderboard.qrameez.in\`
- **Workflow:** \`.github/workflows/evaluation.yml\`
- **Secrets:** Settings → Secrets and variables → Actions
- **Actions Tab:** \`https://github.com/YOUR_USERNAME/YOUR_REPO/actions\`

## 📞 Contact

If you have any questions or encounter issues, please contact:

**Rameez Qureshi**  
📧 [moquresh@tcd.ie](mailto:moquresh@tcd.ie)

---

**Good luck with your search engine implementation! 🚀**`;

	// Fix quotes in markdown source before parsing
	const markdownWithQuotes = markdownContent
		// Replace quotes in examples and text (preserve backticks and code blocks)
		.replace(/([^`]|^)"([^"]+)"([^`]|$)/g, (match, before, content, after) => {
			// Skip if inside code blocks or backticks
			if (before === '`' || after === '`') return match;
			return before + '\u201C' + content + '\u201D' + after;
		})
		// Handle quotes after e.g.,
		.replace(/\(e\.g\.,\s*"([^"]+)"\)/g, '(e.g., \u201C$1\u201D)')
		.replace(/\(e\.g\.,\s*"([^"]+)"\s*,\s*"([^"]+)"\)/g, '(e.g., \u201C$1\u201D, \u201C$2\u201D)');
	
	// Parse markdown and add target="_blank" to external links
	const parsed = marked.parse(markdownWithQuotes);
	let htmlContent = typeof parsed === 'string' ? parsed : String(parsed);
	
	// Add target="_blank" to all external links
	htmlContent = htmlContent.replace(
		/<a href="(https?:\/\/[^"]+)"/g,
		'<a href="$1" target="_blank" rel="noopener noreferrer"'
	);
</script>

<svelte:head>
	<title>Student Guide - CS7IS3 Leaderboard</title>
</svelte:head>

<main class="guide-page">
	<div class="guide-container">
		<div class="guide-header">
			<a href="/" class="back-link">← Back to Leaderboard</a>
		</div>
		<div class="guide-content">
			{@html htmlContent}
		</div>
	</div>
</main>

<style>
	.guide-page {
		min-height: 100vh;
		background: #f8fafc;
		padding: 2rem 1rem;
	}

	.guide-container {
		max-width: 900px;
		margin: 0 auto;
		background: #fff;
		border-radius: 12px;
		padding: 2.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.guide-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #e2e8f0;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		color: #6366f1;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9375rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #4f46e5;
		text-decoration: underline;
	}

	.guide-content {
		color: #334155;
		line-height: 1.7;
		font-size: 1.0625rem;
	}

	.guide-content :global(h1) {
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-size: 2rem;
		color: #0f172a;
		font-weight: 700;
		border-bottom: 2px solid #e2e8f0;
		padding-bottom: 0.75rem;
	}

	.guide-content :global(h2) {
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		font-size: 1.75rem;
		color: #0f172a;
		font-weight: 700;
		border-bottom: 2px solid #e2e8f0;
		padding-bottom: 0.5rem;
	}

	.guide-content :global(h3) {
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		font-size: 1.375rem;
		color: #1e293b;
		font-weight: 600;
	}

	.guide-content :global(h4) {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		font-size: 1.125rem;
		color: #334155;
		font-weight: 600;
	}

	.guide-content :global(p) {
		margin-bottom: 1rem;
		font-size: 1.0625rem;
	}

	.guide-content :global(ul),
	.guide-content :global(ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
		font-size: 1.0625rem;
	}

	.guide-content :global(li) {
		margin-bottom: 0.5rem;
		font-size: 1.0625rem;
	}

	.guide-content :global(code) {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.9375em;
		color: #e11d48;
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.guide-content :global(pre) {
		background: #1e293b;
		color: #e2e8f0;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.guide-content :global(pre code) {
		background: transparent;
		color: inherit;
		padding: 0;
	}

	.guide-content :global(blockquote) {
		border-left: 4px solid #6366f1;
		padding-left: 1rem;
		margin: 1.5rem 0;
		color: #475569;
		font-style: italic;
		font-size: 1.0625rem;
	}

	.guide-content :global(a) {
		color: #6366f1;
		text-decoration: none;
		font-weight: 500;
	}

	.guide-content :global(a:hover) {
		text-decoration: underline;
		color: #4f46e5;
	}

	.guide-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
	}

	.guide-content :global(table th),
	.guide-content :global(table td) {
		border: 1px solid #e2e8f0;
		padding: 0.75rem;
		text-align: left;
		font-size: 1.0625rem;
	}

	.guide-content :global(table th) {
		background: #f8fafc;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.guide-container {
			padding: 1.5rem;
		}

		.guide-content {
			font-size: 1rem;
		}

		.guide-content :global(h2) {
			font-size: 1.5rem;
		}

		.guide-content :global(h3) {
			font-size: 1.25rem;
		}

		.guide-content :global(p),
		.guide-content :global(ul),
		.guide-content :global(ol),
		.guide-content :global(li) {
			font-size: 1rem;
		}
	}
</style>


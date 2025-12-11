<script lang="ts">
	import { marked } from 'marked';

	const markdownContent = `# CA Part 2 Grading

## Required files (place in your repo)
- ✅ \`.github/workflows/classroom.yml\`
  - 📥 [Download classroom.yml](https://drive.google.com/file/d/1RomLbE8wmbW_k39sxZp5AkEM59Y_4mwf/view?usp=sharing)
- ✅ \`tools/evaluate_final.py\`
  - 📥 [Download evaluate_final.py](https://drive.google.com/file/d/1KrNNHaI9laYyDotEcb7_llb0J-v2g9zt/view?usp=sharing)
- Put them exactly in \`.github/workflows/\` and \`tools/\` respectively. Do not edit these files.

## What the workflow does
- On push/CI, \`.github/workflows/classroom.yml\` runs.
- It downloads assets on the runner (topics/qrels/dataset), builds your code, runs search to produce \`runs/student.run\`, evaluates with \`tools/evaluate_final.py\`, and submits metrics. Only minimal status is shown.

## How to submit
1) Add the provided files to the correct paths (\`.github/workflows/classroom.yml\`, \`tools/evaluate_final.py\`).  
2) Ensure your code can build and writes \`runs/student.run\` in TREC format (local sanity check optional).  
3) Commit only your retrieval code/configs; leave workflow/eval scripts untouched.  
4) Push your repo; CI runs automatically.  
5) If CI fails, make minimal fixes to your own code and push again. Do not change the workflow/eval scripts; explain any fixes to the code in your commit message.

## What you should see after submission
- In GitHub Actions: the workflow completes with green checks; students only see minimal status.
- Scores/metrics are submitted to the final grades system; detailed metrics are not shown to students.

## Rules
- Do not modify \`classroom.yml\` or \`tools/evaluate_final.py\`.  
- Do not change your retrieval/search implementation or any submitted code unless explicitly told to resubmit.  
- Keep repo structure unchanged; \`runs/student.run\` must be produced in TREC format.  
- No local downloads of topics/qrels/dataset are needed—handled on the runner.  
- Do not alter the submitted repository after pushing (unless instructed to resubmit).

## Contact
- Rameez Qureshi — moquresh@tcd.ie`;

	// Basic markdown parse
	const parsed = marked.parse(markdownContent);
	let htmlContent = typeof parsed === 'string' ? parsed : String(parsed);

	// Add target="_blank" to external links (none here, but keep consistent)
	htmlContent = htmlContent.replace(
		/<a href="(https?:\/\/[^"]+)"/g,
		'<a href="$1" target="_blank" rel="noopener noreferrer"'
	);
</script>

<svelte:head>
	<title>CA Part 2 Grading - CS7IS3 Leaderboard</title>
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

	.guide-content :global(a) {
		color: #6366f1;
		text-decoration: none;
		font-weight: 600;
	}

	.guide-content :global(a:hover) {
		text-decoration: underline;
		color: #4f46e5;
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

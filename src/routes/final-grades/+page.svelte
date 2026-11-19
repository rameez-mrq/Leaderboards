<script lang="ts">
	import source from '$lib/content/final-submission.md?raw';
	import { renderMarkdown } from '$lib/markdown';

	const htmlContent = renderMarkdown(source);
</script>

<svelte:head>
	<title>Final submission - CS7IS3</title>
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

	.guide-content :global(li:has(> input[type='checkbox'])) {
		list-style: none;
		margin-left: -1.25rem;
	}

	.guide-content :global(li > input[type='checkbox']) {
		margin-right: 0.5rem;
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

<script lang="ts">
	export let data: { students: any[] };
	const leaderboard = [...data.students]
		.sort((a, b) => b.map - a.map)
		.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
	let selected = null as null | (typeof leaderboard)[number];
	const open = (entry) => (selected = entry);
	const close = () => (selected = null);
</script>

<svelte:head>
	<title>Final Grades - CS7IS3</title>
</svelte:head>

<main class="page">
	<div class="leaderboard-container">
		<div class="header-section">
			<h1>CS7IS3 Final Grades</h1>
		</div>
		<div class="info-note-row">
			<div class="info-note">
				💡 Click on any entry to view detailed metrics and reports
			</div>
			<a href="/" class="guide-link">← Back to Leaderboard</a>
		</div>
		<table>
			<thead>
				<tr>
					<th>Rank</th>
					<th>Team</th>
					<th>MAP</th>
					<th>P@5</th>
					<th>nDCG@20</th>
				</tr>
			</thead>
			<tbody>
				{#each leaderboard as student, index}
					<tr
						on:click={() => open(student)}
						class={`clickable ${student.rank === 1 ? 'first-place' : ''} ${student.rank === 2 ? 'second-place' : ''} ${student.rank === 3 ? 'third-place' : ''}`}
					>
						<td class="rank">
							{#if student.rank === 1}
								<span class="crown">👑</span>
							{:else}
								#{student.rank}
							{/if}
						</td>
						<td class="team">
							{#if student.rank === 1}
								<span class="team-name">{student.team}</span>
							{:else}
								{student.team}
							{/if}
						</td>
						<td class="score">{student.map.toFixed(4)}</td>
						<td class="score">{student.p5.toFixed(4)}</td>
						<td class="score">{student.ndcg20?.toFixed(4) ?? '0.0000'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if selected}
		<div class="modal-backdrop" on:click={close}></div>
		<div class="modal" role="dialog" aria-modal="true">
			<div class="modal-header">
				<div>
					<h2>{selected.team}</h2>
					<p class="subtitle">
						{#if selected.name && selected.name.trim() !== ''}
							Members: {selected.name}
						{:else}
							ID: {selected.studentId}
						{/if}
					</p>
				</div>
				<button class="close" on:click={close} aria-label="Close">×</button>
			</div>
			<div class="modal-body">
				<div class="metric-cards">
					<div class="metric-card" data-hint="Mean Average Precision across all topics.">
						<p>MAP</p>
						<h4>{selected.map.toFixed(4)}</h4>
					</div>
					<div class="metric-card" data-hint="Precision at rank 5 (top-5 relevancy).">
						<p>P@5</p>
						<h4>{selected.p5.toFixed(4)}</h4>
					</div>
					<div class="metric-card" data-hint="Normalized DCG at rank 20.">
						<p>nDCG@20</p>
						<h4>{selected.ndcg20?.toFixed(4) ?? '0.0000'}</h4>
					</div>
					<div class="metric-card" data-hint="Mean Reciprocal Rank of first hit.">
						<p>MRR</p>
						<h4>{selected.mrr.toFixed(4)}</h4>
					</div>
					<div class="metric-card" data-hint="Precision at R (number of relevant docs).">
						<p>R-Precision</p>
						<h4>{selected.rPrecision.toFixed(4)}</h4>
					</div>
				</div>

				<div class="section">
					<h3>Run Info</h3>
					<div class="grid">
						<div><strong>Repo:</strong> {selected.repo}</div>
						<div><strong>Run ID:</strong> {selected.runId}</div>
						<div><strong>Last Commit:</strong> {selected.lastCommit}</div>
						<div><strong>Topics Evaluated:</strong> {selected.topicsEvaluated}</div>
					</div>
				</div>

				<div class="section">
					<h3>Precision</h3>
					<div class="grid">
						<div><span class="metric-label">P@5:</span> {selected.p5.toFixed(4)}</div>
						<div><span class="metric-label">P@10:</span> {selected.p10.toFixed(4)}</div>
						<div><span class="metric-label">P@20:</span> {selected.p20.toFixed(4)}</div>
						<div><span class="metric-label">P@100:</span> {selected.p100.toFixed(4)}</div>
					</div>
				</div>

				<div class="section">
					<h3>Recall</h3>
					<div class="grid">
						<div><span class="metric-label">Recall@20:</span> {selected.recall20.toFixed(4)}</div>
						<div><span class="metric-label">Recall@100:</span> {selected.recall100.toFixed(4)}</div>
						<div><span class="metric-label">Total Recall:</span> {selected.totalRecall.toFixed(4)}</div>
					</div>
				</div>

				<div class="section">
					<h3>nDCG</h3>
					<div class="grid">
						<div><span class="metric-label">nDCG@5:</span> {selected.ndcg5.toFixed(4)}</div>
						<div><span class="metric-label">nDCG@10:</span> {selected.ndcg10.toFixed(4)}</div>
						<div><span class="metric-label">nDCG@20:</span> {selected.ndcg20.toFixed(4)}</div>
						<div><span class="metric-label">nDCG@100:</span> {selected.ndcg100.toFixed(4)}</div>
					</div>
				</div>

				<div class="section">
					<h3>Coverage</h3>
					<div class="grid">
						<div><span class="metric-label">Topics w/ Results:</span> {selected.topicsWithResults}</div>
						<div><span class="metric-label">Topics w/ Relevant:</span> {selected.topicsWithRelevant}</div>
						<div><span class="metric-label">Total Relevant Docs:</span> {selected.totalRelevantDocs}</div>
						<div><span class="metric-label">Total Retrieved Docs:</span> {selected.totalRetrievedDocs}</div>
						<div><span class="metric-label">Avg Docs/Topic:</span> {selected.avgDocsPerTopic.toFixed(2)}</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 1.5rem 1rem;
		background: #f8fafc;
	}

	.leaderboard-container {
		width: 100%;
		max-width: 1400px;
		background: #fff;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
		border: 1px solid rgba(15, 23, 42, 0.08);
		overflow-x: auto;
	}

	.header-section {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		gap: 1rem;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #0f172a;
		font-weight: 700;
	}

	.info-note-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.info-note {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 8px;
		padding: 0.875rem 1.25rem;
		color: #1e40af;
		font-size: 0.9375rem;
		flex: 1;
		min-width: 200px;
	}

	.guide-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: #6366f1;
		color: #fff;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		font-size: 0.9375rem;
		transition: background-color 0.2s, transform 0.1s;
		white-space: nowrap;
	}

	.guide-link:hover {
		background: #4f46e5;
		transform: translateY(-1px);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 600px;
	}

	th {
		text-align: center;
		padding: 0.75rem 0.875rem;
		font-weight: 600;
		color: #475569;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 0.875rem;
		border-bottom: 1px solid rgba(15, 23, 42, 0.06);
		font-size: 1rem;
		text-align: center;
	}

	.clickable {
		cursor: pointer;
	}

	tbody tr:hover {
		background: rgba(99, 102, 241, 0.04);
	}

	tbody tr.first-place {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 223, 0, 0.12) 100%);
		border-left: 3px solid #ffd700;
	}

	tbody tr.second-place {
		background: linear-gradient(135deg, rgba(192, 192, 192, 0.08) 0%, rgba(211, 211, 211, 0.12) 100%);
		border-left: 3px solid #c0c0c0;
	}

	tbody tr.third-place {
		background: linear-gradient(135deg, rgba(205, 127, 50, 0.08) 0%, rgba(184, 115, 51, 0.12) 100%);
		border-left: 3px solid #cd7f32;
	}

	tbody tr.first-place:hover {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 223, 0, 0.16) 100%);
	}

	tbody tr.second-place:hover {
		background: linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(211, 211, 211, 0.16) 100%);
	}

	tbody tr.third-place:hover {
		background: linear-gradient(135deg, rgba(205, 127, 50, 0.12) 0%, rgba(184, 115, 51, 0.16) 100%);
	}

	.crown {
		font-size: 1.4rem;
		line-height: 1;
		display: inline-block;
		vertical-align: middle;
	}

	.rank {
		font-weight: 600;
		color: #6366f1;
		text-align: center;
		width: 70px;
	}

	.team {
		font-weight: 500;
		color: #0f172a;
	}

	.team-name {
		font-weight: 600;
	}

	.score {
		font-weight: 600;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.45);
		z-index: 999;
		animation: fadeIn 120ms ease-out;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
		max-width: 900px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		padding: 1.5rem;
		z-index: 1000;
		animation: modalIn 160ms ease-out;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.subtitle {
		margin: 0.35rem 0 0 0;
		color: #64748b;
		font-size: 0.95rem;
	}

	.modal-body h3 {
		margin: 1rem 0 0.5rem 0;
	}

	.section {
		margin-bottom: 1rem;
		padding: 0.75rem 0;
		border-top: 1px solid #e2e8f0;
	}

	.metric-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.metric-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 0.75rem;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
		position: relative;
		overflow: visible;
	}

	.metric-card p {
		margin: 0 0 0.35rem 0;
		color: #64748b;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.metric-card h4 {
		margin: 0;
		font-size: 1.2rem;
		color: #0f172a;
		transition: color 120ms ease;
	}

	.metric-card::after {
		content: attr(data-hint);
		position: absolute;
		right: 0;
		top: 0;
		transform: translate(6px, -110%);
		background: rgba(15, 23, 42, 0.92);
		color: #e2e8f0;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		font-size: 0.9rem;
		line-height: 1.3;
		opacity: 0;
		pointer-events: none;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.3);
		transition: opacity 140ms ease, transform 140ms ease;
		white-space: normal;
		max-width: 220px;
		text-align: center;
	}

	.metric-card:hover::after {
		opacity: 1;
		transform: translate(6px, -122%);
	}

	.metric-card:hover h4 {
		color: #0f172a;
	}

	.metric-label {
		font-weight: 700;
		color: #0f172a;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.5rem 1rem;
		margin-bottom: 0.5rem;
	}

	.close {
		background: transparent;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes modalIn {
		from {
			opacity: 0;
			transform: translate(-50%, -48%) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>



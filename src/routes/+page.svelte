<script lang="ts">
	type Student = {
		id: number;
		name: string;
		team: string;
		map: number;
		p5: number;
		lastCommit: string;
	};

	let { data } = $props<{ data: { students: Student[] } }>();

	const leaderboard = [...data.students]
		.sort((a, b) => b.map - a.map)
		.map((student, index) => ({ ...student, rank: index + 1 }));
</script>

<svelte:head>
	<title>CS7IS3 Leaderboard</title>
</svelte:head>

<main class="page">
	<div class="leaderboard-container">
		<div class="header-section">
			<h1>CS7IS3 Search Engine Leaderboard</h1>
			<div class="buttons-grid">
				<a href="/guide" class="guide-link">📖 Student Guide</a>
				<a href="/final-grades" class="guide-link secondary">🎓 Final Grades Instructions</a>
				<a href="/final-grades/grades" class="guide-link final-grades-btn">🏆 Final Grades</a>
			</div>
		</div>
		<table>
			<thead>
				<tr>
					<th>Rank</th>
					<th>Team</th>
					<th>Members</th>
					<th>MAP</th>
					<th>P@5</th>
					<th>Last Commit</th>
				</tr>
			</thead>
			<tbody>
				{#each leaderboard as student (student.id)}
					<tr 
						class:first-place={student.rank === 1}
						class:second-place={student.rank === 2}
						class:third-place={student.rank === 3}
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
						<td class="name">{student.name}</td>
						<td class="score">{student.map.toFixed(2)}</td>
						<td class="score">{student.p5.toFixed(2)}</td>
						<td class="commit">{student.lastCommit}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 1.5rem 1rem;
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
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.buttons-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		width: 100%;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #0f172a;
		font-weight: 700;
		text-align: center;
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

	.guide-link.secondary {
		background: #0ea5e9;
	}

	.guide-link.final-grades-btn {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		padding: 0.875rem 1.75rem;
		font-size: 1.125rem;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
		border: 2px solid rgba(255, 255, 255, 0.2);
		justify-content: center;
	}

	.guide-link.final-grades-btn:hover {
		background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
	}

	.guide-link:hover {
		background: #4f46e5;
		transform: translateY(-1px);
	}

	.guide-link:active {
		transform: translateY(0);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 600px;
	}

	thead {
		border-bottom: 2px solid rgba(15, 23, 42, 0.1);
	}

	th {
		text-align: center;
		padding: 0.75rem 0.875rem;
		font-weight: 600;
		color: #475569;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	td {
		padding: 0.875rem;
		border-bottom: 1px solid rgba(15, 23, 42, 0.06);
		font-size: 1rem;
		text-align: center;
	}

	tbody tr:hover {
		background: rgba(99, 102, 241, 0.04);
	}

	tbody tr.first-place {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 223, 0, 0.12) 100%);
		border-left: 3px solid #ffd700;
	}

	tbody tr.first-place:hover {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 223, 0, 0.16) 100%);
	}

	tbody tr.second-place {
		background: linear-gradient(135deg, rgba(192, 192, 192, 0.08) 0%, rgba(211, 211, 211, 0.12) 100%);
		border-left: 3px solid #c0c0c0;
	}

	tbody tr.second-place:hover {
		background: linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(211, 211, 211, 0.16) 100%);
	}

	tbody tr.third-place {
		background: linear-gradient(135deg, rgba(205, 127, 50, 0.08) 0%, rgba(184, 115, 51, 0.12) 100%);
		border-left: 3px solid #cd7f32;
	}

	tbody tr.third-place:hover {
		background: linear-gradient(135deg, rgba(205, 127, 50, 0.12) 0%, rgba(184, 115, 51, 0.16) 100%);
	}

	tbody tr.first-place td,
	tbody tr.second-place td,
	tbody tr.third-place td {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.crown {
		font-size: 1.5rem;
		line-height: 1;
		animation: bounce 2s infinite;
		display: inline-block;
		vertical-align: middle;
	}

	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}

	.team-name {
		display: inline-block;
		vertical-align: middle;
	}

	tbody tr.first-place .rank {
		font-weight: 700;
		color: #ffd700;
	}

	tbody tr.second-place .rank {
		font-weight: 700;
		color: #c0c0c0;
	}

	tbody tr.third-place .rank {
		font-weight: 700;
		color: #cd7f32;
	}

	tbody tr.first-place .score,
	tbody tr.second-place .score,
	tbody tr.third-place .score {
		font-weight: 700;
	}

	.rank {
		font-weight: 600;
		color: #6366f1;
		text-align: center;
		width: 60px;
		font-size: 1rem;
	}

	.team {
		font-weight: 500;
		color: #0f172a;
		font-size: 1rem;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
	}

	.name {
		font-weight: 500;
		color: #64748b;
		font-size: 1rem;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
	}

	.score {
		font-weight: 600;
		font-size: 1.0625rem;
		color: #0f172a;
		text-align: center;
		white-space: nowrap;
	}

	.commit {
		color: #64748b;
		font-size: 0.9375rem;
		white-space: nowrap;
		text-align: center;
	}

	/* Tablet */
	@media (min-width: 768px) {
		.page {
			padding: 2rem 1.5rem;
		}

		.leaderboard-container {
			padding: 2rem;
		}

		.header-section {
			margin-bottom: 2rem;
		}

		h1 {
			font-size: 2rem;
		}

		th {
			padding: 1rem;
			font-size: 0.8125rem;
		}

		td {
			padding: 1rem;
			font-size: 1.0625rem;
		}

		.rank {
			font-size: 1.0625rem;
		}

		.score {
			font-size: 1.125rem;
		}

		tbody tr.first-place td,
		tbody tr.second-place td,
		tbody tr.third-place td {
			font-size: 1.125rem;
		}

		tbody tr.first-place .crown {
			font-size: 1.75rem;
		}
	}

	/* Desktop */
	@media (min-width: 1024px) {
		.leaderboard-container {
			padding: 2.5rem;
		}

		.header-section {
			margin-bottom: 2rem;
		}

		h1 {
			font-size: 2.25rem;
		}

		th {
			padding: 1.125rem 1.25rem;
			font-size: 0.875rem;
		}

		td {
			padding: 1.125rem 1.25rem;
			font-size: 1.0625rem;
		}

		.score {
			font-size: 1.125rem;
		}

		tbody tr.first-place td,
		tbody tr.second-place td,
		tbody tr.third-place td {
			font-size: 1.125rem;
		}

		tbody tr.first-place .crown {
			font-size: 2rem;
		}
	}

	/* Mobile - make table scrollable */
	@media (max-width: 767px) {
		.leaderboard-container {
			padding: 1rem;
			overflow-x: auto;
		}

		.header-section {
			margin-bottom: 1.25rem;
		}

		h1 {
			font-size: 1.5rem;
			text-align: center;
		}

		.buttons-grid {
			grid-template-columns: 1fr;
		}

		.guide-link {
			width: 100%;
			justify-content: center;
		}

		.guide-link.final-grades-btn {
			font-size: 1rem;
			padding: 0.75rem 1.5rem;
		}

		th,
		td {
			padding: 0.625rem 0.5rem;
			font-size: 0.9375rem;
		}

		th {
			font-size: 0.75rem;
		}

		.rank {
			width: 50px;
			font-size: 0.9375rem;
		}

		.team {
			max-width: 120px;
		}

		.name {
			max-width: 150px;
		}

		.score {
			font-size: 1rem;
		}

		.commit {
			font-size: 0.875rem;
		}

		tbody tr.first-place td,
		tbody tr.second-place td,
		tbody tr.third-place td {
			font-size: 0.9375rem;
		}

		tbody tr.first-place .crown {
			font-size: 1.375rem;
		}
	}
</style>

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
		<h1>CS7IS3 Search Engine Leaderboard</h1>
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
					<tr>
						<td class="rank">#{student.rank}</td>
						<td class="team">{student.team}</td>
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

	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.75rem;
		text-align: center;
		color: #0f172a;
		font-weight: 700;
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
		text-align: left;
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
		font-size: 0.875rem;
	}

	tbody tr:hover {
		background: rgba(99, 102, 241, 0.04);
	}

	.rank {
		font-weight: 600;
		color: #6366f1;
		text-align: center;
		width: 60px;
		font-size: 0.875rem;
	}

	.team {
		font-weight: 500;
		color: #64748b;
		font-size: 0.875rem;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		font-weight: 500;
		color: #0f172a;
		font-size: 0.875rem;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.score {
		font-weight: 600;
		font-size: 0.9375rem;
		color: #0f172a;
		text-align: right;
		white-space: nowrap;
	}

	.commit {
		color: #64748b;
		font-size: 0.8125rem;
		white-space: nowrap;
	}

	/* Tablet */
	@media (min-width: 768px) {
		.page {
			padding: 2rem 1.5rem;
		}

		.leaderboard-container {
			padding: 2rem;
		}

		h1 {
			font-size: 2rem;
			margin-bottom: 2rem;
		}

		th {
			padding: 1rem;
			font-size: 0.8125rem;
		}

		td {
			padding: 1rem;
			font-size: 0.9375rem;
		}

		.rank {
			font-size: 0.9375rem;
		}

		.score {
			font-size: 1rem;
		}
	}

	/* Desktop */
	@media (min-width: 1024px) {
		.leaderboard-container {
			padding: 2.5rem;
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
			font-size: 1rem;
		}

		.score {
			font-size: 1.0625rem;
		}
	}

	/* Mobile - make table scrollable */
	@media (max-width: 767px) {
		.leaderboard-container {
			padding: 1rem;
			overflow-x: auto;
		}

		h1 {
			font-size: 1.5rem;
			margin-bottom: 1.25rem;
		}

		th,
		td {
			padding: 0.625rem 0.5rem;
			font-size: 0.8125rem;
		}

		th {
			font-size: 0.75rem;
		}

		.rank {
			width: 50px;
			font-size: 0.8125rem;
		}

		.team {
			max-width: 120px;
		}

		.name {
			max-width: 150px;
		}

		.score {
			font-size: 0.875rem;
		}

		.commit {
			font-size: 0.75rem;
		}
	}
</style>

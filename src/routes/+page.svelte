<script lang="ts">
	type Student = {
		id: number;
		name: string;
		team: string;
		map: number;
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
					<th>Student</th>
					<th>MAP Score</th>
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
		padding: 3rem 1.5rem;
	}

	.leaderboard-container {
		width: 100%;
		max-width: 1200px;
		background: #fff;
		border-radius: 16px;
		padding: 3rem;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
		border: 1px solid rgba(15, 23, 42, 0.08);
	}

	h1 {
		margin: 0 0 2.5rem;
		font-size: 2.5rem;
		text-align: center;
		color: #0f172a;
		font-weight: 700;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		border-bottom: 2px solid rgba(15, 23, 42, 0.1);
	}

	th {
		text-align: left;
		padding: 1.25rem 1.5rem;
		font-weight: 600;
		color: #475569;
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 1.5rem 1.5rem;
		border-bottom: 1px solid rgba(15, 23, 42, 0.06);
		font-size: 1.1rem;
	}

	tbody tr:hover {
		background: rgba(99, 102, 241, 0.04);
	}

	.rank {
		font-weight: 600;
		color: #6366f1;
		text-align: center;
		width: 80px;
		font-size: 1.2rem;
	}

	.team {
		font-weight: 500;
		color: #64748b;
		font-size: 1.1rem;
	}

	.name {
		font-weight: 600;
		color: #0f172a;
		font-size: 1.15rem;
	}

	.score {
		font-weight: 600;
		font-size: 1.4rem;
		color: #0f172a;
	}

	.commit {
		color: #64748b;
		font-size: 1rem;
	}

	@media (max-width: 640px) {
		.page {
			padding: 1.5rem 1rem;
		}

		.leaderboard-container {
			padding: 1.5rem;
		}

		h1 {
			font-size: 1.75rem;
			margin-bottom: 1.5rem;
		}

		th,
		td {
			padding: 0.75rem 0.5rem;
			font-size: 0.9rem;
		}

		th {
			font-size: 0.85rem;
		}

		.score {
			font-size: 1.1rem;
		}
	}
</style>

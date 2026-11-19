<script lang="ts">
	let { data } = $props();
	const members = $derived(data.teams.reduce((n, t) => n + t.team_members.length, 0));
	const fmt = (iso: string) =>
		new Date(iso).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Dublin' });
</script>

<svelte:head>
	<title>Teams (instructor) - CS7IS3</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="page">
	<div class="card">
		<div class="head">
			<div>
				<h1>Registered teams</h1>
				<p class="muted">{data.teams.length} teams, {members} students</p>
			</div>
			<a class="button" href="/admin/teams.csv" download>Download CSV</a>
		</div>

		{#if data.error}
			<div class="error" role="alert">{data.error}</div>
		{:else if data.teams.length === 0}
			<p class="muted">No teams yet. Share <a href="/register">/register</a> with the class.</p>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr><th>Team</th><th>Members</th><th>Status</th><th>Registered</th></tr>
					</thead>
					<tbody>
						{#each data.teams as team (team.id)}
							<tr>
								<td>
									<strong>{team.name}</strong>
									<div class="muted small">2026-team-{team.slug}</div>
								</td>
								<td>
									{#each team.team_members as m (m.tcd_email)}
										<div>{m.full_name} <span class="muted small">· {m.tcd_email} · @{m.github_username}</span></div>
									{/each}
								</td>
								<td>
									<span class="status {team.status}">{team.status}</span>
									{#if team.repo}<div class="small"><a href={`https://github.com/${team.repo}`}>{team.repo}</a></div>{/if}
									{#if team.status_detail}<div class="muted small">{team.status_detail}</div>{/if}
								</td>
								<td class="small">{fmt(team.created_at)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</main>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		justify-content: center;
		padding: 1.5rem 1rem;
	}
	.card {
		width: 100%;
		max-width: 1100px;
		background: #fff;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid rgba(15, 23, 42, 0.08);
		align-self: flex-start;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}
	h1 {
		margin: 0;
		font-size: 1.5rem;
	}
	.muted {
		color: #64748b;
	}
	.small {
		font-size: 0.82rem;
	}
	.button {
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		padding: 0.45rem 0.9rem;
		font-size: 0.9rem;
	}
	.table-wrap {
		overflow-x: auto;
		margin-top: 1rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.92rem;
	}
	th {
		text-align: left;
		font-weight: 600;
		color: #475569;
		border-bottom: 1px solid #cbd5e1;
		padding: 0.5rem;
	}
	td {
		border-bottom: 1px solid #f1f5f9;
		padding: 0.6rem 0.5rem;
		vertical-align: top;
	}
	.status {
		font-size: 0.78rem;
		padding: 0.1rem 0.5rem;
		border-radius: 6px;
		background: #f1f5f9;
		color: #334155;
	}
	.status.created {
		background: #dcfce7;
		color: #14532d;
	}
	.status.error {
		background: #fee2e2;
		color: #991b1b;
	}
	.error {
		background: #fef2f2;
		color: #991b1b;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-top: 1rem;
	}
	a {
		color: #4f46e5;
	}
</style>

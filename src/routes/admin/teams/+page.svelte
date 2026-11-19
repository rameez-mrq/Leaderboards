<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let working = $state(false);
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
			<div class="actions">
				{#if data.appConfigured}
					<form
						method="POST"
						action="?/provision"
						use:enhance={() => {
							working = true;
							return async ({ update }) => {
								await update();
								working = false;
							};
						}}
					>
						<button class="button primary" disabled={working}>
							{working ? 'Creating…' : 'Create missing repositories'}
						</button>
					</form>
				{/if}
				<a class="button" href="/admin/teams.csv" download>Download CSV</a>
			</div>
		</div>

		{#if form?.message}
			<div class="notice" role="status">
				{form.message}
				{#each (form.provisioned ?? []).filter((r) => !r.ok) as r (r.teamId)}
					<div class="small">⚠ {r.detail}</div>
				{/each}
			</div>
		{/if}
		{#if !data.appConfigured}
			<p class="muted small">
				Repositories aren't created automatically yet: add the GitHub App settings in Vercel
				(<code>GRADER_APP_ID</code>, <code>GRADER_APP_PRIVATE_KEY</code>).
			</p>
		{/if}

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
	.actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.button.primary {
		background: #4f46e5;
		color: #fff;
		border-color: #4f46e5;
		font: inherit;
		cursor: pointer;
	}
	.button.primary:disabled {
		opacity: 0.7;
		cursor: progress;
	}
	.notice {
		background: #eef2ff;
		color: #312e81;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-top: 1rem;
	}
	code {
		background: rgba(15, 23, 42, 0.06);
		padding: 0.1rem 0.3rem;
		border-radius: 4px;
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

<script lang="ts">
	import { enhance } from '$app/forms';

	type Member = { full_name: string; tcd_email: string; github_username: string };
	let { data, form } = $props();

	const blank = (): Member => ({ full_name: '', tcd_email: '', github_username: '' });

	// Restore what was typed after a failed submit; otherwise start with no size chosen.
	const previous = form as { team?: string; size?: number; members?: Member[] } | null;
	let team = $state(previous?.team ?? '');
	let size = $state<number | null>(previous?.size ?? null);
	let members = $state<Member[]>(previous?.members ?? []);
	let submitting = $state(false);

	const sizes = $derived(Array.from({ length: data.max - data.min + 1 }, (_, i) => data.min + i));

	// Show exactly `size` member sections, keeping anything already typed.
	function chooseSize(n: number) {
		size = n;
		while (members.length < n) members.push(blank());
		members.length = n;
	}

	const deadlineText = $derived(
		data.deadline
			? new Date(data.deadline).toLocaleString('en-IE', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Dublin' })
			: null
	);

	const fieldError = (name: string) => form?.field === name;
</script>

<svelte:head>
	<title>Register your team - CS7IS3</title>
</svelte:head>

<main class="page">
	<div class="card">
		<a href="/" class="back">← Back to leaderboard</a>
		<h1>Register your team</h1>

		{#if form?.success}
			<div class="success" role="status">
				<h2>Team "{form.team}" is registered</h2>
				<p>Your team's private repository, <code>2026-team-{form.slug}</code>, will be created from the starter pack and each member will get a GitHub invitation by email.</p>
				<ol>
					<li>Accept the invitation from <strong>ca-assignments</strong> when it arrives (check GitHub notifications too).</li>
					<li>Clone your repository and read its README.</li>
					<li>Push to <code>main</code>; your score appears on the <a href="/">leaderboard</a>.</li>
				</ol>
				<p class="muted">Made a mistake? Contact the course team rather than registering again.</p>
			</div>
		{:else if !data.open}
			<div class="notice" role="status">
				<p><strong>Registration is closed.</strong> Contact the course team if your team still needs to register.</p>
			</div>
		{:else}
			<p class="intro">
				One person registers the whole team. Each team gets a private GitHub repository for the assignment.
				Teams have {data.min === data.max ? `exactly ${data.min}` : `${data.min}–${data.max}`} members.
				{#if deadlineText}Registration closes {deadlineText}.{/if}
			</p>

			{#if form?.error}
				<div class="error" role="alert">{form.error}</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				<label class="field">
					<span>Team name</span>
					<input
						name="team"
						bind:value={team}
						required
						minlength="3"
						maxlength="40"
						placeholder="Recall Crew"
						aria-invalid={fieldError('team')}
					/>
					<small>Shown on the leaderboard. Letters, numbers and spaces.</small>
				</label>

				<label class="field">
					<span>Number of team members</span>
					<select
						name="team_size"
						required
						value={size ?? ''}
						onchange={(e) => chooseSize(Number(e.currentTarget.value))}
						aria-invalid={fieldError('size')}
					>
						<option value="" disabled>Choose…</option>
						{#each sizes as n (n)}
							<option value={n}>{n}</option>
						{/each}
					</select>
				</label>

				{#if size}
				<fieldset class:invalid={fieldError('members')}>
					<legend>Members</legend>
					{#each members as member, i (i)}
						<div class="member">
							<div class="member-head">
								<span>Member {i + 1}{i === 0 ? ' (you)' : ''}</span>
							</div>
							<div class="grid">
								<label class="field">
									<span>Full name</span>
									<input name="full_name" bind:value={member.full_name} required autocomplete="name"
										aria-invalid={fieldError(`member-${i}-full_name`)} />
								</label>
								<label class="field">
									<span>Trinity email</span>
									<input name="tcd_email" type="email" bind:value={member.tcd_email} required
										placeholder={`name@${data.domain}`} aria-invalid={fieldError(`member-${i}-tcd_email`)} />
								</label>
								<label class="field">
									<span>GitHub username</span>
									<input name="github_username" bind:value={member.github_username} required
										autocapitalize="off" spellcheck="false" placeholder="octocat"
										aria-invalid={fieldError(`member-${i}-github_username`)} />
								</label>
							</div>
						</div>
					{/each}
				</fieldset>

				<label class="consent" class:invalid={fieldError('consent')}>
					<input type="checkbox" name="consent" required />
					<span>
						I confirm every member agreed to register. Names, Trinity emails and GitHub usernames are
						stored for running this module only, and team names appear on the public leaderboard.
					</span>
				</label>

				<button type="submit" class="primary" disabled={submitting}>
					{submitting ? 'Registering…' : 'Register team'}
				</button>
				{/if}
			</form>

			<p class="muted help">
				No GitHub account yet? <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer">Create one</a>
				first; any account works.
			</p>
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
		max-width: 760px;
		background: #fff;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid rgba(15, 23, 42, 0.08);
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
		align-self: flex-start;
	}
	.back {
		font-size: 0.9rem;
		color: #4f46e5;
	}
	h1 {
		margin: 0.5rem 0 0.25rem;
		font-size: 1.6rem;
	}
	h2 {
		margin: 0 0 0.5rem;
		font-size: 1.2rem;
	}
	.intro,
	.muted {
		color: #475569;
	}
	.muted {
		font-size: 0.9rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin-top: 1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.9rem;
		font-weight: 500;
	}
	.field small {
		color: #64748b;
		font-weight: 400;
	}
	input:not([type='checkbox']),
	select {
		font: inherit;
		font-weight: 400;
		padding: 0.55rem 0.7rem;
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		width: 100%;
	}
	input:focus,
	select:focus {
		outline: 2px solid #6366f1;
		outline-offset: 1px;
	}
	input[aria-invalid='true'],
	select[aria-invalid='true'] {
		border-color: #dc2626;
	}
	fieldset {
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	fieldset.invalid {
		border-color: #dc2626;
	}
	legend {
		font-weight: 600;
		padding: 0 0.3rem;
	}
	.member + .member {
		border-top: 1px solid #f1f5f9;
		padding-top: 1rem;
	}
	.member-head {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: #475569;
		margin-bottom: 0.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}
	.consent {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		font-size: 0.9rem;
		color: #334155;
	}
	.consent.invalid {
		color: #dc2626;
	}
	.consent input {
		margin-top: 0.2rem;
	}
	button {
		font: inherit;
		cursor: pointer;
		border-radius: 8px;
	}
	.primary {
		background: #4f46e5;
		color: #fff;
		border: none;
		padding: 0.7rem 1.2rem;
		font-weight: 600;
		align-self: flex-start;
	}
	.primary:disabled {
		opacity: 0.7;
		cursor: progress;
	}
	.error {
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-top: 1rem;
	}
	.success {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		color: #14532d;
		padding: 1rem 1.25rem;
		border-radius: 10px;
		margin-top: 1rem;
	}
	.notice {
		background: #fffbeb;
		border: 1px solid #fde68a;
		color: #78350f;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-top: 1rem;
	}
	code {
		background: rgba(15, 23, 42, 0.06);
		padding: 0.1rem 0.3rem;
		border-radius: 4px;
	}
	.help {
		margin-top: 1rem;
	}
	@media (max-width: 480px) {
		.card {
			padding: 1rem;
		}
	}
</style>

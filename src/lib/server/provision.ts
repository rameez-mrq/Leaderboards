import { supabaseAdmin } from '$lib/server/supabase';
import { GitHubError, github, githubAppConfigured, githubSettings } from '$lib/server/github';

type TeamWithMembers = {
	id: string;
	name: string;
	slug: string;
	repo: string | null;
	status: string;
	team_members: { github_username: string }[];
};

export type ProvisionResult = { teamId: string; ok: boolean; repo?: string; detail: string };

async function setStatus(id: string, status: string, detail: string | null, repo?: string) {
	await supabaseAdmin
		.from('teams')
		.update({ status, status_detail: detail, ...(repo ? { repo } : {}) })
		.eq('id', id);
}

/**
 * Creates the team's private repository from the starter pack (if it doesn't
 * exist yet) and invites every member with write access. Safe to run again.
 */
export async function provisionTeam(teamId: string): Promise<ProvisionResult> {
	if (!githubAppConfigured()) {
		return { teamId, ok: false, detail: 'GitHub App not configured; repository will be created later' };
	}
	const { data: team, error } = await supabaseAdmin
		.from('teams')
		.select('id, name, slug, repo, status, team_members(github_username)')
		.eq('id', teamId)
		.single<TeamWithMembers>();
	if (error || !team) return { teamId, ok: false, detail: 'Team not found' };

	const { org, templateRepo, teamPrefix } = githubSettings();
	const name = `${teamPrefix}${team.slug}`;
	const full = `${org}/${name}`;
	await setStatus(team.id, 'creating', null);

	try {
		try {
			await github('POST', `/repos/${templateRepo}/generate`, {
				owner: org,
				name,
				private: true,
				description: `CS7IS3 Assignment 2: ${team.name}`,
				include_all_branches: false
			});
		} catch (e) {
			// 422 = a repository with this name already exists: reuse it.
			if (!(e instanceof GitHubError && e.status === 422)) throw e;
		}

		const failed: string[] = [];
		for (const m of team.team_members) {
			try {
				await github('PUT', `/repos/${full}/collaborators/${encodeURIComponent(m.github_username)}`, {
					permission: 'push'
				});
			} catch (e) {
				console.error('Invite failed', full, m.github_username, e);
				failed.push(m.github_username);
			}
		}

		if (failed.length) {
			const detail = `Repository created, but inviting ${failed.join(', ')} failed`;
			await setStatus(team.id, 'error', detail, full);
			return { teamId, ok: false, repo: full, detail };
		}
		await setStatus(team.id, 'created', `Invited ${team.team_members.length} members`, full);
		return { teamId, ok: true, repo: full, detail: 'created' };
	} catch (e) {
		const detail = e instanceof Error ? e.message.slice(0, 300) : 'Unknown error';
		console.error('Provisioning failed', full, e);
		await setStatus(team.id, 'error', detail);
		return { teamId, ok: false, detail };
	}
}

/** Provisions every team that doesn't have a working repository yet. */
export async function provisionPending(): Promise<ProvisionResult[]> {
	const { data } = await supabaseAdmin
		.from('teams')
		.select('id')
		.in('status', ['registered', 'error', 'creating'])
		.order('created_at', { ascending: true });
	const results: ProvisionResult[] = [];
	for (const row of data ?? []) {
		results.push(await provisionTeam(row.id));
	}
	return results;
}

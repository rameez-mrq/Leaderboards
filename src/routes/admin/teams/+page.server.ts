import type { Actions, PageServerLoad } from './$types';
import { listTeams } from '$lib/server/teams';
import { githubAppConfigured } from '$lib/server/github';
import { provisionPending } from '$lib/server/provision';

export const load: PageServerLoad = async () => {
	const appConfigured = githubAppConfigured();
	try {
		return { teams: await listTeams(), error: null, appConfigured };
	} catch {
		return { teams: [], error: 'Could not load teams. Check that supabase/setup.sql has been run.', appConfigured };
	}
};

export const actions: Actions = {
	// Protected by the /admin Basic-auth check in hooks.server.ts.
	provision: async () => {
		if (!githubAppConfigured()) {
			return { provisioned: [], message: 'The GitHub App is not configured in Vercel yet.' };
		}
		const results = await provisionPending();
		const ok = results.filter((r) => r.ok).length;
		return {
			provisioned: results,
			message: results.length
				? `Created ${ok} of ${results.length} repositories.`
				: 'Every team already has a repository.'
		};
	}
};

import type { PageServerLoad } from './$types';
import { listTeams } from '$lib/server/teams';

export const load: PageServerLoad = async () => {
	try {
		return { teams: await listTeams(), error: null };
	} catch {
		return { teams: [], error: 'Could not load teams. Check that supabase/teams.sql has been run.' };
	}
};

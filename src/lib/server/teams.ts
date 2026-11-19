import { supabaseAdmin } from '$lib/server/supabase';

export type TeamRow = {
	id: string;
	name: string;
	slug: string;
	repo: string | null;
	status: string;
	status_detail: string | null;
	created_at: string;
	team_members: { full_name: string; tcd_email: string; github_username: string }[];
};

export async function listTeams(): Promise<TeamRow[]> {
	const { data, error } = await supabaseAdmin
		.from('teams')
		.select('id, name, slug, repo, status, status_detail, created_at, team_members(full_name, tcd_email, github_username)')
		.order('created_at', { ascending: true });
	if (error) {
		console.error('Failed to list teams', error);
		throw new Error('Could not load teams');
	}
	return (data ?? []) as TeamRow[];
}

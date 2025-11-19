import type { PageServerLoad } from './$types';
import { supabaseServerClient } from '$lib/server/supabase';

type LeaderboardRow = {
	student_id: string | null;
	student_name: string | null;
	team: string | null;
	map_score: number | null;
	last_commit: string | null;
};

export const load: PageServerLoad = async () => {
	const { data, error } = await supabaseServerClient
		.from('leaderboard')
		.select('*')
		.order('map_score', { ascending: false });

	if (error) {
		console.error('Failed to fetch leaderboard from Supabase', error);
		return { students: [] };
	}

	const rows: LeaderboardRow[] = (data as LeaderboardRow[] | null) ?? [];

	const students = rows.map((entry, index) => ({
		id: entry.student_id ?? index + 1,
		name: entry.student_name ?? entry.student_id ?? `Student ${index + 1}`,
		team: entry.team ?? 'Unassigned',
		map: entry.map_score ?? 0,
		lastCommit: entry.last_commit ?? '—'
	}));

	return { students };
};


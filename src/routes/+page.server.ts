import type { PageServerLoad } from './$types';
import { supabaseServerClient } from '$lib/server/supabase';

type LeaderboardRow = {
	student_id: string | null;
	student_name: string | null;
	team: string | null;
	map_score: number | null;
	last_commit: string | null;
};

const formatRelativeTime = (isoString: string | null) => {
	if (!isoString) return '—';

	const timestamp = Date.parse(isoString);
	if (Number.isNaN(timestamp)) {
		return isoString;
	}

	const diffMs = Date.now() - timestamp;
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) return 'Just now';
	if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
		lastCommit: formatRelativeTime(entry.last_commit)
	}));

	return { students };
};


import type { RequestHandler } from './$types';
import { listTeams } from '$lib/server/teams';

const cell = (v: unknown) => {
	const s = String(v ?? '');
	return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET: RequestHandler = async () => {
	let teams;
	try {
		teams = await listTeams();
	} catch {
		return new Response('Could not load teams. Check that supabase/teams.sql has been run.\n', {
			status: 503,
			headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
		});
	}
	const rows = [['team', 'slug', 'status', 'repo', 'registered_at', 'full_name', 'tcd_email', 'github_username']];
	for (const t of teams) {
		for (const m of t.team_members) {
			rows.push([t.name, t.slug, t.status, t.repo ?? '', t.created_at, m.full_name, m.tcd_email, m.github_username]);
		}
	}
	return new Response(rows.map((r) => r.map(cell).join(',')).join('\n') + '\n', {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="cs7is3-teams.csv"',
			'Cache-Control': 'private, no-store'
		}
	});
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { supabaseAdmin } from '$lib/server/supabase';
import { LEADERBOARD_API_TOKEN } from '$env/static/private';

const payloadSchema = z.object({
	student_id: z.string().min(1),
	student_name: z.string().optional(),
	team: z.string().optional(),
	map: z.union([z.number(), z.string()]),
	p5: z.union([z.number(), z.string()]).optional(),
	p20: z.union([z.number(), z.string()]).optional(),
	ndcg: z.union([z.number(), z.string()]).optional(),
	run_id: z.string().optional(),
	repo: z.string().optional(),
	last_commit: z.string().optional()
});

const parseMetric = (value: number | string | undefined) => {
	if (value === undefined) return undefined;
	const parsed = typeof value === 'string' ? parseFloat(value) : value;
	return Number.isFinite(parsed) ? parsed : undefined;
};

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	if (authHeader !== `Bearer ${LEADERBOARD_API_TOKEN}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let payload;
	try {
		payload = payloadSchema.parse(await request.json());
	} catch (error) {
		return json({ error: 'Invalid payload', details: error }, { status: 400 });
	}

	const map_score = parseMetric(payload.map);
	if (map_score === undefined) {
		return json({ error: 'Invalid map score' }, { status: 400 });
	}

	const { error } = await supabaseAdmin.from('final_grades').upsert(
		{
			student_id: payload.student_id,
			student_name: payload.student_name,
			team: payload.team,
			map_score,
			p5: parseMetric(payload.p5),
			p20: parseMetric(payload.p20),
			ndcg20: parseMetric(payload.ndcg),
			run_id: payload.run_id,
			repo: payload.repo,
			last_commit: payload.last_commit,
			updated_at: new Date().toISOString()
		},
		{
			onConflict: 'student_id'
		}
	);

	if (error) {
		console.error('Failed to write to Supabase', error);
		return json({ error: 'Database error' }, { status: 500 });
	}

	return json({ success: true });
};

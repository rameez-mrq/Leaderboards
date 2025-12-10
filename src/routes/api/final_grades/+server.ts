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
	p10: z.union([z.number(), z.string()]).optional(),
	p20: z.union([z.number(), z.string()]).optional(),
	p100: z.union([z.number(), z.string()]).optional(),
	recall20: z.union([z.number(), z.string()]).optional(),
	recall100: z.union([z.number(), z.string()]).optional(),
	total_recall: z.union([z.number(), z.string()]).optional(),
	mrr: z.union([z.number(), z.string()]).optional(),
	r_precision: z.union([z.number(), z.string()]).optional(),
	ndcg5: z.union([z.number(), z.string()]).optional(),
	ndcg10: z.union([z.number(), z.string()]).optional(),
	ndcg20: z.union([z.number(), z.string()]).optional(),
	ndcg100: z.union([z.number(), z.string()]).optional(),
	topics_evaluated: z.union([z.number(), z.string()]).optional(),
	topics_with_results: z.union([z.number(), z.string()]).optional(),
	topics_with_relevant: z.union([z.number(), z.string()]).optional(),
	total_relevant_docs: z.union([z.number(), z.string()]).optional(),
	total_retrieved_docs: z.union([z.number(), z.string()]).optional(),
	avg_docs_per_topic: z.union([z.number(), z.string()]).optional(),
	run_id: z.string().optional(),
	repo: z.string().optional(),
	last_commit: z.string().optional()
});

const parseMetric = (value: number | string | undefined) => {
	if (value === undefined) return undefined;
	const parsed = typeof value === 'string' ? parseFloat(value) : value;
	return Number.isFinite(parsed) ? parsed : undefined;
};

const parseInteger = (value: number | string | undefined) => {
	if (value === undefined) return undefined;
	const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
	return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
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
			p10: parseMetric(payload.p10),
			p20: parseMetric(payload.p20),
			p100: parseMetric(payload.p100),
			recall20: parseMetric(payload.recall20),
			recall100: parseMetric(payload.recall100),
			total_recall: parseMetric(payload.total_recall),
			mrr: parseMetric(payload.mrr),
			r_precision: parseMetric(payload.r_precision),
			ndcg5: parseMetric(payload.ndcg5),
			ndcg10: parseMetric(payload.ndcg10),
			ndcg20: parseMetric(payload.ndcg20),
			ndcg100: parseMetric(payload.ndcg100),
			topics_evaluated: parseInteger(payload.topics_evaluated),
			topics_with_results: parseInteger(payload.topics_with_results),
			topics_with_relevant: parseInteger(payload.topics_with_relevant),
			total_relevant_docs: parseInteger(payload.total_relevant_docs),
			total_retrieved_docs: parseInteger(payload.total_retrieved_docs),
			avg_docs_per_topic: parseMetric(payload.avg_docs_per_topic),
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


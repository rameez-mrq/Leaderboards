import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { supabaseAdmin } from '$lib/server/supabase';
import { authenticate } from '$lib/server/auth';

/** Accepts a number or numeric string; rejects NaN/Infinity/empty strings. */
const numeric = z.union([z.number(), z.string().trim().min(1)]).transform((v, ctx) => {
	const n = typeof v === 'string' ? Number(v) : v;
	if (!Number.isFinite(n)) {
		ctx.addIssue({ code: 'custom', message: 'Must be a finite number' });
		return z.NEVER;
	}
	return n;
});

/** IR metrics such as MAP, P@k, nDCG, recall, MRR live in [0, 1]. */
const score = numeric.pipe(z.number().min(0).max(1));
const count = numeric.pipe(z.number().int().min(0));
const nonNegative = numeric.pipe(z.number().min(0));

const text = (max = 200) => z.string().trim().max(max);

const baseFields = {
	student_id: text(100).min(1).optional(),
	student_name: text().optional(),
	team: text().optional(),
	map: score,
	run_id: text(100).optional(),
	repo: text().optional(),
	last_commit: text(100).optional()
};

export const leaderboardSchema = z.object({
	...baseFields,
	p5: score.optional(),
	p20: score.optional(),
	ndcg20: score.optional(),
	/** Old name for ndcg20, still accepted from older clients. */
	ndcg: score.optional()
});

export const finalGradesSchema = z.object({
	...baseFields,
	p5: score.optional(),
	p10: score.optional(),
	p20: score.optional(),
	p100: score.optional(),
	recall20: score.optional(),
	recall100: score.optional(),
	total_recall: score.optional(),
	mrr: score.optional(),
	r_precision: score.optional(),
	ndcg5: score.optional(),
	ndcg10: score.optional(),
	ndcg20: score.optional(),
	ndcg100: score.optional(),
	topics_evaluated: count.optional(),
	topics_with_results: count.optional(),
	topics_with_relevant: count.optional(),
	total_relevant_docs: count.optional(),
	total_retrieved_docs: count.optional(),
	avg_docs_per_topic: nonNegative.optional()
});

type Options<S extends z.ZodType> = {
	table: 'leaderboard' | 'final_grades';
	schema: S;
	/** Map the validated payload to DB columns (student_id is added for you). */
	toRow: (payload: z.output<S>) => Record<string, unknown>;
};

/**
 * Shared POST handler for score ingestion:
 * authenticate → validate → bind student_id to the caller → upsert.
 */
export function createIngestHandler<S extends z.ZodType<{ student_id?: string }>>(opts: Options<S>) {
	return async ({ request }: { request: Request }) => {
		const caller = await authenticate(request);
		if (!caller) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return json({ error: 'Body must be JSON' }, { status: 400 });
		}

		const parsed = opts.schema.safeParse(body);
		if (!parsed.success) {
			return json(
				{ error: 'Invalid payload', issues: z.flattenError(parsed.error).fieldErrors },
				{ status: 400 }
			);
		}
		const payload = parsed.data;

		// A team token can only ever write its own row, whatever the payload says.
		let studentId: string | undefined;
		if (caller.kind === 'team') {
			if (payload.student_id && payload.student_id !== caller.studentId) {
				return json({ error: 'Token is not valid for this student_id' }, { status: 403 });
			}
			studentId = caller.studentId;
		} else {
			studentId = payload.student_id;
		}
		if (!studentId) {
			return json({ error: 'student_id is required' }, { status: 400 });
		}

		const { error } = await supabaseAdmin.from(opts.table).upsert(
			{
				...opts.toRow(payload),
				student_id: studentId,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'student_id' }
		);

		if (error) {
			console.error(`Failed to write to Supabase table ${opts.table}`, error);
			return json({ error: 'Database error' }, { status: 500 });
		}

		return json({ success: true, student_id: studentId });
	};
}

import type { RequestHandler } from './$types';
import { createIngestHandler, leaderboardSchema } from '$lib/server/ingest';

export const POST: RequestHandler = createIngestHandler({
	table: 'leaderboard',
	schema: leaderboardSchema,
	toRow: (p) => ({
		student_name: p.student_name,
		team: p.team,
		map_score: p.map,
		p5: p.p5,
		p20: p.p20,
		ndcg20: p.ndcg20 ?? p.ndcg,
		run_id: p.run_id,
		repo: p.repo,
		last_commit: p.last_commit
	})
});

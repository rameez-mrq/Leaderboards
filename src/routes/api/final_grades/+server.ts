import type { RequestHandler } from './$types';
import { createIngestHandler, finalGradesSchema } from '$lib/server/ingest';

export const POST: RequestHandler = createIngestHandler({
	table: 'final_grades',
	schema: finalGradesSchema,
	toRow: ({ student_id: _id, map, ...rest }) => ({ ...rest, map_score: map })
});

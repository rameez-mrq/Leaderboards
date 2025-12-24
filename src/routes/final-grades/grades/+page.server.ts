import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

type FinalGradeRow = {
	student_id: string | null;
	student_name: string | null;
	team: string | null;
	map_score: number | null;
	p5: number | null;
	p10: number | null;
	p20: number | null;
	p100: number | null;
	recall20: number | null;
	recall100: number | null;
	total_recall: number | null;
	mrr: number | null;
	r_precision: number | null;
	ndcg5: number | null;
	ndcg10: number | null;
	ndcg20: number | null;
	ndcg100: number | null;
	topics_evaluated: number | null;
	topics_with_results: number | null;
	topics_with_relevant: number | null;
	total_relevant_docs: number | null;
	total_retrieved_docs: number | null;
	avg_docs_per_topic: number | null;
	run_id: string | null;
	repo: string | null;
	last_commit: string | null;
	updated_at?: string | null;
};

const formatRelativeTime = (isoString: string | null) => {
	if (!isoString) return '—';
	const timestamp = Date.parse(isoString);
	if (Number.isNaN(timestamp)) return isoString;
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
	const { data, error } = await supabaseAdmin
		.from('final_grades')
		.select('*')
		.order('map_score', { ascending: false });

	if (error) {
		console.error('Failed to fetch final_grades from Supabase', error);
		return { students: [] };
	}

	const rows: FinalGradeRow[] = (data as FinalGradeRow[] | null) ?? [];

	const students = rows.map((entry, index) => ({
		id: entry.student_id ?? `student-${index + 1}`,
		studentId: entry.student_id ?? '—',
		name: entry.student_name ?? entry.student_id ?? `Team ${index + 1}`,
		team: entry.team ?? 'Unassigned',
		map: entry.map_score ?? 0,
		p5: entry.p5 ?? 0,
		p10: entry.p10 ?? 0,
		p20: entry.p20 ?? 0,
		p100: entry.p100 ?? 0,
		recall20: entry.recall20 ?? 0,
		recall100: entry.recall100 ?? 0,
		totalRecall: entry.total_recall ?? 0,
		mrr: entry.mrr ?? 0,
		rPrecision: entry.r_precision ?? 0,
		ndcg5: entry.ndcg5 ?? 0,
		ndcg10: entry.ndcg10 ?? 0,
		ndcg20: entry.ndcg20 ?? 0,
		ndcg100: entry.ndcg100 ?? 0,
		topicsEvaluated: entry.topics_evaluated ?? 0,
		topicsWithResults: entry.topics_with_results ?? 0,
		topicsWithRelevant: entry.topics_with_relevant ?? 0,
		totalRelevantDocs: entry.total_relevant_docs ?? 0,
		totalRetrievedDocs: entry.total_retrieved_docs ?? 0,
		avgDocsPerTopic: entry.avg_docs_per_topic ?? 0,
		runId: entry.run_id ?? '—',
		repo: entry.repo ?? '—',
		lastCommit: formatRelativeTime(entry.last_commit ?? entry.updated_at ?? null)
	}));

	return { students };
};



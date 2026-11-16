import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { supabaseAdmin } from '$lib/server/supabase';

/** Constant-time string comparison (compares SHA-256 digests so lengths always match). */
export const safeEqual = (a: string, b: string) => {
	const da = createHash('sha256').update(a).digest();
	const db = createHash('sha256').update(b).digest();
	return timingSafeEqual(da, db);
};

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export type Caller =
	/** Instructor token: may write any student_id. */
	| { kind: 'admin' }
	/** Per-team token: may only write the student_id it is bound to. */
	| { kind: 'team'; studentId: string }
	/** Old shared class-wide token. Only accepted when ALLOW_SHARED_TOKEN=true. */
	| { kind: 'shared' };

const bearer = (request: Request) => {
	const header = request.headers.get('authorization') ?? '';
	const match = /^Bearer\s+(.+)$/i.exec(header);
	return match ? match[1].trim() : null;
};

/**
 * Work out who is calling from the Authorization header.
 * Returns null when the token is missing or not recognised.
 */
export async function authenticate(request: Request): Promise<Caller | null> {
	const token = bearer(request);
	if (!token) return null;

	if (env.LEADERBOARD_ADMIN_TOKEN && safeEqual(token, env.LEADERBOARD_ADMIN_TOKEN)) {
		return { kind: 'admin' };
	}

	const { data, error } = await supabaseAdmin
		.from('team_tokens')
		.select('student_id')
		.eq('token_hash', hashToken(token))
		.eq('active', true)
		.maybeSingle();

	if (error) {
		console.error('team_tokens lookup failed', error);
	} else if (data?.student_id) {
		return { kind: 'team', studentId: data.student_id };
	}

	if (
		env.ALLOW_SHARED_TOKEN === 'true' &&
		env.LEADERBOARD_API_TOKEN &&
		safeEqual(token, env.LEADERBOARD_API_TOKEN)
	) {
		return { kind: 'shared' };
	}

	return null;
}

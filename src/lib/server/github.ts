import { createHmac, createSign, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

/**
 * Talks to GitHub as the course GitHub App (cs7is3-grader-2026).
 *
 * Settings (Vercel environment variables):
 *   GRADER_APP_ID            the App's ID
 *   GRADER_APP_PRIVATE_KEY   the App's private key (PEM; "\n" escapes are accepted)
 *   GITHUB_WEBHOOK_SECRET    the App's webhook secret
 *   GITHUB_ORG               default ca-assignments
 *   GRADER_REPO              default ca-assignments/grader
 *   TEMPLATE_REPO            default ca-assignments/starter-pack
 *   TEAM_REPO_PREFIX         default 2026-team-
 */
export const githubSettings = () => ({
	org: env.GITHUB_ORG || 'ca-assignments',
	graderRepo: env.GRADER_REPO || 'ca-assignments/grader',
	templateRepo: env.TEMPLATE_REPO || 'ca-assignments/starter-pack',
	teamPrefix: env.TEAM_REPO_PREFIX || '2026-team-'
});

export const githubAppConfigured = () => Boolean(env.GRADER_APP_ID && env.GRADER_APP_PRIVATE_KEY);

const API = 'https://api.github.com';
const b64url = (data: string | Buffer) => Buffer.from(data).toString('base64url');

function appJwt(): string {
	const appId = env.GRADER_APP_ID;
	const key = env.GRADER_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
	if (!appId || !key) throw new Error('GitHub App is not configured (GRADER_APP_ID / GRADER_APP_PRIVATE_KEY)');
	const now = Math.floor(Date.now() / 1000);
	const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }));
	const signature = createSign('RSA-SHA256').update(`${header}.${payload}`).sign(key);
	return `${header}.${payload}.${b64url(signature)}`;
}

export class GitHubError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

async function request<T>(method: string, path: string, token: string, body?: unknown): Promise<T> {
	const res = await fetch(`${API}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'cs7is3-leaderboard',
			...(body ? { 'Content-Type': 'application/json' } : {})
		},
		body: body ? JSON.stringify(body) : undefined,
		signal: AbortSignal.timeout(15000)
	});
	const text = await res.text();
	if (!res.ok) {
		let message = text.slice(0, 300);
		try {
			message = JSON.parse(text).message ?? message;
		} catch {
			/* keep raw text */
		}
		throw new GitHubError(res.status, `GitHub ${method} ${path} failed (${res.status}): ${message}`);
	}
	return (text ? JSON.parse(text) : {}) as T;
}

let cached: { token: string; expires: number } | null = null;

/** Organization-wide installation token, cached until 5 minutes before it expires. */
export async function installationToken(): Promise<string> {
	if (cached && cached.expires - Date.now() > 5 * 60_000) return cached.token;
	const jwt = appJwt();
	const { org } = githubSettings();
	const installation = await request<{ id: number }>('GET', `/orgs/${org}/installation`, jwt);
	const res = await request<{ token: string; expires_at: string }>(
		'POST',
		`/app/installations/${installation.id}/access_tokens`,
		jwt
	);
	cached = { token: res.token, expires: Date.parse(res.expires_at) };
	return res.token;
}

export async function github<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
	return request<T>(method, path, await installationToken(), body);
}

/** Checks GitHub's X-Hub-Signature-256 header against the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
	const secret = env.GITHUB_WEBHOOK_SECRET;
	if (!secret || !signature?.startsWith('sha256=')) return false;
	const expected = Buffer.from('sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex'));
	const given = Buffer.from(signature);
	return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Starts the grader workflow for one commit of one team repo. */
export async function dispatchGrading(repo: string, sha: string, mode: 'leaderboard' | 'final' = 'leaderboard') {
	const { graderRepo } = githubSettings();
	await github('POST', `/repos/${graderRepo}/actions/workflows/grade.yml/dispatches`, {
		ref: 'main',
		inputs: { repo, sha, mode }
	});
}

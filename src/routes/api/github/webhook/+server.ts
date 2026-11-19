import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dispatchGrading, githubSettings, verifyWebhookSignature } from '$lib/server/github';
import { env } from '$env/dynamic/private';

const ZERO_SHA = /^0{40}$/;

type PushEvent = {
	ref?: string;
	after?: string;
	deleted?: boolean;
	repository?: { full_name?: string; archived?: boolean };
};

/**
 * Receives events from the cs7is3-grader-2026 GitHub App.
 * A push to main in a team repository starts the grader for that commit.
 */
export const POST: RequestHandler = async ({ request }) => {
	if (!env.GITHUB_WEBHOOK_SECRET) {
		return json({ error: 'Webhook not configured' }, { status: 503 });
	}

	const raw = await request.text();
	if (!verifyWebhookSignature(raw, request.headers.get('x-hub-signature-256'))) {
		return json({ error: 'Invalid signature' }, { status: 401 });
	}

	const event = request.headers.get('x-github-event');
	if (event === 'ping') return json({ ok: true, pong: true });
	if (event !== 'push') return json({ ok: true, ignored: `event ${event}` });

	let push: PushEvent;
	try {
		push = JSON.parse(raw);
	} catch {
		return json({ error: 'Body must be JSON' }, { status: 400 });
	}

	const repo = push.repository?.full_name ?? '';
	const sha = push.after ?? '';
	const { org, teamPrefix } = githubSettings();

	if (!repo.startsWith(`${org}/${teamPrefix}`)) return json({ ok: true, ignored: 'not a team repository' });
	if (push.ref !== 'refs/heads/main') return json({ ok: true, ignored: `branch ${push.ref}` });
	if (push.deleted || ZERO_SHA.test(sha)) return json({ ok: true, ignored: 'branch deleted' });
	if (push.repository?.archived) return json({ ok: true, ignored: 'archived repository' });
	if (!/^[0-9a-f]{40}$/.test(sha)) return json({ error: 'Bad commit SHA' }, { status: 400 });

	try {
		await dispatchGrading(repo, sha);
	} catch (e) {
		console.error('Failed to start grading', repo, sha, e);
		// 502 makes the failure visible under the App's "Recent deliveries" (with a redeliver button).
		return json({ error: 'Could not start grading' }, { status: 502 });
	}
	return json({ ok: true, grading: { repo, sha } });
};

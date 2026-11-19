import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { supabaseAdmin } from '$lib/server/supabase';
import { provisionTeam } from '$lib/server/provision';

/** Settings (Vercel environment variables), with defaults. */
export function registrationSettings() {
	const parsedMin = Number(env.TEAM_MIN_MEMBERS ?? 3);
	const parsedMax = Number(env.TEAM_MAX_MEMBERS ?? 6);
	const min = Number.isFinite(parsedMin) && parsedMin >= 1 ? parsedMin : 3;
	const max = Number.isFinite(parsedMax) && parsedMax >= min ? parsedMax : Math.max(min, 6);
	const deadline = env.REGISTRATION_DEADLINE ? new Date(env.REGISTRATION_DEADLINE) : null;
	const domain = (env.REGISTRATION_EMAIL_DOMAIN ?? 'tcd.ie').toLowerCase();
	const open =
		env.REGISTRATION_OPEN !== 'false' && (!deadline || Number.isNaN(+deadline) || Date.now() < +deadline);
	return {
		min,
		max,
		deadline: deadline && !Number.isNaN(+deadline) ? deadline.toISOString() : null,
		domain,
		open
	};
}

const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const slugify = (name: string) =>
	name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.slice(0, 40)
		.replace(/^-|-$/g, '');

function memberSchema(domain: string) {
	return z.object({
		full_name: z.string().trim().min(2, 'Enter a full name').max(100),
		tcd_email: z
			.string()
			.trim()
			.toLowerCase()
			.email('Enter a valid email')
			.refine((e) => e.endsWith(`@${domain}`), `Use a @${domain} address`),
		github_username: z
			.string()
			.trim()
			.transform((s) => s.replace(/^@/, ''))
			.pipe(z.string().regex(GITHUB_USERNAME, 'Not a valid GitHub username'))
	});
}

export type Member = { full_name: string; tcd_email: string; github_username: string };
export type RegistrationResult =
	| { ok: true; team: string; slug: string; repo?: string }
	| { ok: false; error: string; field?: string };

/** Checks a GitHub username exists. Unknown (rate limit, network) counts as OK. */
async function githubUserExists(username: string): Promise<boolean> {
	try {
		const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
			headers: { 'User-Agent': 'cs7is3-leaderboard', Accept: 'application/vnd.github+json' },
			signal: AbortSignal.timeout(5000)
		});
		return res.status !== 404;
	} catch {
		return true;
	}
}

export async function registerTeam(teamName: string, rawMembers: Member[]): Promise<RegistrationResult> {
	const settings = registrationSettings();
	if (!settings.open) {
		return { ok: false, error: 'Team registration is closed. Contact the course team.' };
	}

	const name = teamName.trim().replace(/\s+/g, ' ');
	if (name.length < 3 || name.length > 40) {
		return { ok: false, field: 'team', error: 'Team name must be 3–40 characters.' };
	}
	const slug = slugify(name);
	if (slug.length < 3) {
		return { ok: false, field: 'team', error: 'Use letters or numbers in the team name.' };
	}

	const filled = rawMembers.filter((m) => m.full_name.trim() || m.tcd_email.trim() || m.github_username.trim());
	if (filled.length < settings.min || filled.length > settings.max) {
		return {
			ok: false,
			field: 'members',
			error:
				settings.min === settings.max
					? `Teams must have exactly ${settings.min} members.`
					: `Teams must have ${settings.min}–${settings.max} members.`
		};
	}

	const schema = memberSchema(settings.domain);
	const members: Member[] = [];
	for (const [i, raw] of filled.entries()) {
		const parsed = schema.safeParse(raw);
		if (!parsed.success) {
			const issue = parsed.error.issues[0];
			return { ok: false, field: `member-${i}-${String(issue.path[0])}`, error: `Member ${i + 1}: ${issue.message}` };
		}
		members.push(parsed.data);
	}

	const emails = new Set(members.map((m) => m.tcd_email));
	const logins = new Set(members.map((m) => m.github_username.toLowerCase()));
	if (emails.size !== members.length || logins.size !== members.length) {
		return { ok: false, field: 'members', error: 'Each member must have a different email and GitHub username.' };
	}

	const { count: rosterSize } = await supabaseAdmin.from('roster').select('*', { count: 'exact', head: true });
	if (rosterSize && rosterSize > 0) {
		const { data: allowed } = await supabaseAdmin
			.from('roster')
			.select('tcd_email')
			.in('tcd_email', [...emails]);
		const allowedSet = new Set((allowed ?? []).map((r) => r.tcd_email.toLowerCase()));
		const missing = [...emails].filter((e) => !allowedSet.has(e));
		if (missing.length) {
			return {
				ok: false,
				field: 'members',
				error: `Not on the class list: ${missing.join(', ')}. Contact the course team if this is wrong.`
			};
		}
	}

	for (const [i, m] of members.entries()) {
		if (!(await githubUserExists(m.github_username))) {
			return {
				ok: false,
				field: `member-${i}-github_username`,
				error: `Member ${i + 1}: GitHub user "${m.github_username}" doesn't exist.`
			};
		}
	}

	const { data: teamId, error } = await supabaseAdmin.rpc('register_team', {
		p_name: name,
		p_slug: slug,
		p_members: members
	});
	if (error) {
		const msg = error.message ?? '';
		if (msg.includes('TEAM_TAKEN')) return { ok: false, field: 'team', error: 'That team name is already taken.' };
		if (msg.includes('EMAIL_TAKEN'))
			return { ok: false, field: 'members', error: `${msg.split(':').pop()} is already in a team.` };
		if (msg.includes('GITHUB_TAKEN'))
			return { ok: false, field: 'members', error: `GitHub user ${msg.split(':').pop()} is already in a team.` };
		console.error('register_team failed', error);
		return { ok: false, error: "Couldn't save your registration. Try again in a minute." };
	}

	// Create the repository straight away when the GitHub App is set up. If that
	// fails, the registration still stands and an instructor can retry from /admin/teams.
	let repo: string | undefined;
	if (typeof teamId === 'string') {
		const result = await provisionTeam(teamId);
		if (result.ok) repo = result.repo;
	}

	return { ok: true, team: name, slug, repo };
}

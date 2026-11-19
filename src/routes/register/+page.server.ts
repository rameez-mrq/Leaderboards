import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { registerTeam, registrationSettings, type Member } from '$lib/server/registration';

const isBlank = (m: Member) => !m.full_name.trim() && !m.tcd_email.trim() && !m.github_username.trim();

export const load: PageServerLoad = async () => {
	const { min, max, deadline, domain, open } = registrationSettings();
	return { min, max, deadline, domain, open };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const team = String(form.get('team') ?? '');
		const names = form.getAll('full_name').map(String);
		const emails = form.getAll('tcd_email').map(String);
		const logins = form.getAll('github_username').map(String);
		const members: Member[] = names.map((full_name, i) => ({
			full_name,
			tcd_email: emails[i] ?? '',
			github_username: logins[i] ?? ''
		}));

		const { min, max } = registrationSettings();
		const size = Number(form.get('team_size'));
		if (!Number.isInteger(size) || size < min || size > max) {
			return fail(400, { team, size: null, members, field: 'size', error: 'Choose how many members are in your team.' });
		}
		if (members.length !== size || members.some(isBlank)) {
			return fail(400, {
				team,
				size,
				members: members.slice(0, size),
				field: 'members',
				error: `Fill in all ${size} members.`
			});
		}
		if (form.get('consent') !== 'on') {
			return fail(400, { team, size, members, field: 'consent', error: 'Please confirm the privacy notice.' });
		}

		const result = await registerTeam(team, members);
		if (!result.ok) {
			return fail(400, { team, size, members, field: result.field, error: result.error });
		}
		return { success: true, team: result.team, slug: result.slug, repo: result.repo ?? null, count: size };
	}
};

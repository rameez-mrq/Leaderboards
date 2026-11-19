import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { safeEqual } from '$lib/server/auth';

// Instructor-only routes (unpublished grades, team registrations). HTTP Basic auth.
const PROTECTED_PREFIXES = ['/final-grades/grades', '/admin'];

const isProtected = (pathname: string) =>
	PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const challenge = (message = 'Authentication required') =>
	new Response(message, {
		status: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="CS7IS3 Final Grades", charset="UTF-8"',
			'Cache-Control': 'no-store'
		}
	});

export const handle: Handle = async ({ event, resolve }) => {
	if (!isProtected(event.url.pathname)) {
		return resolve(event);
	}

	const expectedUser = env.GRADES_ADMIN_USER || 'instructor';
	const expectedPassword = env.GRADES_ADMIN_PASSWORD;

	// Fail closed: if no password is configured, nobody gets in.
	if (!expectedPassword) {
		return new Response('Final grades are not available.', {
			status: 503,
			headers: { 'Cache-Control': 'no-store' }
		});
	}

	const header = event.request.headers.get('authorization') ?? '';
	if (!header.startsWith('Basic ')) {
		return challenge();
	}

	let user = '';
	let password = '';
	try {
		const decoded = atob(header.slice(6));
		const sep = decoded.indexOf(':');
		if (sep === -1) return challenge();
		user = decoded.slice(0, sep);
		password = decoded.slice(sep + 1);
	} catch {
		return challenge();
	}

	// Evaluate both comparisons so timing doesn't reveal which one failed.
	const userOk = safeEqual(user, expectedUser);
	const passOk = safeEqual(password, expectedPassword);
	if (!(userOk && passOk)) {
		return challenge('Invalid credentials');
	}

	const response = await resolve(event);
	response.headers.set('Cache-Control', 'private, no-store');
	response.headers.set('X-Robots-Tag', 'noindex');
	return response;
};

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

/**
 * Read at runtime, accepting both our own variable names and the ones the
 * Vercel ↔ Supabase integration creates. First match wins.
 */
const first = (...names: string[]) => names.map((n) => env[n]).find((v) => v && v.trim());

const url = () => first('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = () => first('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
const anonKey = () =>
	first(
		'SUPABASE_ANON_KEY',
		'SUPABASE_PUBLISHABLE_KEY',
		'NEXT_PUBLIC_SUPABASE_ANON_KEY',
		'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
	);

const options = { auth: { persistSession: false } };

/**
 * Create the client on first use, so a missing variable gives one clear error
 * in the logs instead of breaking every page at startup.
 */
function lazyClient(label: string, getKey: () => string | undefined): SupabaseClient {
	let client: SupabaseClient | null = null;
	return new Proxy({} as SupabaseClient, {
		get(_target, prop) {
			if (!client) {
				const u = url();
				const k = getKey();
				if (!u || !k) {
					throw new Error(
						`Supabase ${label} client is not configured: set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) ` +
							`and the ${label} key in the environment.`
					);
				}
				client = createClient(u, k, options);
			}
			const value = Reflect.get(client, prop);
			return typeof value === 'function' ? value.bind(client) : value;
		}
	});
}

/** Server-only client with full access (bypasses row-level security). */
export const supabaseAdmin = lazyClient('service-role', serviceKey);

/** Server-side client with the public key (respects row-level security). */
export const supabaseServerClient = lazyClient('anon', anonKey);

/// <reference types="vite/client" />

declare module '$env/static/private' {
	export const SUPABASE_URL: string;
	export const SUPABASE_SERVICE_ROLE_KEY: string;
	export const SUPABASE_ANON_KEY: string;
	export const LEADERBOARD_API_TOKEN: string;
}


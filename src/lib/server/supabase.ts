import { createClient } from '@supabase/supabase-js';
import {
	SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_ANON_KEY
} from '$env/static/private';

const supabaseUrl = SUPABASE_URL;

export const supabaseAdmin = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false }
});

export const supabaseServerClient = createClient(supabaseUrl, SUPABASE_ANON_KEY, {
	auth: { persistSession: false }
});


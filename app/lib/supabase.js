import { createBrowserClient } from '@supabase/ssr';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const CONTENT_ID = 'main';
export const IMAGE_BUCKET = 'site';

// Browser client for the manager: the session lives in cookies so server actions can check who is publishing.
let browserClient;
export function getBrowserClient() {
  if (!supabaseConfigured) return null;
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}

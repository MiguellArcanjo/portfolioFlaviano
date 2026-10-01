'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from '../lib/supabase';

// Called right after publishing so visitors see the new content without waiting for the cache.
// Only a signed-in administrator can trigger it.
export async function refreshPublishedSite() {
  if (!supabaseConfigured) return { ok: false };
  const store = await cookies();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: { getAll: () => store.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const { data: isAdmin } = await supabase.rpc('is_site_admin');
  if (!isAdmin) return { ok: false };
  revalidatePath('/');
  return { ok: true };
}

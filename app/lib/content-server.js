import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { defaults, migrateConfig } from '../site-config';
import { CONTENT_ID, SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from './supabase';

// Published content for the public pages. Any failure falls back to the initial content, so the site never breaks.
export const getPublishedConfig = cache(async () => {
  if (!supabaseConfigured) return defaults;
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    const { data, error } = await client.from('site_content').select('content').eq('id', CONTENT_ID).maybeSingle();
    if (error) throw error;
    return data?.content ? migrateConfig(data.content) : defaults;
  } catch (error) {
    console.error('Supabase: falha ao ler o conteúdo publicado.', error?.message || error);
    return defaults;
  }
});

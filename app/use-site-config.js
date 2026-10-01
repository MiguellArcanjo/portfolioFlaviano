'use client';
import { useEffect, useState } from 'react';
import { defaults, normalizeConfig } from './site-config';

// Starts from the content published in Supabase (read on the server). Inside the manager's preview,
// the draft arrives by postMessage and replaces it until the editor publishes.
export function useSiteConfig(initialConfig = defaults) {
  const [config, setConfig] = useState(initialConfig);
  useEffect(() => {
    const previewing = window.parent !== window && new URLSearchParams(location.search).has('preview');
    if (!previewing) return;
    function message(event) { if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'portfolio-preview') return; try { setConfig(normalizeConfig(event.data.config)); } catch {} }
    window.addEventListener('message', message);
    window.parent.postMessage({ type: 'portfolio-preview-ready' }, location.origin);
    return () => window.removeEventListener('message', message);
  }, []);
  return config;
}

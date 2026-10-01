'use client';
import { useEffect, useState } from 'react';
import { defaults, normalizeConfig, migrateConfig, STORAGE_KEY } from './site-config';
export function useSiteConfig() {
  const [config, setConfig] = useState(defaults);
  useEffect(() => {
    function read() { try { const saved = localStorage.getItem(STORAGE_KEY); setConfig(saved ? migrateConfig(JSON.parse(saved)) : defaults); } catch { setConfig(defaults); } }
    function message(event) { if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'portfolio-preview' || !new URLSearchParams(location.search).has('preview')) return; try { setConfig(normalizeConfig(event.data.config)); } catch {} }
    read(); window.addEventListener('storage', read); window.addEventListener('message', message);
    if (window.parent !== window && new URLSearchParams(location.search).has('preview')) window.parent.postMessage({type:'portfolio-preview-ready'},location.origin);
    return () => { window.removeEventListener('storage', read); window.removeEventListener('message', message); };
  }, []);
  useEffect(() => { document.title = config.seo.title; const meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = config.seo.description; }, [config.seo]);
  return config;
}

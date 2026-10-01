-- Portfólio Flaviano — estrutura do Supabase.
-- Cole tudo no SQL Editor e execute. Pode ser executado de novo sem apagar dados.
-- Antes de executar, troque o e-mail no fim do arquivo pelo e-mail de quem acessa o /admin.

-- Conteúdo do site: uma linha ("main") com toda a configuração em JSON.
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- Quem pode publicar. Ter conta no Supabase não basta: o e-mail precisa estar nesta lista.
create table if not exists public.site_admins (
  email text primary key
);

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.site_admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

alter table public.site_content enable row level security;
alter table public.site_admins enable row level security;

-- Qualquer visitante lê o conteúdo publicado; só administradores escrevem.
drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "site_content admin insert" on public.site_content;
create policy "site_content admin insert" on public.site_content for insert to authenticated with check (public.is_site_admin());
drop policy if exists "site_content admin update" on public.site_content;
create policy "site_content admin update" on public.site_content for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- A lista de administradores não é legível pelo site; cada pessoa só vê o próprio e-mail.
drop policy if exists "site_admins self read" on public.site_admins;
create policy "site_admins self read" on public.site_admins for select to authenticated using (lower(email) = lower(auth.jwt() ->> 'email'));

grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant select on public.site_admins to authenticated;
grant execute on function public.is_site_admin() to anon, authenticated;

-- Fotos do site: leitura pública, envio só por administradores, até 3 MB, apenas imagens.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 3145728, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site images public read" on storage.objects;
create policy "site images public read" on storage.objects for select to anon, authenticated using (bucket_id = 'site');
drop policy if exists "site images admin insert" on storage.objects;
create policy "site images admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'site' and public.is_site_admin());
drop policy if exists "site images admin update" on storage.objects;
create policy "site images admin update" on storage.objects for update to authenticated using (bucket_id = 'site' and public.is_site_admin());
drop policy if exists "site images admin delete" on storage.objects;
create policy "site images admin delete" on storage.objects for delete to authenticated using (bucket_id = 'site' and public.is_site_admin());

-- Troque pelo e-mail do usuário criado em Authentication → Users (pode repetir a linha para mais pessoas).
insert into public.site_admins (email) values ('TROQUE-PELO-EMAIL@exemplo.com') on conflict do nothing;

notify pgrst, 'reload schema';

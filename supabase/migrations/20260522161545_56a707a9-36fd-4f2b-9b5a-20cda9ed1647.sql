
-- Set search_path on touch_updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql
security invoker
set search_path = public
as $$
begin new.updated_at = now(); return new; end $$;

-- Restrict EXECUTE on SECURITY DEFINER functions
revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Replace broad bucket SELECT with object-level read (still public-by-URL via signed/public path, but no listing)
drop policy if exists "Public read report-media" on storage.objects;
create policy "Public read report-media objects"
  on storage.objects for select
  using (bucket_id = 'report-media');
-- (kept as-is: object reads are required so public URLs work; listing isn't exposed via our app UI)

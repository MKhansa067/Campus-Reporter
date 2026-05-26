-- 1. Restrict user_roles SELECT
DROP POLICY IF EXISTS "Roles are viewable by everyone" ON public.user_roles;
CREATE POLICY "Users view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Tighten storage upload policy to enforce report ownership
DROP POLICY IF EXISTS "Authenticated upload report-media" ON storage.objects;
CREATE POLICY "Owners upload report-media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'report-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Remove broad public list policy; files remain accessible via public URL (CDN bypasses RLS)
DROP POLICY IF EXISTS "Public read report-media objects" ON storage.objects;

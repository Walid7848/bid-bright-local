GRANT SELECT (id, full_name, city, bio, profession, avatar_url, created_at, updated_at) ON public.profiles TO authenticated;
GRANT SELECT (id, full_name, city, bio, profession, avatar_url, created_at, updated_at) ON public.profiles TO anon;
GRANT INSERT (id, full_name, city, phone, bio, profession, avatar_url) ON public.profiles TO authenticated;
GRANT UPDATE (full_name, city, phone, bio, profession, avatar_url) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
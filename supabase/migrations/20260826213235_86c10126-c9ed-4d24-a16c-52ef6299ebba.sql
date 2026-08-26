-- Defense in depth: remove unused anon table privileges (RLS already blocks these).
REVOKE ALL ON public.bids FROM anon;
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE ALL ON public.requests FROM anon;
REVOKE ALL ON public.reviews FROM anon;
REVOKE ALL ON public.profiles FROM anon;

-- Keep only the public read surface the app actually uses.
GRANT SELECT ON public.requests TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT (id, full_name, city, bio, profession, avatar_url, created_at, updated_at)
  ON public.profiles TO anon;

-- Ensure privileged roles keep full access.
GRANT ALL ON public.bids, public.notifications, public.user_roles, public.subscriptions,
             public.requests, public.reviews, public.profiles TO service_role;
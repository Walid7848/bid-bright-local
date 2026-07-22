
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired');

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  trial_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 months'),
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own subscription"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only service_role can update; users cannot change status/dates themselves.

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create trial subscription when a user is granted the 'professional' role
CREATE OR REPLACE FUNCTION public.handle_new_professional()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'professional' THEN
    INSERT INTO public.subscriptions (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_professional_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_professional();

-- Backfill trials for existing professionals
INSERT INTO public.subscriptions (user_id)
SELECT user_id FROM public.user_roles WHERE role = 'professional'
ON CONFLICT (user_id) DO NOTHING;

-- Helper: is subscription currently active (trial not expired OR active paid)
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND (
        (status = 'trialing' AND trial_ends_at > now())
        OR (status = 'active' AND (current_period_end IS NULL OR current_period_end > now()))
      )
  )
$$;

-- Helper: number of bids placed by user in current calendar month
CREATE OR REPLACE FUNCTION public.bids_this_month(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.bids
  WHERE professional_id = _user_id
    AND created_at >= date_trunc('month', now())
$$;

-- Helper: may this professional place a new bid?
CREATE OR REPLACE FUNCTION public.can_place_bid(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_active_subscription(_user_id)
      OR public.bids_this_month(_user_id) < 1
$$;

-- Tighten bid insert policy to enforce quota
DROP POLICY IF EXISTS "Professionals can insert bids" ON public.bids;
CREATE POLICY "Professionals can insert bids"
  ON public.bids FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = professional_id
    AND public.has_role(auth.uid(), 'professional')
    AND EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.status = 'open')
    AND public.can_place_bid(auth.uid())
  );

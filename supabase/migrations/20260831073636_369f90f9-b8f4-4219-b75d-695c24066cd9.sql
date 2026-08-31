-- 1. Restrict SECURITY DEFINER helpers not meant for direct client calls
REVOKE EXECUTE ON FUNCTION public.bids_this_month(uuid) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid) FROM authenticated, anon;

-- 2. Narrow profile visibility to marketplace context
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable in marketplace context"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR public.has_role(id, 'professional'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.client_id = profiles.id
      AND (
        r.status = 'open'::request_status
        OR EXISTS (SELECT 1 FROM public.bids b WHERE b.request_id = r.id AND b.professional_id = auth.uid())
      )
  )
);

-- 3. Limit self-service subscription updates to cancellation columns only
REVOKE UPDATE ON public.subscriptions FROM authenticated;
GRANT UPDATE (cancel_at_period_end, canceled_at) ON public.subscriptions TO authenticated;
DROP POLICY IF EXISTS "Users cancel their own subscription" ON public.subscriptions;
CREATE POLICY "Users cancel their own subscription"
ON public.subscriptions FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
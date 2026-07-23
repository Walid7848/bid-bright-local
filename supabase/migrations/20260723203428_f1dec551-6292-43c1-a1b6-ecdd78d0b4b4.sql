ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz;

DROP POLICY IF EXISTS "Users cancel their own subscription" ON public.subscriptions;
CREATE POLICY "Users cancel their own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = (SELECT status FROM public.subscriptions s WHERE s.id = subscriptions.id)
  AND trial_started_at IS NOT DISTINCT FROM (SELECT trial_started_at FROM public.subscriptions s WHERE s.id = subscriptions.id)
  AND trial_ends_at IS NOT DISTINCT FROM (SELECT trial_ends_at FROM public.subscriptions s WHERE s.id = subscriptions.id)
  AND current_period_end IS NOT DISTINCT FROM (SELECT current_period_end FROM public.subscriptions s WHERE s.id = subscriptions.id)
);
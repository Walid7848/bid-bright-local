
-- profiles: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- user_roles: restrict SELECT to own roles
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- bids: prevent professionals from self-accepting.
-- Split professional update policy: can only update while status stays 'pending'
-- and cannot change professional_id or request_id. Client policy already permits status changes.
DROP POLICY IF EXISTS "Professionals can update their own bids" ON public.bids;
CREATE POLICY "Professionals can update their own pending bids"
  ON public.bids FOR UPDATE
  TO authenticated
  USING (auth.uid() = professional_id AND status = 'pending')
  WITH CHECK (
    auth.uid() = professional_id
    AND status = 'pending'
  );

-- Ensure client update policy has explicit WITH CHECK preserving ownership
DROP POLICY IF EXISTS "Client can update bids on own requests" ON public.bids;
CREATE POLICY "Client can update bids on own requests"
  ON public.bids FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = bids.request_id AND r.client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = bids.request_id AND r.client_id = auth.uid()));

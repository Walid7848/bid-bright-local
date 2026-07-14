
ALTER TABLE public.requests
  ADD CONSTRAINT requests_client_profile_fkey
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.bids
  ADD CONSTRAINT bids_professional_profile_fkey
  FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

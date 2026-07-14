
-- Enum for user types
CREATE TYPE public.app_role AS ENUM ('client', 'professional');

-- Enum for request status
CREATE TYPE public.request_status AS ENUM ('open', 'awarded', 'closed');

-- Enum for bid status
CREATE TYPE public.bid_status AS ENUM ('pending', 'accepted', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  phone TEXT,
  bio TEXT,
  profession TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Security definer function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  budget_min NUMERIC,
  budget_max NUMERIC,
  images TEXT[] NOT NULL DEFAULT '{}',
  status public.request_status NOT NULL DEFAULT 'open',
  awarded_bid_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view requests"
  ON public.requests FOR SELECT USING (true);
CREATE POLICY "Clients can insert their own requests"
  ON public.requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'));
CREATE POLICY "Clients can update their own requests"
  ON public.requests FOR UPDATE TO authenticated
  USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete their own requests"
  ON public.requests FOR DELETE TO authenticated
  USING (auth.uid() = client_id);

CREATE INDEX idx_requests_city ON public.requests(city);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_client ON public.requests(client_id);

-- Bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  message TEXT NOT NULL,
  status public.bid_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, professional_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bids TO authenticated;
GRANT ALL ON public.bids TO service_role;

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Bids visible to: the request's client, and the bidding professional
CREATE POLICY "Client sees bids on own requests"
  ON public.bids FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.client_id = auth.uid())
    OR professional_id = auth.uid()
  );
CREATE POLICY "Professionals can insert bids"
  ON public.bids FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = professional_id
    AND public.has_role(auth.uid(), 'professional')
    AND EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.status = 'open')
  );
CREATE POLICY "Professionals can update their own bids"
  ON public.bids FOR UPDATE TO authenticated
  USING (auth.uid() = professional_id);
CREATE POLICY "Client can update bids on own requests"
  ON public.bids FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.client_id = auth.uid()));
CREATE POLICY "Professionals can delete their own bids"
  ON public.bids FOR DELETE TO authenticated
  USING (auth.uid() = professional_id);

CREATE INDEX idx_bids_request ON public.bids(request_id);
CREATE INDEX idx_bids_pro ON public.bids(professional_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_requests_updated_at BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_bids_updated_at BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage policies for the request-images bucket (bucket created via tool)
CREATE POLICY "Anyone can view request images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'request-images');

CREATE POLICY "Authenticated users can upload request images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'request-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own request images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'request-images' AND (storage.foldername(name))[1] = auth.uid()::text);

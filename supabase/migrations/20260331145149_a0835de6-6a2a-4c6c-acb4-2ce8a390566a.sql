CREATE TYPE public.app_role AS ENUM ('customer', 'artist');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE public.artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  experience_years INTEGER NOT NULL DEFAULT 0,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL DEFAULT '',
  portfolio_images TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artist profiles viewable by everyone" ON public.artist_profiles FOR SELECT USING (true);
CREATE POLICY "Artists can update their own profile" ON public.artist_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Artists can insert their own profile" ON public.artist_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.art_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  art_style TEXT NOT NULL,
  art_type TEXT NOT NULL,
  medium TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  budget_min NUMERIC NOT NULL,
  budget_max NUMERIC NOT NULL,
  reference_images TEXT[] NOT NULL DEFAULT '{}',
  ai_preview_images TEXT[] NOT NULL DEFAULT '{}',
  selected_preview TEXT,
  final_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'request_sent',
  ai_suggested_price NUMERIC,
  artist_price NUMERIC,
  customer_counter_price NUMERIC,
  final_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.art_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own requests" ON public.art_requests FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = artist_id);
CREATE POLICY "Customers can create requests" ON public.art_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Participants can update requests" ON public.art_requests FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = artist_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer'));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer'));
  IF (NEW.raw_user_meta_data->>'role') = 'artist' THEN
    INSERT INTO public.artist_profiles (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON public.artist_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_art_requests_updated_at BEFORE UPDATE ON public.art_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
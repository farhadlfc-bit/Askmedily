-- AskMedily Drug Database Schema
-- Run this in Supabase SQL Editor

-- Drugs table
CREATE TABLE IF NOT EXISTS drugs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  generic_name TEXT,
  brand_names TEXT[],
  drug_class TEXT,
  what_it_does TEXT,
  how_it_works TEXT,
  common_uses TEXT[],
  side_effects JSONB,
  warnings TEXT[],
  interactions TEXT[],
  dosage_info TEXT,
  take_with TEXT,
  missed_dose TEXT,
  nhs_url TEXT,
  source TEXT DEFAULT 'NHS',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  plan TEXT DEFAULT 'trial',
  trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 days'),
  subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  drug_slug TEXT,
  search_query TEXT,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  drug_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, drug_slug)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Drugs are public
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drugs are publicly readable" ON drugs FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Conditions table
CREATE TABLE IF NOT EXISTS conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  symptoms TEXT[],
  causes TEXT[],
  commonly_prescribed_drugs TEXT[],
  drug_slugs TEXT[],
  lifestyle_tips TEXT[],
  when_to_see_gp TEXT,
  nhs_url TEXT,
  source TEXT DEFAULT 'NHS',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conditions are public
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conditions are publicly readable" ON conditions FOR SELECT USING (true);

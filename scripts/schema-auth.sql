-- Supabase SQL Schema for upday authentication & user data
-- Run this in Supabase SQL Editor after enabling Authentication providers
-- Updated: 2026-02-05

-- =============================================================================
-- PROFILES TABLE
-- Stores additional user profile data linked to auth.users
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  provider TEXT, -- 'github' or 'google'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can insert profiles (for auth trigger)
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- USER INTERESTS TABLE
-- Stores user's content preferences for My Feed
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categories TEXT[] NOT NULL DEFAULT '{}', -- required, at least 1
  keywords TEXT[] DEFAULT '{}', -- max 10
  companies TEXT[] DEFAULT '{}', -- synced with pinned companies
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_interests_user_id_unique UNIQUE (user_id),
  CONSTRAINT categories_not_empty CHECK (array_length(categories, 1) > 0 OR onboarding_completed = FALSE)
);

-- Enable RLS
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Users can read their own interests
CREATE POLICY "Users can read own interests" ON user_interests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own interests
CREATE POLICY "Users can insert own interests" ON user_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own interests
CREATE POLICY "Users can update own interests" ON user_interests
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- PINNED COMPANIES TABLE
-- Stores user's pinned companies (server-side, synced)
-- =============================================================================

CREATE TABLE IF NOT EXISTS pinned_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_slug TEXT NOT NULL,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT pinned_companies_unique UNIQUE (user_id, company_slug)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pinned_companies_user ON pinned_companies(user_id);

-- Enable RLS
ALTER TABLE pinned_companies ENABLE ROW LEVEL SECURITY;

-- Users can read their own pinned companies
CREATE POLICY "Users can read own pinned companies" ON pinned_companies
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own pinned companies
CREATE POLICY "Users can insert own pinned companies" ON pinned_companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own pinned companies
CREATE POLICY "Users can delete own pinned companies" ON pinned_companies
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- TRIGGER: Auto-create profile on signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    NEW.raw_app_meta_data->>'provider'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TRIGGER: Update timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_user_interests_updated_at ON user_interests;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_interests_updated_at
  BEFORE UPDATE ON user_interests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- SETUP INSTRUCTIONS
-- =============================================================================
--
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Enable GitHub OAuth:
--    - Create OAuth App at https://github.com/settings/developers
--    - Set callback URL: https://<project-ref>.supabase.co/auth/v1/callback
--    - Copy Client ID and Client Secret to Supabase
-- 3. Enable Google OAuth:
--    - Create OAuth credentials at https://console.cloud.google.com/apis/credentials
--    - Set authorized redirect URI: https://<project-ref>.supabase.co/auth/v1/callback
--    - Copy Client ID and Client Secret to Supabase
-- 4. Run this SQL script in SQL Editor
-- 5. Test login flow
--

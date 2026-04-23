-- ============================================
-- TAALPIX - AUTO CREATE USER PROFILE
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates a trigger that automatically creates
-- a user_profiles record when a new user signs up
-- ============================================

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    current_streak,
    longest_streak,
    last_activity_date,
    total_words_mastered
  )
  VALUES (
    NEW.id,
    0,
    0,
    NULL,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();

-- ============================================
-- CREATE PROFILES FOR EXISTING USERS
-- ============================================
-- This creates profiles for any users that already exist
-- (like your test user)
-- ============================================

INSERT INTO public.user_profiles (user_id, current_streak, longest_streak, total_words_mastered)
SELECT 
  id,
  0,
  0,
  0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that profiles exist for all users
-- ============================================

SELECT 
  u.email,
  u.created_at as user_created,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

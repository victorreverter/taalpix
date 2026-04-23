-- ============================================
-- TAALPIX - AUTO CREATE USER LEVEL PROGRESS
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates a trigger that automatically creates
-- user_level_progress records when a new user signs up
-- ============================================

-- Create function to auto-create level progress
CREATE OR REPLACE FUNCTION public.create_user_level_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert all 4 levels (A1, A2, B1, B2) with A1 unlocked
  INSERT INTO public.user_level_progress (
    user_id,
    level,
    unlocked,
    scenes_completed,
    total_scenes,
    unlocked_at
  )
  VALUES 
    (NEW.id, 'A1', true, 0, 3, NOW()),
    (NEW.id, 'A2', false, 0, 3, NULL),
    (NEW.id, 'B1', false, 0, 2, NULL),
    (NEW.id, 'B2', false, 0, 2, NULL);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_level_progress_created ON auth.users;

CREATE TRIGGER on_auth_user_level_progress_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_level_progress();

-- ============================================
-- CREATE LEVEL PROGRESS FOR EXISTING USERS
-- ============================================
-- This creates level progress for any users that already exist
-- ============================================

INSERT INTO public.user_level_progress (user_id, level, unlocked, scenes_completed, total_scenes, unlocked_at)
SELECT 
  u.id,
  l.level,
  (l.level = 'A1'),  -- Only A1 is unlocked for existing users
  0,
  l.total_scenes,
  CASE WHEN l.level = 'A1' THEN NOW() ELSE NULL END
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('A1', 3),
    ('A2', 3),
    ('B1', 2),
    ('B2', 2)
) AS l(level, total_scenes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_level_progress ulp 
  WHERE ulp.user_id = u.id AND ulp.level = l.level
);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that level progress exists for all users
-- ============================================

SELECT 
  u.email,
  ulp.level,
  ulp.unlocked,
  ulp.scenes_completed,
  ulp.total_scenes
FROM auth.users u
JOIN public.user_level_progress ulp ON u.id = ulp.user_id
ORDER BY u.email, ulp.level;

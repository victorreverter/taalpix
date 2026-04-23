-- ============================================
-- TAALPIX SUPABASE SCHEMA
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to FK constraints)
DROP TABLE IF EXISTS session_retry_queue CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS user_word_states CASCADE;
DROP TABLE IF EXISTS user_scene_progress CASCADE;
DROP TABLE IF EXISTS user_level_progress CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS dialogues CASCADE;
DROP TABLE IF EXISTS sentences CASCADE;
DROP TABLE IF EXISTS exercise_words CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS scene_words CASCADE;
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS scenes CASCADE;

-- ============================================
-- CORE CONTENT TABLES
-- ============================================

-- 1. Scenes Table
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  scene_order INTEGER NOT NULL,
  word_count INTEGER DEFAULT 7,
  is_premium BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Words Table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dutch TEXT NOT NULL,
  spanish TEXT NOT NULL,
  category TEXT NOT NULL,
  frequency_rank INTEGER NOT NULL,
  level TEXT NOT NULL,
  pixel_art_placeholder TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scene Words (join table)
CREATE TABLE scene_words (
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  word_order INTEGER NOT NULL,
  PRIMARY KEY (scene_id, word_id)
);

-- 4. Exercises Table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exercise Words
CREATE TABLE exercise_words (
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  word_order INTEGER,
  PRIMARY KEY (exercise_id, word_id)
);

-- 6. Sentences Table
CREATE TABLE sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  dutch TEXT NOT NULL,
  spanish TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  word_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Dialogues Table
CREATE TABLE dialogues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  dialogue_order INTEGER NOT NULL,
  speaker TEXT NOT NULL,
  line_dutch TEXT NOT NULL,
  line_spanish TEXT NOT NULL,
  is_user_line BOOLEAN DEFAULT FALSE,
  response_type TEXT DEFAULT 'multiple_choice',
  response_options JSONB,
  correct_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROGRESS TABLES
-- ============================================

-- 8. User Profiles
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_words_mastered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. User Level Progress
CREATE TABLE user_level_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  scenes_completed INTEGER DEFAULT 0,
  total_scenes INTEGER NOT NULL,
  unlocked_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, level)
);

-- 10. User Scene Progress
CREATE TABLE user_scene_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'locked',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  mistakes_made INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, scene_id)
);

-- 11. User Word States (SM-2 + Review Queue)
CREATE TABLE user_word_states (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  repetitions INTEGER DEFAULT 0,
  interval_days INTEGER DEFAULT 0,
  ease_factor DECIMAL DEFAULT 2.5,
  next_review_date TIMESTAMPTZ,
  last_practiced TIMESTAMPTZ,
  status TEXT DEFAULT 'learning',
  mistake_count INTEGER DEFAULT 0,
  in_review_queue BOOLEAN DEFAULT FALSE,
  consecutive_correct INTEGER DEFAULT 0,
  mastered_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, word_id)
);

-- 12. Study Sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  words_practiced INTEGER DEFAULT 0,
  mistakes_made INTEGER DEFAULT 0,
  accuracy DECIMAL,
  session_type TEXT DEFAULT 'learning'
);

-- 13. Session Retry Queue
CREATE TABLE session_retry_queue (
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, word_id, exercise_type)
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scene_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_retry_queue ENABLE ROW LEVEL SECURITY;

-- Public read: content tables
CREATE POLICY "Public read access" ON scenes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON words FOR SELECT USING (true);
CREATE POLICY "Public read access" ON scene_words FOR SELECT USING (true);
CREATE POLICY "Public read access" ON exercises FOR SELECT USING (true);
CREATE POLICY "Public read access" ON exercise_words FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sentences FOR SELECT USING (true);
CREATE POLICY "Public read access" ON dialogues FOR SELECT USING (true);

-- User data: user-specific access
CREATE POLICY "User profiles are user-specific" ON user_profiles 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User level progress is user-specific" ON user_level_progress 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User scene progress is user-specific" ON user_scene_progress 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "User word states are user-specific" ON user_word_states 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Study sessions are user-specific" ON study_sessions 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Session retry queue is user-specific" ON session_retry_queue 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM study_sessions WHERE id = session_id AND user_id = auth.uid()
  ));

-- ============================================
-- INDEXES (for performance)
-- ============================================

CREATE INDEX idx_user_word_states_review ON user_word_states(user_id, in_review_queue, next_review_date);
CREATE INDEX idx_user_scene_progress_user ON user_scene_progress(user_id, status);
CREATE INDEX idx_user_level_progress_user ON user_level_progress(user_id, unlocked);
CREATE INDEX idx_scenes_level ON scenes(level, scene_order);
CREATE INDEX idx_words_level ON words(level, frequency_rank);

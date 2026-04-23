-- ============================================
-- ============================================
-- TAALPIX - DROP EXISTING TABLES
-- Run this FIRST if you have existing tables
-- ============================================
-- ============================================

-- Drop all tables in correct order (due to foreign key constraints)
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

-- Now you can run database_schema.sql followed by seed_data.sql

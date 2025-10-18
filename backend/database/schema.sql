-- StudyBuddy Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  lecture_title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create lecture_sessions table
CREATE TABLE IF NOT EXISTS lecture_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  transcript TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_lecture_title ON flashcards(lecture_title);
CREATE INDEX IF NOT EXISTS idx_lecture_sessions_user_id ON lecture_sessions(user_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (modify based on your authentication needs)
-- This allows anyone to read/write for now - adjust for production
CREATE POLICY IF NOT EXISTS "Allow all operations on flashcards" ON flashcards
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on lecture_sessions" ON lecture_sessions
  FOR ALL USING (true) WITH CHECK (true);

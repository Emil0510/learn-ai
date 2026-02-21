-- ============================================================================
-- StudyFlash AI - Supabase Database Setup
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ============================================================================

-- 1. Create study_sets table
CREATE TABLE IF NOT EXISTS public.study_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pdf_url TEXT,
  flashcards JSONB NOT NULL DEFAULT '[]'::jsonb,
  mcqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  revision_sheet TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.study_sets ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Allow users to read their own study sets (and allow anonymous reads for guest generations)
CREATE POLICY "Users can read own study sets"
  ON public.study_sets
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL  -- Allow reading anonymous study sets
  );

-- Allow users to insert their own study sets (and allow anonymous inserts)
CREATE POLICY "Users can insert own study sets"
  ON public.study_sets
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL  -- Allow anonymous study sets for guests
  );

-- Allow users to delete their own study sets
CREATE POLICY "Users can delete own study sets"
  ON public.study_sets
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create index for better query performance
CREATE INDEX IF NOT EXISTS study_sets_user_id_idx ON public.study_sets(user_id);
CREATE INDEX IF NOT EXISTS study_sets_created_at_idx ON public.study_sets(created_at DESC);

-- ============================================================================
-- 5. Storage Bucket Setup
-- ============================================================================
-- Note: You may need to create the 'pdfs' bucket manually in the Supabase Dashboard
-- if it doesn't exist: Storage > Create Bucket > Name: "pdfs" > Public: true
-- 
-- Then run these policies:

-- Allow public read access to all files in the pdfs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to upload to the pdfs bucket (for guest users)
CREATE POLICY "Allow public uploads to pdfs bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'pdfs');

-- Allow anyone to read from the pdfs bucket (it's public)
CREATE POLICY "Allow public reads from pdfs bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pdfs');

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own pdfs"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'pdfs' AND auth.uid() = owner);

-- ============================================================================
-- DONE! Your database is ready.
-- ============================================================================

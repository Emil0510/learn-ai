-- Add conspect column to study_sets (keep revision_sheet for backward compatibility)
ALTER TABLE study_sets
ADD COLUMN IF NOT EXISTS conspect text;

-- Backfill: copy revision_sheet to conspect where conspect is null (optional)
-- UPDATE study_sets SET conspect = revision_sheet WHERE conspect IS NULL AND revision_sheet IS NOT NULL;

-- Flashcard answers: one row per (study_set, user, flashcard_index) - latest attempt (auth users only)
CREATE TABLE IF NOT EXISTS flashcard_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id uuid NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_index int NOT NULL,
  correct boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(study_set_id, user_id, flashcard_index)
);

CREATE INDEX IF NOT EXISTS idx_flashcard_answers_study_set_user ON flashcard_answers(study_set_id, user_id);

-- MCQ answers: one row per attempt (we keep history for "last score") (auth users only)
CREATE TABLE IF NOT EXISTS mcq_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id uuid NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mcq_index int NOT NULL,
  selected_option int NOT NULL,
  correct boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcq_answers_study_set_user ON mcq_answers(study_set_id, user_id);

-- RLS for flashcard_answers
ALTER TABLE flashcard_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own flashcard_answers"
  ON flashcard_answers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcard_answers"
  ON flashcard_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcard_answers"
  ON flashcard_answers FOR UPDATE USING (auth.uid() = user_id);

-- RLS for mcq_answers
ALTER TABLE mcq_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mcq_answers"
  ON mcq_answers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mcq_answers"
  ON mcq_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mcq_answers"
  ON mcq_answers FOR UPDATE USING (auth.uid() = user_id);

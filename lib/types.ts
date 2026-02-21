export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Flashcard {
  question: string;
  answer: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  image_url?: string; // Optional image URL for visual questions (graphs, diagrams, charts)
}

export interface StudySet {
  id: string;
  user_id: string | null;
  title: string;
  pdf_url: string | null;
  flashcards: Flashcard[];
  mcqs: MCQ[];
  revision_sheet: string;
  conspect?: string;
  created_at: string;
}

export interface GenerateResponse {
  flashcards: Flashcard[];
  mcqs: MCQ[];
  revision_sheet?: string;
  conspect: string;
  studySetId: string;
  title: string;
}

// Progress (saved correct/wrong answers)
export interface FlashcardProgressItem {
  index: number;
  correct: boolean;
}

export interface McqProgressItem {
  index: number;
  selectedOption: number;
  correct: boolean;
}

export interface StudyProgress {
  flashcardProgress: FlashcardProgressItem[];
  mcqProgress: McqProgressItem[];
}

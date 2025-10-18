/**
 * TypeScript type definitions for Flashcard feature
 */

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  lecture_title: string;
  lectureTitle?: string; // Alias for compatibility
  created_at: Date | string;
  createdAt?: Date | string; // Alias for compatibility
  user_id?: string;
  userId?: string; // Alias for compatibility
}

export interface FlashcardCreate {
  question: string;
  answer: string;
  lecture_title: string;
  user_id?: string;
}

export interface FlashcardUpdate {
  question?: string;
  answer?: string;
  lecture_title?: string;
}

export interface LectureSession {
  id: string;
  transcript: string;
  flashcards: Flashcard[];
  created_at: Date | string;
  createdAt?: Date | string;
  user_id?: string;
  userId?: string;
}

export interface TranscriptRequest {
  transcript: string;
  lecture_title: string;
  user_id?: string;
  num_flashcards?: number;
}

export interface FlashcardGenerationResponse {
  flashcards: Flashcard[];
  session_id: string;
  total_generated: number;
}

export interface TranscribeResponse {
  transcript: string;
  flashcards: Flashcard[];
  session_id: string;
  total_generated: number;
}

export interface QuizStats {
  correct: number;
  incorrect: number;
  remaining: number;
  total: number;
}

export interface QuizQuestion {
  flashcard: Flashcard;
  isCorrect?: boolean;
  userAnswer?: string;
}

export type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

export type FlashcardMode = 'record' | 'review' | 'quiz' | 'list';

export interface RecorderState {
  state: RecordingState;
  duration: number;
  audioBlob?: Blob;
  transcript?: string;
  error?: string;
}

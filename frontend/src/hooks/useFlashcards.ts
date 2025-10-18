import { useState, useCallback } from 'react';
import {
  Flashcard,
  FlashcardCreate,
  FlashcardUpdate,
  TranscriptRequest,
  FlashcardGenerationResponse,
  TranscribeResponse
} from '../types/flashcard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  generateFromTranscript: (request: TranscriptRequest) => Promise<FlashcardGenerationResponse | null>;
  transcribeAndGenerate: (audioBlob: Blob, lectureTitle: string, numFlashcards?: number) => Promise<TranscribeResponse | null>;
  fetchFlashcards: (userId?: string, lectureTitle?: string) => Promise<void>;
  createFlashcard: (flashcard: FlashcardCreate) => Promise<Flashcard | null>;
  updateFlashcard: (id: string, update: FlashcardUpdate) => Promise<Flashcard | null>;
  deleteFlashcard: (id: string) => Promise<boolean>;
  exportToAnki: (userId?: string, lectureTitle?: string) => Promise<void>;
}

export const useFlashcards = (): UseFlashcardsReturn => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFromTranscript = useCallback(async (
    request: TranscriptRequest
  ): Promise<FlashcardGenerationResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate flashcards');
      }

      const data: FlashcardGenerationResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating flashcards:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const transcribeAndGenerate = useCallback(async (
    audioBlob: Blob,
    lectureTitle: string,
    numFlashcards: number = 10
  ): Promise<TranscribeResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const params = new URLSearchParams({
        lecture_title: lectureTitle,
        num_flashcards: numFlashcards.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/flashcards/transcribe?${params}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to transcribe and generate flashcards');
      }

      const data: TranscribeResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error transcribing audio:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlashcards = useCallback(async (
    userId?: string,
    lectureTitle?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (lectureTitle) params.append('lecture_title', lectureTitle);

      const response = await fetch(`${API_BASE_URL}/api/flashcards?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
      }

      const data: Flashcard[] = await response.json();
      setFlashcards(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFlashcard = useCallback(async (
    flashcard: FlashcardCreate
  ): Promise<Flashcard | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcard),
      });

      if (!response.ok) {
        throw new Error('Failed to create flashcard');
      }

      const data: Flashcard = await response.json();
      setFlashcards(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating flashcard:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFlashcard = useCallback(async (
    id: string,
    update: FlashcardUpdate
  ): Promise<Flashcard | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard');
      }

      const data: Flashcard = await response.json();
      setFlashcards(prev => prev.map(card => card.id === id ? data : card));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating flashcard:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFlashcard = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      setFlashcards(prev => prev.filter(card => card.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting flashcard:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToAnki = useCallback(async (
    userId?: string,
    lectureTitle?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (lectureTitle) params.append('lecture_title', lectureTitle);

      const response = await fetch(`${API_BASE_URL}/api/flashcards/export/anki?${params}`);

      if (!response.ok) {
        throw new Error('Failed to export flashcards');
      }

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flashcards_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error exporting flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    flashcards,
    loading,
    error,
    generateFromTranscript,
    transcribeAndGenerate,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    exportToAnki,
  };
};

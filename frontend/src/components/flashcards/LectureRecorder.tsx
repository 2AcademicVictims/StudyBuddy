import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Form, ProgressBar } from 'react-bootstrap';
import { RecordingState, Flashcard } from '../../types/flashcard.types';
import { useFlashcards } from '../../hooks/useFlashcards';

interface LectureRecorderProps {
  onFlashcardsGenerated: (flashcards: Flashcard[], transcript: string) => void;
}

export const LectureRecorder: React.FC<LectureRecorderProps> = ({ onFlashcardsGenerated }) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [lectureTitle, setLectureTitle] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { transcribeAndGenerate, generateFromTranscript, loading, error } = useFlashcards();

  // Timer effect
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Process the recording
        await processRecording(audioBlob);
      };

      // Start recording
      mediaRecorder.start();
      setRecordingState('recording');
      setDuration(0);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Failed to start recording. Please ensure microphone permissions are granted.');
      setRecordingState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecordingState('processing');
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    if (!lectureTitle.trim()) {
      alert('Please enter a lecture title');
      setRecordingState('idle');
      return;
    }

    try {
      setRecordingState('processing');
      
      // Transcribe and generate flashcards
      const result = await transcribeAndGenerate(audioBlob, lectureTitle, numFlashcards);
      
      if (result) {
        setTranscript(result.transcript);
        onFlashcardsGenerated(result.flashcards, result.transcript);
        setRecordingState('completed');
      } else {
        setRecordingState('error');
      }
    } catch (err) {
      console.error('Error processing recording:', err);
      setRecordingState('error');
    }
  };

  const handleGenerateFromText = async () => {
    if (!transcript.trim() || !lectureTitle.trim()) {
      alert('Please enter both lecture title and transcript');
      return;
    }

    try {
      const result = await generateFromTranscript({
        transcript: transcript,
        lecture_title: lectureTitle,
        num_flashcards: numFlashcards
      });
      
      if (result) {
        onFlashcardsGenerated(result.flashcards, transcript);
        setRecordingState('completed');
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
    }
  };

  const resetRecorder = () => {
    setRecordingState('idle');
    setDuration(0);
    setTranscript('');
    chunksRef.current = [];
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-4">
          <i className="bi bi-mic-fill me-2"></i>
          Record Lecture
        </h4>

        {/* Lecture Title Input */}
        <Form.Group className="mb-3">
          <Form.Label>Lecture Title *</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., Introduction to Binary Search Trees"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            disabled={recordingState === 'recording' || recordingState === 'processing'}
          />
        </Form.Group>

        {/* Number of Flashcards */}
        <Form.Group className="mb-4">
          <Form.Label>Number of Flashcards: {numFlashcards}</Form.Label>
          <Form.Range
            min={5}
            max={30}
            value={numFlashcards}
            onChange={(e) => setNumFlashcards(parseInt(e.target.value))}
            disabled={recordingState === 'recording' || recordingState === 'processing'}
          />
          <Form.Text className="text-muted">
            Generate between 5-30 flashcards from your lecture
          </Form.Text>
        </Form.Group>

        {/* Recording Controls */}
        <div className="text-center mb-4">
          {recordingState === 'idle' && (
            <Button
              variant="danger"
              size="lg"
              onClick={startRecording}
              disabled={!lectureTitle.trim()}
              className="px-5 py-3"
            >
              <i className="bi bi-mic-fill me-2"></i>
              Start Recording
            </Button>
          )}

          {recordingState === 'recording' && (
            <div>
              <div className="mb-3">
                <div
                  className="bg-danger rounded-circle d-inline-block"
                  style={{
                    width: '80px',
                    height: '80px',
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  <i className="bi bi-mic-fill text-white" style={{ fontSize: '40px', lineHeight: '80px' }}></i>
                </div>
              </div>
              <h2 className="text-danger mb-3">{formatDuration(duration)}</h2>
              <Button
                variant="outline-danger"
                size="lg"
                onClick={stopRecording}
                className="px-5"
              >
                <i className="bi bi-stop-circle me-2"></i>
                Stop Recording
              </Button>
            </div>
          )}

          {recordingState === 'processing' && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h5 className="text-muted">Processing your lecture...</h5>
              <p className="text-muted small">Transcribing audio and generating flashcards</p>
              <ProgressBar animated now={100} variant="primary" className="mt-3" />
            </div>
          )}

          {recordingState === 'completed' && (
            <div>
              <Alert variant="success">
                <i className="bi bi-check-circle-fill me-2"></i>
                Flashcards generated successfully!
              </Alert>
              <Button variant="outline-primary" onClick={resetRecorder}>
                <i className="bi bi-arrow-repeat me-2"></i>
                Record Another Lecture
              </Button>
            </div>
          )}

          {recordingState === 'error' && (
            <div>
              <Alert variant="danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error || 'Failed to process recording. Please try again.'}
              </Alert>
              <Button variant="outline-danger" onClick={resetRecorder}>
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Or Type Transcript */}
        {recordingState === 'idle' && (
          <div className="mt-4 pt-4 border-top">
            <h6 className="text-muted mb-3">Or paste your transcript manually:</h6>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Paste your lecture transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="outline-primary"
              onClick={handleGenerateFromText}
              disabled={!transcript.trim() || !lectureTitle.trim() || loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-lightning-fill me-2"></i>
                  Generate Flashcards from Text
                </>
              )}
            </Button>
          </div>
        )}

        {/* Display Transcript */}
        {transcript && recordingState !== 'idle' && (
          <div className="mt-4 pt-4 border-top">
            <h6 className="mb-3">Transcript:</h6>
            <Card className="bg-light">
              <Card.Body>
                <p className="small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {transcript}
                </p>
              </Card.Body>
            </Card>
          </div>
        )}
      </Card.Body>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </Card>
  );
};

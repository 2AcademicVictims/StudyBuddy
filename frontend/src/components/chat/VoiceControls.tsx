/**
 * VoiceControls Component
 * Handles voice input using Web Speech API
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert } from 'react-bootstrap';

interface VoiceControlsProps {
  isConnected: boolean;
  onTranscript: (text: string) => void;
  onResponse: (text: string) => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({ 
  isConnected, 
  onTranscript,
  onResponse 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results
      setTranscript(interimTranscript || finalTranscript);

      // Send final transcript
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
        setTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isConnected) {
      setError('Please connect to start voice chat');
      return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    }
  };

  // Speak text using Speech Synthesis API
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Note: onResponse function is passed to parent component
  // Parent component handles auto-speaking of responses

  return (
    <div className="text-center mt-4">
      {error && (
        <Alert variant="warning" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Button
        variant={isListening ? 'danger' : 'primary'}
        size="lg"
        onClick={toggleListening}
        disabled={!isConnected}
        className="px-5 py-3"
        style={{
          borderRadius: '50px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: isListening ? '0 0 20px rgba(220, 53, 69, 0.5)' : 'none'
        }}
      >
        {isListening ? (
          <>
            🔴 Listening...
          </>
        ) : (
          <>
            🎤 Click to Speak
          </>
        )}
      </Button>

      {transcript && (
        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted">You're saying:</small>
          <div className="fw-bold">{transcript}</div>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;

// Export speak function for use in parent component
export const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

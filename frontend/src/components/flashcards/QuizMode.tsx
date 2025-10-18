import React, { useState, useEffect } from 'react';
import { Card, Button, ButtonGroup, Badge, ProgressBar, Alert, Form } from 'react-bootstrap';
import { Flashcard, QuizStats } from '../../types/flashcard.types';

interface QuizModeProps {
  flashcards: Flashcard[];
  onExit?: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ flashcards, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [stats, setStats] = useState<QuizStats>({
    correct: 0,
    incorrect: 0,
    remaining: flashcards.length,
    total: flashcards.length
  });
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);

  // Speech Recognition
  const [recognition, setRecognition] = useState<any>(null);

  // Speech Synthesis
  const synth = window.speechSynthesis;

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      // Cleanup
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  const currentCard = flashcards[currentIndex];

  const startVoiceInput = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser. Please type your answer.');
    }
  };

  const stopVoiceInput = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (synth) {
      // Cancel any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      synth.speak(utterance);
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    // Speak the correct answer
    speakText(`The answer is: ${currentCard.answer}`);
  };

  const handleMarkCorrect = () => {
    setStats(prev => ({
      ...prev,
      correct: prev.correct + 1,
      remaining: prev.remaining - 1
    }));
    setAnsweredCards(prev => {
      const newSet = new Set(prev);
      newSet.add(currentIndex);
      return newSet;
    });
    moveToNext();
  };

  const handleMarkIncorrect = () => {
    setStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      remaining: prev.remaining - 1
    }));
    setAnsweredCards(prev => {
      const newSet = new Set(prev);
      newSet.add(currentIndex);
      return newSet;
    });
    moveToNext();
  };

  const moveToNext = () => {
    setShowAnswer(false);
    setUserAnswer('');
    
    // Find next unanswered card
    let nextIndex = currentIndex + 1;
    while (nextIndex < flashcards.length && answeredCards.has(nextIndex)) {
      nextIndex++;
    }

    if (nextIndex >= flashcards.length) {
      // Look from beginning
      nextIndex = 0;
      while (nextIndex < currentIndex && answeredCards.has(nextIndex)) {
        nextIndex++;
      }
      
      if (answeredCards.has(nextIndex)) {
        // All cards answered
        setQuizComplete(true);
        return;
      }
    }

    setCurrentIndex(nextIndex);
  };

  const handleSkip = () => {
    moveToNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
    setStats({
      correct: 0,
      incorrect: 0,
      remaining: flashcards.length,
      total: flashcards.length
    });
    setAnsweredCards(new Set());
    setQuizComplete(false);
  };

  const readQuestion = () => {
    speakText(currentCard.question);
  };

  if (flashcards.length === 0) {
    return (
      <Card className="text-center py-5">
        <Card.Body>
          <i className="bi bi-question-circle text-muted" style={{ fontSize: '4rem' }}></i>
          <h5 className="mt-3 text-muted">No flashcards available</h5>
          <p className="text-muted">Generate some flashcards first</p>
        </Card.Body>
      </Card>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((stats.correct / stats.total) * 100);
    
    return (
      <Card className="shadow-sm text-center py-5">
        <Card.Body>
          <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '5rem' }}></i>
          <h2 className="mt-4">Quiz Complete!</h2>
          
          <div className="row mt-4">
            <div className="col-md-4">
              <h1 className="text-success">{stats.correct}</h1>
              <p className="text-muted">Correct</p>
            </div>
            <div className="col-md-4">
              <h1 className="text-danger">{stats.incorrect}</h1>
              <p className="text-muted">Incorrect</p>
            </div>
            <div className="col-md-4">
              <h1 className="text-primary">{percentage}%</h1>
              <p className="text-muted">Score</p>
            </div>
          </div>

          {percentage >= 80 && (
            <Alert variant="success" className="mt-4">
              <i className="bi bi-star-fill me-2"></i>
              Excellent work! You've mastered this material!
            </Alert>
          )}
          {percentage >= 60 && percentage < 80 && (
            <Alert variant="info" className="mt-4">
              <i className="bi bi-hand-thumbs-up me-2"></i>
              Good job! Keep practicing to improve further.
            </Alert>
          )}
          {percentage < 60 && (
            <Alert variant="warning" className="mt-4">
              <i className="bi bi-book me-2"></i>
              Keep studying! Review the material and try again.
            </Alert>
          )}

          <div className="mt-4">
            <Button variant="primary" size="lg" onClick={handleRestart} className="me-2">
              <i className="bi bi-arrow-repeat me-2"></i>
              Retry Quiz
            </Button>
            {onExit && (
              <Button variant="outline-secondary" size="lg" onClick={onExit}>
                Exit Quiz
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  }

  const progressPercentage = ((stats.total - stats.remaining) / stats.total) * 100;

  return (
    <div className="quiz-mode-container">
      {/* Stats Bar */}
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <Badge bg="success" className="me-2">✓ {stats.correct}</Badge>
              <Badge bg="danger" className="me-2">✗ {stats.incorrect}</Badge>
              <Badge bg="secondary">{stats.remaining} remaining</Badge>
            </div>
            <div>
              <small className="text-muted">
                Question {currentIndex + 1} of {stats.total}
              </small>
            </div>
          </div>
          <ProgressBar 
            now={progressPercentage} 
            variant={progressPercentage > 66 ? 'success' : progressPercentage > 33 ? 'warning' : 'danger'}
          />
        </Card.Body>
      </Card>

      {/* Question Card */}
      <Card className="shadow-lg mb-4" style={{ minHeight: '300px' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-3">
            <Badge bg="primary" className="px-3 py-2">
              <i className="bi bi-question-circle me-2"></i>Question
            </Badge>
          </div>
          
          <h2 className="text-center mb-4">{currentCard.question}</h2>

          <div className="text-center">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={readQuestion}
            >
              <i className="bi bi-volume-up me-2"></i>
              Read Question Aloud
            </Button>
          </div>

          {!showAnswer && (
            <div className="mt-4">
              <Form.Group className="mb-3">
                <Form.Label>Your Answer:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer or use voice input..."
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-center">
                {recognition && (
                  <Button
                    variant={isListening ? 'danger' : 'primary'}
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                  >
                    <i className={`bi ${isListening ? 'bi-mic-mute' : 'bi-mic'} me-2`}></i>
                    {isListening ? 'Stop Listening' : 'Voice Input'}
                  </Button>
                )}
                <Button
                  variant="success"
                  onClick={handleRevealAnswer}
                >
                  <i className="bi bi-eye me-2"></i>
                  Reveal Answer
                </Button>
              </div>
            </div>
          )}

          {showAnswer && (
            <div className="mt-4">
              <Alert variant="info">
                <div className="mb-2">
                  <strong>Correct Answer:</strong>
                </div>
                <p className="mb-0">{currentCard.answer}</p>
              </Alert>

              {userAnswer && (
                <Alert variant="light">
                  <div className="mb-2">
                    <strong>Your Answer:</strong>
                  </div>
                  <p className="mb-0">{userAnswer}</p>
                </Alert>
              )}

              <div className="text-center mt-3">
                <p className="text-muted mb-3">Did you get it right?</p>
                <ButtonGroup size="lg">
                  <Button variant="success" onClick={handleMarkCorrect}>
                    <i className="bi bi-check-circle me-2"></i>
                    Correct
                  </Button>
                  <Button variant="danger" onClick={handleMarkIncorrect}>
                    <i className="bi bi-x-circle me-2"></i>
                    Incorrect
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between">
        <Button variant="outline-warning" onClick={handleSkip}>
          <i className="bi bi-skip-forward me-2"></i>
          Skip
        </Button>
        <Button variant="outline-secondary" onClick={handleRestart}>
          <i className="bi bi-arrow-repeat me-2"></i>
          Restart Quiz
        </Button>
        {onExit && (
          <Button variant="outline-danger" onClick={onExit}>
            <i className="bi bi-x-circle me-2"></i>
            Exit Quiz
          </Button>
        )}
      </div>

      {isListening && (
        <Alert variant="primary" className="mt-3 text-center">
          <i className="bi bi-mic-fill me-2"></i>
          Listening... Speak now!
        </Alert>
      )}
    </div>
  );
};

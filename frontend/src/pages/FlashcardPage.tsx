import React, { useState } from 'react';
import { Container, Row, Col, Nav, Card, Alert } from 'react-bootstrap';
import { LectureRecorder } from '../components/flashcards/LectureRecorder';
import { FlashcardDisplay } from '../components/flashcards/FlashcardDisplay';
import { QuizMode } from '../components/flashcards/QuizMode';
import { FlashcardList } from '../components/flashcards/FlashcardList';
import { Flashcard, FlashcardMode } from '../types/flashcard.types';

export const FlashcardPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<FlashcardMode>('record');
  const [currentFlashcards, setCurrentFlashcards] = useState<Flashcard[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  const handleFlashcardsGenerated = (flashcards: Flashcard[], transcript: string) => {
    setCurrentFlashcards(flashcards);
    setCurrentTranscript(transcript);
    setActiveMode('review');
  };

  const handleSelectLecture = (flashcards: Flashcard[], lectureTitle: string) => {
    setCurrentFlashcards(flashcards);
    setActiveMode('review');
  };

  const handleSelectFlashcard = (flashcard: Flashcard) => {
    setCurrentFlashcards([flashcard]);
    setActiveMode('review');
  };

  const handleStartQuiz = () => {
    if (currentFlashcards.length > 0) {
      setActiveMode('quiz');
    } else {
      alert('Please generate or select flashcards first');
    }
  };

  const handleExitQuiz = () => {
    setActiveMode('review');
  };

  const getModeIcon = (mode: FlashcardMode): string => {
    switch (mode) {
      case 'record': return 'bi-mic-fill';
      case 'review': return 'bi-card-list';
      case 'quiz': return 'bi-question-circle';
      case 'list': return 'bi-collection';
      default: return 'bi-circle';
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 mb-2">
            <i className="bi bi-lightbulb-fill text-warning me-3"></i>
            Lecture Flashcards
          </h1>
          <p className="text-muted">
            Record lectures, generate flashcards with AI, and quiz yourself with voice interaction
          </p>
        </Col>
      </Row>

      {/* Mode Navigation */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-row">
                <Nav.Item className="flex-fill">
                  <Nav.Link
                    active={activeMode === 'record'}
                    onClick={() => setActiveMode('record')}
                    className="text-center rounded-0 border-end"
                  >
                    <i className={`${getModeIcon('record')} me-2`}></i>
                    <span className="d-none d-md-inline">Record Lecture</span>
                    <span className="d-inline d-md-none">Record</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill">
                  <Nav.Link
                    active={activeMode === 'review'}
                    onClick={() => setActiveMode('review')}
                    className="text-center rounded-0 border-end"
                    disabled={currentFlashcards.length === 0}
                  >
                    <i className={`${getModeIcon('review')} me-2`}></i>
                    <span className="d-none d-md-inline">Review Cards</span>
                    <span className="d-inline d-md-none">Review</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill">
                  <Nav.Link
                    active={activeMode === 'quiz'}
                    onClick={handleStartQuiz}
                    className="text-center rounded-0 border-end"
                    disabled={currentFlashcards.length === 0}
                  >
                    <i className={`${getModeIcon('quiz')} me-2`}></i>
                    <span className="d-none d-md-inline">Quiz Mode</span>
                    <span className="d-inline d-md-none">Quiz</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill">
                  <Nav.Link
                    active={activeMode === 'list'}
                    onClick={() => setActiveMode('list')}
                    className="text-center rounded-0"
                  >
                    <i className={`${getModeIcon('list')} me-2`}></i>
                    <span className="d-none d-md-inline">My Flashcards</span>
                    <span className="d-inline d-md-none">List</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Content Area */}
      <Row>
        <Col lg={12}>
          {activeMode === 'record' && (
            <div>
              <LectureRecorder onFlashcardsGenerated={handleFlashcardsGenerated} />
              
              {/* Quick Tips */}
              <Alert variant="info" className="mt-4">
                <h6>
                  <i className="bi bi-info-circle me-2"></i>
                  Recording Tips:
                </h6>
                <ul className="mb-0 small">
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Focus on key concepts, definitions, and important facts</li>
                  <li>Aim for at least 2-3 minutes of content for best results</li>
                  <li>You can also paste a transcript instead of recording</li>
                </ul>
              </Alert>
            </div>
          )}

          {activeMode === 'review' && (
            <div>
              {currentFlashcards.length > 0 ? (
                <>
                  <FlashcardDisplay
                    flashcards={currentFlashcards}
                    onUpdate={setCurrentFlashcards}
                    showControls={true}
                  />
                  
                  <div className="text-center mt-4">
                    <Alert variant="success">
                      <p className="mb-2">
                        <strong>Ready to test your knowledge?</strong>
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={handleStartQuiz}
                      >
                        <i className="bi bi-play-circle me-2"></i>
                        Start Quiz Mode
                      </button>
                    </Alert>
                  </div>
                </>
              ) : (
                <Card className="text-center py-5">
                  <Card.Body>
                    <i className="bi bi-collection text-muted" style={{ fontSize: '5rem' }}></i>
                    <h4 className="mt-3 text-muted">No flashcards to review</h4>
                    <p className="text-muted mb-4">
                      Record a lecture or select flashcards from your collection
                    </p>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => setActiveMode('record')}
                    >
                      <i className="bi bi-mic-fill me-2"></i>
                      Record Lecture
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setActiveMode('list')}
                    >
                      <i className="bi bi-collection me-2"></i>
                      Browse Flashcards
                    </button>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}

          {activeMode === 'quiz' && (
            <div>
              <QuizMode
                flashcards={currentFlashcards}
                onExit={handleExitQuiz}
              />
              
              {/* Quiz Tips */}
              <Alert variant="primary" className="mt-4">
                <h6>
                  <i className="bi bi-lightbulb me-2"></i>
                  Quiz Tips:
                </h6>
                <ul className="mb-0 small">
                  <li>Use voice input for hands-free studying</li>
                  <li>The correct answer will be read aloud when revealed</li>
                  <li>Be honest when marking correct/incorrect for accurate statistics</li>
                  <li>Review incorrectly answered cards after completing the quiz</li>
                </ul>
              </Alert>
            </div>
          )}

          {activeMode === 'list' && (
            <div>
              <FlashcardList
                onSelectFlashcard={handleSelectFlashcard}
                onSelectLecture={handleSelectLecture}
              />
              
              {/* Export Info */}
              <Alert variant="secondary" className="mt-4">
                <h6>
                  <i className="bi bi-download me-2"></i>
                  Export to Anki
                </h6>
                <p className="mb-0 small">
                  Click "Export to Anki" to download your flashcards as a CSV file.
                  Import this file into Anki desktop app: File → Import → Select the CSV file.
                </p>
              </Alert>
            </div>
          )}
        </Col>
      </Row>

      {/* Feature Info Footer */}
      <Row className="mt-5 pt-4 border-top">
        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 bg-light">
            <Card.Body className="text-center">
              <i className="bi bi-mic-fill text-primary" style={{ fontSize: '2rem' }}></i>
              <h6 className="mt-3">Voice Recording</h6>
              <p className="small text-muted mb-0">
                Record lectures directly from your browser or paste transcripts
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 bg-light">
            <Card.Body className="text-center">
              <i className="bi bi-stars text-warning" style={{ fontSize: '2rem' }}></i>
              <h6 className="mt-3">AI-Powered</h6>
              <p className="small text-muted mb-0">
                Claude AI automatically generates high-quality flashcards from your lectures
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 bg-light">
            <Card.Body className="text-center">
              <i className="bi bi-chat-dots text-success" style={{ fontSize: '2rem' }}></i>
              <h6 className="mt-3">Voice Quiz</h6>
              <p className="small text-muted mb-0">
                Practice with voice input and hear correct answers read aloud
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

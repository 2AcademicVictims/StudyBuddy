import React, { useState } from 'react';
import { Card, Button, ButtonGroup, Badge, Modal, Form } from 'react-bootstrap';
import { Flashcard } from '../../types/flashcard.types';
import { useFlashcards } from '../../hooks/useFlashcards';

interface FlashcardDisplayProps {
  flashcards: Flashcard[];
  onUpdate?: (flashcards: Flashcard[]) => void;
  showControls?: boolean;
}

export const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  flashcards,
  onUpdate,
  showControls = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  
  const { updateFlashcard, deleteFlashcard, createFlashcard } = useFlashcards();

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card className="text-center py-5">
        <Card.Body>
          <i className="bi bi-stack text-muted" style={{ fontSize: '4rem' }}></i>
          <h5 className="mt-3 text-muted">No flashcards yet</h5>
          <p className="text-muted">Record a lecture to generate flashcards</p>
        </Card.Body>
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleEdit = () => {
    setEditQuestion(currentCard.question);
    setEditAnswer(currentCard.answer);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await updateFlashcard(currentCard.id, {
        question: editQuestion,
        answer: editAnswer
      });
      
      if (updated && onUpdate) {
        const newFlashcards = [...flashcards];
        newFlashcards[currentIndex] = updated;
        onUpdate(newFlashcards);
      }
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating flashcard:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      try {
        const success = await deleteFlashcard(currentCard.id);
        
        if (success && onUpdate) {
          const newFlashcards = flashcards.filter((_, idx) => idx !== currentIndex);
          onUpdate(newFlashcards);
          
          // Adjust current index if needed
          if (currentIndex >= newFlashcards.length && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          setIsFlipped(false);
        }
      } catch (err) {
        console.error('Error deleting flashcard:', err);
      }
    }
  };

  const handleSave = async () => {
    try {
      await createFlashcard({
        question: currentCard.question,
        answer: currentCard.answer,
        lecture_title: currentCard.lecture_title,
      });
      alert('Flashcard saved successfully!');
    } catch (err) {
      console.error('Error saving flashcard:', err);
      alert('Failed to save flashcard');
    }
  };

  return (
    <div className="flashcard-display-container">
      {/* Progress Indicator */}
      <div className="text-center mb-3">
        <Badge bg="primary" className="px-3 py-2">
          Card {currentIndex + 1} of {flashcards.length}
        </Badge>
      </div>

      {/* Flashcard */}
      <div className="flashcard-wrapper" onClick={handleFlip}>
        <Card
          className={`flashcard shadow-lg ${isFlipped ? 'flipped' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <Card.Body className="d-flex align-items-center justify-content-center p-5">
            <div className="flashcard-content">
              <div className="flashcard-front">
                <div className="mb-3">
                  <Badge bg="info">Question</Badge>
                </div>
                <h3 className="text-center">{currentCard.question}</h3>
                <p className="text-muted text-center mt-4 small">
                  <i className="bi bi-hand-index me-2"></i>
                  Click to reveal answer
                </p>
              </div>
              <div className="flashcard-back">
                <div className="mb-3">
                  <Badge bg="success">Answer</Badge>
                </div>
                <h4 className="text-center">{currentCard.answer}</h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button
          variant="outline-primary"
          onClick={handlePrevious}
          disabled={flashcards.length <= 1}
        >
          <i className="bi bi-chevron-left"></i> Previous
        </Button>

        <ButtonGroup>
          <Button variant="outline-secondary" onClick={handleFlip}>
            <i className="bi bi-arrow-repeat"></i> Flip
          </Button>
        </ButtonGroup>

        <Button
          variant="outline-primary"
          onClick={handleNext}
          disabled={flashcards.length <= 1}
        >
          Next <i className="bi bi-chevron-right"></i>
        </Button>
      </div>

      {/* Action Buttons */}
      {showControls && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <Button variant="outline-primary" size="sm" onClick={handleEdit}>
            <i className="bi bi-pencil me-1"></i> Edit
          </Button>
          <Button variant="outline-success" size="sm" onClick={handleSave}>
            <i className="bi bi-save me-1"></i> Save
          </Button>
          <Button variant="outline-danger" size="sm" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i> Delete
          </Button>
        </div>
      )}

      {/* Lecture Title */}
      <div className="text-center mt-3">
        <small className="text-muted">
          <i className="bi bi-book me-1"></i>
          {currentCard.lecture_title}
        </small>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Flashcard</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Question</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Answer</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .flashcard-wrapper {
          perspective: 1000px;
          min-height: 400px;
        }

        .flashcard {
          transition: transform 0.6s;
          transform-style: preserve-3d;
          min-height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .flashcard.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-content {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .flashcard-front,
        .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .flashcard-back {
          transform: rotateY(180deg);
        }

        .flashcard h3,
        .flashcard h4 {
          color: white;
        }

        .flashcard .badge {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

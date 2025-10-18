import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Flashcard } from '../../types/flashcard.types';
import { useFlashcards } from '../../hooks/useFlashcards';

interface FlashcardListProps {
  onSelectFlashcard?: (flashcard: Flashcard) => void;
  onSelectLecture?: (flashcards: Flashcard[], lectureTitle: string) => void;
}

export const FlashcardList: React.FC<FlashcardListProps> = ({
  onSelectFlashcard,
  onSelectLecture
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLecture, setFilterLecture] = useState('');
  
  const {
    flashcards,
    loading,
    error,
    fetchFlashcards,
    deleteFlashcard,
    exportToAnki
  } = useFlashcards();

  useEffect(() => {
    // Load flashcards on mount
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleSearch = () => {
    fetchFlashcards(undefined, searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      await deleteFlashcard(id);
      fetchFlashcards(undefined, filterLecture);
    }
  };

  const handleExport = () => {
    exportToAnki(undefined, filterLecture);
  };

  // Group flashcards by lecture title
  const groupedFlashcards = flashcards.reduce((acc, card) => {
    const title = card.lecture_title;
    if (!acc[title]) {
      acc[title] = [];
    }
    acc[title].push(card);
    return acc;
  }, {} as Record<string, Flashcard[]>);

  const lectureStats = Object.entries(groupedFlashcards).map(([title, cards]) => ({
    title,
    count: cards.length,
    date: cards[0]?.created_at ? new Date(cards[0].created_at).toLocaleDateString() : 'Unknown'
  }));

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = searchTerm === '' ||
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLecture = filterLecture === '' ||
      card.lecture_title.toLowerCase().includes(filterLecture.toLowerCase());
    
    return matchesSearch && matchesLecture;
  });

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>
            <i className="bi bi-collection me-2"></i>
            My Flashcards
          </h4>
          <div>
            <Button variant="outline-primary" size="sm" onClick={handleExport} className="me-2">
              <i className="bi bi-download me-1"></i>
              Export to Anki
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => fetchFlashcards()}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="row mb-4">
          <div className="col-md-6">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="primary" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
          </div>
          <div className="col-md-6">
            <Form.Control
              type="text"
              placeholder="Filter by lecture title..."
              value={filterLecture}
              onChange={(e) => setFilterLecture(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading flashcards...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {!loading && !error && flashcards.length === 0 && (
          <Alert variant="info" className="text-center py-5">
            <i className="bi bi-info-circle me-2"></i>
            No flashcards found. Start by recording a lecture!
          </Alert>
        )}

        {!loading && !error && flashcards.length > 0 && (
          <>
            {/* Lecture Summary Cards */}
            {lectureStats.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted mb-3">Lectures</h6>
                <div className="row">
                  {lectureStats.map((lecture) => (
                    <div key={lecture.title} className="col-md-4 mb-3">
                      <Card 
                        className="h-100 cursor-pointer hover-shadow"
                        onClick={() => onSelectLecture && onSelectLecture(groupedFlashcards[lecture.title], lecture.title)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body>
                          <h6 className="mb-2">{lecture.title}</h6>
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg="primary">{lecture.count} cards</Badge>
                            <small className="text-muted">{lecture.date}</small>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flashcards Table */}
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '35%' }}>Question</th>
                    <th style={{ width: '35%' }}>Answer</th>
                    <th style={{ width: '15%' }}>Lecture</th>
                    <th style={{ width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlashcards.map((card, index) => (
                    <tr key={card.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div 
                          className="text-truncate" 
                          style={{ maxWidth: '300px', cursor: 'pointer' }}
                          onClick={() => onSelectFlashcard && onSelectFlashcard(card)}
                          title={card.question}
                        >
                          {card.question}
                        </div>
                      </td>
                      <td>
                        <div 
                          className="text-truncate" 
                          style={{ maxWidth: '300px' }}
                          title={card.answer}
                        >
                          {card.answer}
                        </div>
                      </td>
                      <td>
                        <Badge bg="secondary" className="text-truncate" style={{ maxWidth: '150px' }}>
                          {card.lecture_title}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onSelectFlashcard && onSelectFlashcard(card)}
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(card.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {filteredFlashcards.length === 0 && searchTerm && (
              <Alert variant="warning" className="text-center">
                <i className="bi bi-search me-2"></i>
                No flashcards match your search criteria
              </Alert>
            )}

            {/* Summary Stats */}
            <div className="mt-4 text-center text-muted">
              <small>
                Showing {filteredFlashcards.length} of {flashcards.length} flashcard(s)
                {lectureStats.length > 0 && ` across ${lectureStats.length} lecture(s)`}
              </small>
            </div>
          </>
        )}
      </Card.Body>

      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          transition: all 0.2s ease-in-out;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Card>
  );
};

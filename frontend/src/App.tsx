import React, { useState } from 'react';
import { Container, Card, Nav } from 'react-bootstrap';
import ChatPage from './pages/ChatPage';
import { FlashcardPage } from './pages/FlashcardPage';

function App() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <StudyBuddyUI />
    </div>
  );
}

function StudyBuddyUI() {
  const [currentPage, setCurrentPage] = useState('chat');

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center text-white mb-5">
        <h1 className="display-3 fw-bold mb-3">
          🎓 Multi-LLM Study Buddy
        </h1>
        <p className="lead">
          Your intelligent study companion powered by 4 AI models
        </p>
      </div>

      {/* Navigation Tabs */}
      <Card className="mb-4">
        <Card.Header>
          <Nav variant="tabs" defaultActiveKey="chat">
            <Nav.Item>
              <Nav.Link 
                eventKey="chat" 
                onClick={() => setCurrentPage('chat')}
                active={currentPage === 'chat'}
              >
                💬 Multi-LLM Chat
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="flashcards" 
                onClick={() => setCurrentPage('flashcards')}
                active={currentPage === 'flashcards'}
              >
                📚 Lecture Flashcards
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
      </Card>

      {/* Chat Page */}
      {currentPage === 'chat' && <ChatPage />}

      {/* Flashcards Page */}
      {currentPage === 'flashcards' && <FlashcardPage />}
    </Container>
  );
}

export default App;

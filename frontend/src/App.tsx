import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav } from 'react-bootstrap';
import { PipecatClient } from "@pipecat-ai/client-js";
import { PipecatClientProvider, PipecatClientAudio } from "@pipecat-ai/client-react";
import { DailyTransport } from "@pipecat-ai/daily-transport";

// Create Pipecat client
const client = new PipecatClient({
  transport: new DailyTransport(),
  enableMic: true,
  enableCam: false,
});

interface Message {
  role: 'user' | 'assistant';
  text: string;
  model?: string;
  timestamp: Date;
}

function App() {
  return (
    <PipecatClientProvider client={client}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <StudyBuddyUI />
        <PipecatClientAudio />
      </div>
    </PipecatClientProvider>
  );
}

function StudyBuddyUI() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState('chat');

  const handleConnect = async () => {
    try {
      await client.startBotAndConnect({
        endpoint: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:7860'}/connect`
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect. Make sure backend is running!');
    }
  };

  const handleDisconnect = async () => {
    await client.disconnect();
    setIsConnected(false);
  };

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
      {currentPage === 'chat' && (
        <>
          {/* Connection Status Card */}
          <Card className="mb-4 shadow">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6} className="d-flex align-items-center">
                  <div 
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: isConnected ? '#28a745' : '#6c757d',
                      marginRight: '12px',
                      animation: isConnected ? 'pulse 2s infinite' : 'none'
                    }}
                  />
                  <h5 className="mb-0">
                    {isConnected ? 'Connected & Listening' : 'Not Connected'}
                  </h5>
                </Col>
                <Col md={6} className="text-end">
                  {!isConnected ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={handleConnect}
                    >
                      🎤 Start Voice Chat
                    </Button>
                  ) : (
                    <Button 
                      variant="danger" 
                      size="lg" 
                      onClick={handleDisconnect}
                    >
                      🛑 Stop
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Model Cards */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Card className="h-100 shadow-sm" style={{ backgroundColor: '#f8f4ff', borderColor: '#9b59b6' }}>
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }}>💻</div>
                  <Card.Title className="fw-bold">Claude</Card.Title>
                  <Card.Text className="text-muted small">
                    Technical Questions
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm" style={{ backgroundColor: '#f0fff4', borderColor: '#48bb78' }}>
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }}>✨</div>
                  <Card.Title className="fw-bold">ChatGPT</Card.Title>
                  <Card.Text className="text-muted small">
                    Creative Tasks
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm" style={{ backgroundColor: '#eff6ff', borderColor: '#4299e1' }}>
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }}>📚</div>
                  <Card.Title className="fw-bold">Gemini</Card.Title>
                  <Card.Text className="text-muted small">
                    Factual Info
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm" style={{ backgroundColor: '#fffaf0', borderColor: '#ed8936' }}>
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem' }}>⚡</div>
                  <Card.Title className="fw-bold">Groq</Card.Title>
                  <Card.Text className="text-muted small">
                    Quick Answers
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Conversation Display */}
          <Card className="shadow" style={{ minHeight: '400px' }}>
            <Card.Body>
              {messages.length === 0 ? (
                <div className="text-center text-muted" style={{ paddingTop: '100px' }}>
                  <div style={{ fontSize: '4rem' }}>👋</div>
                  <h4 className="mt-3">Start chatting to see messages here!</h4>
                  <p className="text-secondary">
                    Try: "Explain binary search trees" or "Help me brainstorm essay ideas"
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '12px 20px',
                          borderRadius: '20px',
                          backgroundColor: msg.role === 'user' ? '#667eea' : '#f1f3f5',
                          color: msg.role === 'user' ? 'white' : 'black'
                        }}
                      >
                        {msg.model && (
                          <Badge bg="secondary" className="mb-2" style={{ fontSize: '0.7rem' }}>
                            {msg.model}
                          </Badge>
                        )}
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Flashcards Page (Your partner will build this) */}
      {currentPage === 'flashcards' && (
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '5rem' }}>📚</div>
            <h3 className="mt-4">Lecture Flashcards Feature</h3>
            <p className="text-muted">
              Your partner will build the flashcard recording and generation here!
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default App;

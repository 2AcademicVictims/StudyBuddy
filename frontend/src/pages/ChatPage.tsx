/**
 * ChatPage Component
 * Main page for Multi-LLM Voice Chat feature
 */
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { useWebSocket } from '../hooks/useWebSocket';
import { ModelInfo } from '../types/chat.types';
import ModelCard from '../components/chat/ModelCard';
import ConversationDisplay from '../components/chat/ConversationDisplay';
import VoiceControls, { speakText } from '../components/chat/VoiceControls';

const ChatPage: React.FC = () => {
  // WebSocket connection
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
  const { isConnected, messages, sendMessage, connect, disconnect, clearMessages } = useWebSocket(wsUrl);
  
  // Text input and model selection state
  const [textInput, setTextInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('auto');

  // Model information
  const models: ModelInfo[] = [
    {
      name: 'Claude',
      icon: '💻',
      purpose: 'Technical Questions',
      bgColor: '#f8f4ff',
      borderColor: '#9b59b6',
    },
    {
      name: 'ChatGPT',
      icon: '✨',
      purpose: 'Creative Tasks',
      bgColor: '#f0fff4',
      borderColor: '#48bb78',
    },
    {
      name: 'Gemini',
      icon: '📚',
      purpose: 'Factual Info',
      bgColor: '#eff6ff',
      borderColor: '#4299e1',
    },
    {
      name: 'Groq',
      icon: '⚡',
      purpose: 'Quick Answers',
      bgColor: '#fffaf0',
      borderColor: '#ed8936',
    },
  ];

  // Handle voice transcript
  const handleTranscript = (text: string) => {
    const model = selectedModel === 'auto' ? undefined : selectedModel;
    sendMessage(text, model);
  };

  // Handle text input submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && isConnected) {
      const model = selectedModel === 'auto' ? undefined : selectedModel;
      sendMessage(textInput.trim(), model);
      setTextInput('');
    }
  };

  // Auto-speak assistant responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      speakText(lastMessage.text);
    }
  }, [messages]);

  return (
    <Container className="py-4">
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
                  animation: isConnected ? 'pulse 2s infinite' : 'none',
                }}
              />
              <h5 className="mb-0">
                {isConnected ? 'Connected & Ready' : 'Not Connected'}
              </h5>
            </Col>
            <Col md={6} className="text-end">
              {!isConnected ? (
                <Button variant="success" size="lg" onClick={connect}>
                  🔌 Connect
                </Button>
              ) : (
                <>
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={disconnect}
                    className="me-2"
                  >
                    🛑 Disconnect
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={clearMessages}
                  >
                    🗑️ Clear
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Model Cards */}
      <Row className="mb-4 g-3">
        {models.map((model) => (
          <Col md={3} key={model.name}>
            <ModelCard model={model} />
          </Col>
        ))}
      </Row>

      {/* Conversation Display */}
      <ConversationDisplay messages={messages} />

      {/* Text Input with Model Selection */}
      <Card className="mt-4 shadow">
        <Card.Body>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="fw-bold">Select AI Model:</Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                <Form.Check
                  inline
                  type="radio"
                  label="🤖 Auto-Select"
                  name="modelSelection"
                  id="model-auto"
                  checked={selectedModel === 'auto'}
                  onChange={() => setSelectedModel('auto')}
                  disabled={!isConnected}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="💻 Claude"
                  name="modelSelection"
                  id="model-claude"
                  checked={selectedModel === 'Claude'}
                  onChange={() => setSelectedModel('Claude')}
                  disabled={!isConnected}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="✨ ChatGPT"
                  name="modelSelection"
                  id="model-chatgpt"
                  checked={selectedModel === 'ChatGPT'}
                  onChange={() => setSelectedModel('ChatGPT')}
                  disabled={!isConnected}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="📚 Gemini"
                  name="modelSelection"
                  id="model-gemini"
                  checked={selectedModel === 'Gemini'}
                  onChange={() => setSelectedModel('Gemini')}
                  disabled={!isConnected}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="⚡ Groq"
                  name="modelSelection"
                  id="model-groq"
                  checked={selectedModel === 'Groq'}
                  onChange={() => setSelectedModel('Groq')}
                  disabled={!isConnected}
                />
              </div>
            </Col>
          </Row>
          <Form onSubmit={handleTextSubmit}>
            <InputGroup size="lg">
              <Form.Control
                type="text"
                placeholder="Type your message here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={!isConnected}
              />
              <Button 
                variant="primary" 
                type="submit"
                disabled={!isConnected || !textInput.trim()}
              >
                📤 Send
              </Button>
            </InputGroup>
          </Form>
          <small className="text-muted mt-2 d-block">
            {selectedModel === 'auto' 
              ? "Auto-select will choose the best AI based on your question"
              : `Your message will be sent to ${selectedModel}`
            }
          </small>
        </Card.Body>
      </Card>

      {/* Voice Controls */}
      <VoiceControls
        isConnected={isConnected}
        onTranscript={handleTranscript}
        onResponse={(text) => speakText(text)}
      />

      {/* Instructions */}
      {!isConnected && (
        <Card className="mt-4 bg-light">
          <Card.Body>
            <h5>📝 How to Use:</h5>
            <ol>
              <li>Click "Connect" to establish WebSocket connection</li>
              <li>Click "Click to Speak" and ask a question</li>
              <li>Your voice will be transcribed and sent to the appropriate AI model</li>
              <li>The response will be displayed and spoken back to you</li>
            </ol>
            <p className="mb-0 text-muted">
              <strong>Example questions:</strong>
              <br />• "How do I implement a binary search tree in Python?" (Claude)
              <br />• "Help me brainstorm ideas for a sci-fi story" (ChatGPT)
              <br />• "What is quantum entanglement?" (Gemini)
              <br />• "What's the weather like?" (Groq)
            </p>
          </Card.Body>
        </Card>
      )}

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
          }
        }
      `}</style>
    </Container>
  );
};

export default ChatPage;

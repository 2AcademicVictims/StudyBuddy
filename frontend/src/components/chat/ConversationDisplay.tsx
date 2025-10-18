/**
 * ConversationDisplay Component
 * Shows the full chat history with auto-scroll
 */
import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { Message } from '../../types/chat.types';
import MessageBubble from './MessageBubble';

interface ConversationDisplayProps {
  messages: Message[];
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="shadow" style={{ minHeight: '400px', maxHeight: '600px' }}>
      <Card.Body style={{ overflowY: 'auto' }}>
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
              <MessageBubble key={idx} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ConversationDisplay;

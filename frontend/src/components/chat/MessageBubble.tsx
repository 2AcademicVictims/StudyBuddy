/**
 * MessageBubble Component
 * Displays individual chat messages with model badges
 */
import React from 'react';
import { Badge } from 'react-bootstrap';
import { Message } from '../../types/chat.types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 20px',
          borderRadius: '20px',
          backgroundColor: isUser ? '#667eea' : '#f1f3f5',
          color: isUser ? 'white' : 'black',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {message.model && (
          <Badge 
            bg="secondary" 
            className="mb-2" 
            style={{ fontSize: '0.7rem' }}
          >
            {message.model}
          </Badge>
        )}
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.text}
        </div>
        <div 
          className="text-end mt-1" 
          style={{ 
            fontSize: '0.65rem', 
            opacity: 0.7 
          }}
        >
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

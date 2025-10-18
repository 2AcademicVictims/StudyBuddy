/**
 * ModelCard Component
 * Displays information about each AI model
 */
import React from 'react';
import { Card } from 'react-bootstrap';
import { ModelInfo } from '../../types/chat.types';

interface ModelCardProps {
  model: ModelInfo;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  return (
    <Card 
      className="h-100 shadow-sm" 
      style={{ 
        backgroundColor: model.bgColor, 
        borderColor: model.borderColor,
        borderWidth: '2px'
      }}
    >
      <Card.Body className="text-center">
        <div style={{ fontSize: '3rem' }}>{model.icon}</div>
        <Card.Title className="fw-bold mt-2">{model.name}</Card.Title>
        <Card.Text className="text-muted small">
          {model.purpose}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ModelCard;

/**
 * TypeScript interfaces for Multi-LLM Chat feature
 */

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  model?: string;
  timestamp: Date;
}

export interface ModelInfo {
  name: string;
  icon: string;
  purpose: string;
  bgColor: string;
  borderColor: string;
}

export interface WebSocketMessage {
  text: string;
  role: 'user' | 'assistant';
  model?: string;
  timestamp?: string;
}

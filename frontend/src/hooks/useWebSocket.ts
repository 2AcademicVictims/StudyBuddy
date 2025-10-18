/**
 * Custom WebSocket Hook for Multi-LLM Chat
 * Manages WebSocket connection, messages, and auto-reconnect
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, WebSocketMessage } from '../types/chat.types';

interface UseWebSocketReturn {
  ws: WebSocket | null;
  isConnected: boolean;
  messages: Message[];
  sendMessage: (text: string, model?: string) => void;
  connect: () => void;
  disconnect: () => void;
  clearMessages: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const shouldConnectRef = useRef(false);

  const connect = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    shouldConnectRef.current = true;

    try {
      const websocket = new WebSocket(url);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          const newMessage: Message = {
            role: data.role,
            text: data.text,
            model: data.model,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, newMessage]);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      websocket.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setWs(null);

        // Auto-reconnect if we should be connected
        if (shouldConnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      setWs(websocket);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setIsConnected(false);
    }
  }, [url, ws]);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws) {
      ws.close();
      setWs(null);
    }
    setIsConnected(false);
  }, [ws]);

  const sendMessage = useCallback(
    (text: string, model?: string) => {
      if (ws?.readyState === WebSocket.OPEN) {
        const message: WebSocketMessage = {
          text,
          role: 'user',
          model,
        };
        
        // Add user message to UI immediately
        const userMessage: Message = {
          role: 'user',
          text,
          model,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        
        // Send to server
        ws.send(JSON.stringify(message));
      } else {
        console.error('WebSocket is not connected');
      }
    },
    [ws]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldConnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  return {
    ws,
    isConnected,
    messages,
    sendMessage,
    connect,
    disconnect,
    clearMessages,
  };
};

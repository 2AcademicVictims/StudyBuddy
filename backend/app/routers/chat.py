"""
WebSocket Chat Router
Handles real-time voice chat communication with multi-LLM routing
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import logging
from app.services.llm_router import llm_router

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, client_id: str):
        """Remove WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_message(self, message: dict, client_id: str):
        """Send message to specific client"""
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(json.dumps(message))


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for voice chat
    Receives user messages, routes to appropriate LLM, and sends back responses
    """
    # Generate unique client ID
    client_id = id(websocket)
    
    await manager.connect(websocket, str(client_id))
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            logger.info(f"Received from {client_id}: {message_data}")
            
            # Extract user text and optional model selection
            user_text = message_data.get('text', '')
            selected_model = message_data.get('model', None)
            
            if not user_text:
                continue
            
            # Route to appropriate LLM (use selected model if provided)
            if selected_model:
                model_name, response_text = await llm_router.call_specific_model(selected_model, user_text)
            else:
                model_name, response_text = await llm_router.route_message(user_text)
            
            logger.info(f"Routed to {model_name}, response length: {len(response_text)}")
            
            # Send response back to client
            response_message = {
                'role': 'assistant',
                'text': response_text,
                'model': model_name,
                'timestamp': None  # Client will add timestamp
            }
            
            await manager.send_message(response_message, str(client_id))
            
    except WebSocketDisconnect:
        manager.disconnect(str(client_id))
        logger.info(f"Client {client_id} disconnected normally")
    except Exception as e:
        logger.error(f"Error in websocket for client {client_id}: {str(e)}")
        manager.disconnect(str(client_id))

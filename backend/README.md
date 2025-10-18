# Multi-LLM Chat Backend

## Overview

FastAPI backend with WebSocket support for real-time multi-LLM voice chat.

## Features

- WebSocket endpoint for real-time communication
- Intelligent routing to 4 different LLM providers
- Keyword-based model selection
- CORS enabled for frontend integration

## API Endpoints

### WebSocket

- **URL:** `ws://localhost:8000/ws`
- **Description:** Real-time chat endpoint
- **Message Format:**

  ```json
  // Send (client -> server)
  {
    "text": "Your question here",
    "role": "user"
  }

  // Receive (server -> client)
  {
    "text": "AI response here",
    "role": "assistant",
    "model": "Claude|ChatGPT|Gemini|Groq"
  }
  ```

### HTTP Endpoints

- **GET /** - Root endpoint with API info
- **GET /health** - Health check and API key status
- **GET /docs** - Interactive API documentation (Swagger UI)

## Setup

```powershell
# Create virtual environment
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
Copy-Item .env.example .env
# Edit .env with your API keys

# Run server
python main.py
```

Server runs on: http://localhost:8000

## LLM Routing Logic

### Claude (Technical)

**Keywords:** code, program, algorithm, database, sql, python, javascript, function, debug, class, method, api, framework, compile, syntax, variable, array, loop, data structure, linked list, binary tree, recursion, complexity, implement

### ChatGPT (Creative)

**Keywords:** idea, brainstorm, essay, write, story, creative, design, imagine, compose, draft, outline, thesis, argument, narrative, poem, blog, article, script, dialogue

### Gemini (Factual)

**Keywords:** define, what is, explain, meaning, concept, definition, who was, when did, where is, how does, theory, principle, law, rule, fact, history, science, mathematics, physics, chemistry

### Groq (Default)

All other queries route to Groq for quick responses.

## Environment Variables

Required in `.env` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
GROQ_API_KEY=...
```

## Development

```powershell
# Run with auto-reload
python main.py

# View logs
# Logs appear in terminal

# Test WebSocket
# Use frontend or WebSocket client tool
```

## Testing

Visit http://localhost:8000/docs for interactive API testing.

For WebSocket testing, use the frontend application or a WebSocket client like:

- wscat: `wscat -c ws://localhost:8000/ws`
- Browser console: `new WebSocket('ws://localhost:8000/ws')`

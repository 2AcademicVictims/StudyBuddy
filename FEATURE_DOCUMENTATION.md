# Multi-LLM Voice Chat Feature Documentation

## 🎯 Feature Overview

The Multi-LLM Voice Chat feature allows users to have voice conversations with AI that intelligently routes questions to the most appropriate model from 4 different LLM providers: Claude, ChatGPT, Gemini, and Groq.

## 🏗️ Architecture

### High-Level Flow

```
User speaks → Web Speech API → WebSocket → Backend Router → LLM API → Response → Text-to-Speech
```

### Technology Stack

**Frontend:**

- React 18 with TypeScript
- Bootstrap 5 for UI
- Web Speech API (speech-to-text)
- Speech Synthesis API (text-to-speech)
- WebSocket for real-time communication

**Backend:**

- FastAPI (Python)
- WebSocket endpoint
- Multi-LLM routing service
- 4 LLM provider integrations

## 📂 File Structure

### Backend Files

```
backend/
├── main.py                          # FastAPI app entry point
├── requirements.txt                 # Python dependencies
├── .env.example                     # API key template
├── .env                            # Your API keys (gitignored)
└── app/
    ├── routers/
    │   └── chat.py                 # WebSocket endpoint
    └── services/
        └── llm_router.py           # Multi-LLM routing logic
```

### Frontend Files

```
frontend/src/
├── App.tsx                         # Main app with navigation
├── pages/
│   └── ChatPage.tsx                # Main chat page
├── components/chat/
│   ├── ModelCard.tsx               # Display model info
│   ├── MessageBubble.tsx           # Individual messages
│   ├── ConversationDisplay.tsx     # Chat history
│   └── VoiceControls.tsx           # Voice input/output
├── hooks/
│   └── useWebSocket.ts             # WebSocket management
└── types/
    └── chat.types.ts               # TypeScript interfaces
```

## 🔧 Component Details

### 1. Backend: LLM Router (`llm_router.py`)

**Purpose:** Analyzes user input and routes to the appropriate LLM

**Routing Logic:**

- **Claude:** Technical questions (code, algorithms, programming)
- **ChatGPT:** Creative tasks (brainstorming, writing, stories)
- **Gemini:** Factual information (definitions, explanations, concepts)
- **Groq:** Quick queries (default for everything else)

**Key Methods:**

```python
async def route_message(text: str) -> Tuple[str, str]
    # Returns (model_name, response_text)

async def _call_claude(text: str) -> Tuple[str, str]
async def _call_chatgpt(text: str) -> Tuple[str, str]
async def _call_gemini(text: str) -> Tuple[str, str]
async def _call_groq(text: str) -> Tuple[str, str]
```

### 2. Backend: WebSocket Router (`chat.py`)

**Purpose:** Manages WebSocket connections and message flow

**Key Features:**

- Accepts WebSocket connections
- Receives user messages
- Routes to LLM service
- Sends responses back to client
- Handles disconnections gracefully

**Message Format:**

```json
// Client → Server
{
  "text": "How do I implement a binary tree?",
  "role": "user"
}

// Server → Client
{
  "text": "A binary tree is...",
  "role": "assistant",
  "model": "Claude"
}
```

### 3. Frontend: WebSocket Hook (`useWebSocket.ts`)

**Purpose:** Custom React hook for WebSocket management

**Exports:**

```typescript
{
  ws: WebSocket | null,
  isConnected: boolean,
  messages: Message[],
  sendMessage: (text: string) => void,
  connect: () => void,
  disconnect: () => void,
  clearMessages: () => void
}
```

**Features:**

- Auto-reconnect on connection loss
- Message state management
- Connection status tracking

### 4. Frontend: Voice Controls (`VoiceControls.tsx`)

**Purpose:** Handles voice input and output

**Features:**

- Speech-to-text using Web Speech API
- Text-to-speech using Speech Synthesis API
- Real-time transcript display
- Listening indicator
- Browser compatibility check

**Key Functions:**

```typescript
toggleListening() // Start/stop voice input
speak(text: string) // Speak text aloud
```

### 5. Frontend: Chat Page (`ChatPage.tsx`)

**Purpose:** Main page integrating all components

**Features:**

- Connection status display with pulse animation
- Connect/Disconnect controls
- Model information cards
- Conversation history
- Voice controls
- Clear chat button
- Instructions panel

## 🎨 UI Design

### Color Scheme

- **Background:** Purple gradient (#667eea → #764ba2)
- **User messages:** Purple (#667eea)
- **Bot messages:** Light gray (#f1f3f5)
- **Connected status:** Green (#28a745) with pulse animation

### Model Cards

| Model   | Icon | Background | Border  | Purpose   |
| ------- | ---- | ---------- | ------- | --------- |
| Claude  | 💻   | #f8f4ff    | #9b59b6 | Technical |
| ChatGPT | ✨   | #f0fff4    | #48bb78 | Creative  |
| Gemini  | 📚   | #eff6ff    | #4299e1 | Factual   |
| Groq    | ⚡   | #fffaf0    | #ed8936 | Quick     |

## 🔌 API Integration

### Required API Keys

1. **Anthropic (Claude)**

   - URL: https://console.anthropic.com/
   - Model: `claude-sonnet-4-5-20250929`
   - Format: `sk-ant-...`

2. **OpenAI (ChatGPT)**

   - URL: https://platform.openai.com/
   - Model: `gpt-4o-mini`
   - Format: `sk-...`

3. **Google (Gemini)**

   - URL: https://aistudio.google.com/app/apikey
   - Model: `gemini-pro`
   - Format: Variable length string

4. **Groq**
   - URL: https://console.groq.com/
   - Model: `llama-3.3-70b-versatile`
   - Format: Variable length string

### Environment Configuration

Backend `.env` file:

```env
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

Frontend `.env` file (optional):

```env
REACT_APP_WS_URL=ws://localhost:8000/ws
```

## 🚀 Running the Application

### Step 1: Configure API Keys

```powershell
cd backend
Copy-Item .env.example .env
notepad .env  # Add your API keys
```

### Step 2: Start Backend

```powershell
cd backend
python main.py
```

Backend runs on: http://localhost:8000

### Step 3: Start Frontend

```powershell
cd frontend
npm start
```

Frontend runs on: http://localhost:3000

## 🎭 Demo Script

### Preparation

1. Ensure all API keys are configured
2. Test microphone access in Chrome
3. Prepare example questions for each model

### Demo Flow

**1. Introduction (30 seconds)**

- "This is a Multi-LLM Voice Chat that intelligently routes to 4 different AI models"
- Show the UI with 4 model cards

**2. Connect (10 seconds)**

- Click "Connect" button
- Show green pulse animation
- "Now we're connected via WebSocket"

**3. Claude Demo - Technical (30 seconds)**

- Click "Click to Speak"
- Say: "How do I implement a linked list in Python?"
- Show Claude badge on response
- Response is spoken aloud

**4. ChatGPT Demo - Creative (30 seconds)**

- Click "Click to Speak"
- Say: "Help me brainstorm ideas for a science fiction story"
- Show ChatGPT badge on response

**5. Gemini Demo - Factual (30 seconds)**

- Click "Click to Speak"
- Say: "What is quantum entanglement?"
- Show Gemini badge on response

**6. Groq Demo - Quick (20 seconds)**

- Click "Click to Speak"
- Say: "Hello, how are you today?"
- Show Groq badge on response

**7. Show Features (20 seconds)**

- Scroll through conversation history
- Show model badges on each message
- Click "Clear" to reset chat
- Click "Disconnect" to end session

**Total Time: ~3 minutes**

## 🐛 Common Issues & Solutions

### Issue: Voice recognition not working

**Solution:** Must use Google Chrome browser. Check microphone permissions.

### Issue: WebSocket connection fails

**Solution:** Ensure backend is running on port 8000. Check CORS settings.

### Issue: API errors

**Solution:** Verify API keys in `.env` file. Check API quotas/credits.

### Issue: No model badge showing

**Solution:** Check WebSocket message format. Ensure backend sends `model` field.

### Issue: Response not speaking

**Solution:** Browser may block auto-play. User must interact with page first.

## 📊 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Green pulse shows when connected
- [ ] Microphone access granted
- [ ] Voice recognition works
- [ ] Claude handles technical questions
- [ ] ChatGPT handles creative questions
- [ ] Gemini handles factual questions
- [ ] Groq handles simple questions
- [ ] Model badges appear on responses
- [ ] Responses are spoken aloud
- [ ] Chat history displays correctly
- [ ] Clear button works
- [ ] Disconnect button works
- [ ] Auto-reconnect works after disconnect

## 🔐 Security Considerations

### For Development

- `.env` file is gitignored
- API keys never exposed to frontend
- CORS allows all origins (development only)

### For Production

- Store API keys in environment variables
- Restrict CORS to specific frontend domain
- Add rate limiting to WebSocket endpoint
- Implement authentication
- Use HTTPS/WSS protocols
- Monitor API usage and costs

## 📈 Future Enhancements

### Possible Improvements

1. **Text Input Option:** Add manual text input for non-voice use
2. **Model Selection:** Let users manually choose which model to use
3. **Conversation History:** Save chat history to database
4. **User Accounts:** Add authentication and personal chat history
5. **Export Chats:** Allow users to download conversations
6. **Voice Selection:** Let users choose different voice options
7. **Language Support:** Add multi-language voice recognition
8. **Streaming Responses:** Show responses as they're generated
9. **Context Awareness:** Maintain conversation context across messages
10. **Custom Routing:** Let users define their own routing keywords

## 🤝 Integration with Partner's Feature

Your partner is building the Flashcards feature on a separate branch. The integration point is the navigation tabs in `App.tsx`:

```tsx
<Nav variant="tabs">
  <Nav.Item>
    <Nav.Link eventKey="chat">💬 Multi-LLM Chat</Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link eventKey="flashcards">📚 Lecture Flashcards</Nav.Link>
  </Nav.Item>
</Nav>
```

When merging:

1. Your partner will add their `FlashcardsPage.tsx`
2. Update the flashcards tab in `App.tsx` to render their component
3. Resolve any merge conflicts in `App.tsx`

## 📝 Git Workflow

```powershell
# Your branch
git checkout -b feature/multi-llm-chat

# Commit your work
git add backend/ frontend/
git commit -m "Add multi-LLM voice chat feature"

# Push to remote
git push origin feature/multi-llm-chat

# Create pull request
# Merge into main when approved
```

## 📚 Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **React TypeScript:** https://react-typescript-cheatsheet.netlify.app/
- **Anthropic API:** https://docs.anthropic.com/
- **OpenAI API:** https://platform.openai.com/docs/
- **Google AI:** https://ai.google.dev/docs
- **Groq API:** https://console.groq.com/docs/

## ✅ Success Criteria

Your feature is complete when:

- ✅ User can speak and have speech converted to text
- ✅ Text is sent to backend via WebSocket
- ✅ Backend routes to correct LLM based on keywords
- ✅ Response includes model name badge
- ✅ Response is displayed in chat history
- ✅ Response is spoken back to user
- ✅ All 4 models can be demonstrated
- ✅ UI matches design specifications
- ✅ Code is well-documented
- ✅ Feature works reliably in demo

Good luck with your hackathon! 🚀

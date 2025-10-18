# 🎓 StudyBuddy - AI-Powered Study Assistant

> Your intelligent study companion powered by multiple AI models and advanced flashcard generation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)

## 📖 Overview

**StudyBuddy** is a comprehensive AI-powered study tool designed to help students learn more effectively. It combines the power of multiple Large Language Models (LLMs) with intelligent flashcard generation from lecture recordings, creating a seamless study experience.

### ✨ Key Features

#### 💬 Multi-LLM Chat Interface

- **4 AI Models**: Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), and Groq
- **Intelligent Routing**: Automatically selects the best AI model based on your question type
- **Manual Selection**: Choose specific AI models for specialized tasks
- **Real-time WebSocket**: Fast, responsive communication
- **Voice Support**: Built-in voice controls for hands-free studying

#### 📚 AI-Powered Flashcard Generation

- **Audio Recording**: Record lectures directly in your browser
- **Auto-Transcription**: Convert lectures to text using Whisper AI
- **Smart Flashcard Creation**: Claude AI generates high-quality study flashcards
- **Interactive Study Modes**:
  - 📖 **Review Mode**: Flip through cards at your own pace
  - ✅ **Quiz Mode**: Test your knowledge with self-grading
  - ✏️ **Edit Mode**: Customize flashcards to your needs
- **Export Options**: Download flashcards as Anki-compatible CSV
- **Persistent Storage**: All flashcards saved to Supabase database

---

## 🏗️ Architecture

```
StudyBuddy/
├── backend/              # Python FastAPI backend
│   ├── main.py          # Application entry point
│   ├── app/
│   │   ├── routers/     # API endpoints
│   │   │   ├── chat.py         # WebSocket chat endpoint
│   │   │   └── flashcards.py   # Flashcard CRUD + generation
│   │   ├── services/    # Business logic
│   │   │   ├── llm_router.py           # Multi-LLM routing
│   │   │   ├── flashcard_generator.py  # AI flashcard creation
│   │   │   └── supabase_client.py      # Database operations
│   │   └── models/      # Data models
│   │       └── flashcard.py
│   └── database/
│       └── schema.sql   # Supabase database schema
│
└── frontend/            # React TypeScript frontend
    ├── src/
    │   ├── pages/
    │   │   ├── ChatPage.tsx        # Multi-LLM chat interface
    │   │   └── FlashcardPage.tsx   # Flashcard management
    │   ├── components/
    │   │   ├── chat/               # Chat UI components
    │   │   └── flashcards/         # Flashcard UI components
    │   ├── hooks/
    │   │   ├── useWebSocket.ts     # WebSocket connection
    │   │   └── useFlashcards.ts    # Flashcard state management
    │   └── types/                  # TypeScript definitions
    └── public/
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 16+**
- **API Keys** (at least one):
  - [Anthropic Claude](https://console.anthropic.com/) (Required for flashcard generation)
  - [OpenAI](https://platform.openai.com/)
  - [Google AI Studio](https://aistudio.google.com/app/apikey)
  - [Groq](https://console.groq.com/)
- **Supabase Account**: [supabase.com](https://supabase.com/) (Free tier available)

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/2AcademicVictims/StudyBuddy.git
cd StudyBuddy
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Edit .env and add your API keys
# ANTHROPIC_API_KEY=your_claude_api_key
# OPENAI_API_KEY=your_openai_api_key
# GOOGLE_API_KEY=your_google_api_key
# GROQ_API_KEY=your_groq_api_key
# SUPABASE_URL=your_supabase_project_url
# SUPABASE_KEY=your_supabase_anon_key
```

#### 3️⃣ Database Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Navigate to **SQL Editor** in your Supabase dashboard
3. Copy and run the SQL from `backend/database/schema.sql`
4. Get your **Project URL** and **Anon Key** from Settings → API
5. Add them to your `.env` file

#### 4️⃣ Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### 5️⃣ Start Backend Server

```bash
# In the backend directory
python main.py

# Server will start on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### ✅ Verify Installation

Visit `http://localhost:3000` and you should see:

- Multi-LLM Chat tab with available AI models
- Lecture Flashcards tab for recording and studying

---

## 🎯 Usage

### Multi-LLM Chat

1. **Navigate to "💬 Multi-LLM Chat" tab**
2. **Choose a mode**:
   - **Auto-Route**: Let AI pick the best model
   - **Manual**: Select a specific AI (Claude, ChatGPT, Gemini, or Groq)
3. **Type your question** or use voice input
4. **Get instant answers** from world-class AI models

**Example Questions**:

- "Explain quantum entanglement in simple terms" → Routes to Claude
- "Write a Python function to reverse a string" → Routes to ChatGPT
- "What are the health benefits of green tea?" → Routes to Gemini
- "Summarize the main themes in Shakespeare's Hamlet" → Routes to Groq

### Flashcard Generation

1. **Navigate to "📚 Lecture Flashcards" tab**
2. **Record a lecture**:
   - Click "🎙️ Start Recording"
   - Speak or play lecture audio
   - Click "⏹️ Stop Recording"
3. **Generate flashcards**:
   - Enter lecture title
   - Choose number of flashcards (5-30)
   - Click "✨ Generate Flashcards"
   - AI processes transcript and creates study cards
4. **Study your flashcards**:
   - **Review Mode**: Click cards to flip and learn
   - **Quiz Mode**: Test yourself with self-grading
   - **Edit**: Modify questions/answers
   - **Save**: Store to database
   - **Export**: Download as Anki CSV

---

## 🛠️ Technology Stack

### Backend

- **FastAPI** - High-performance async web framework
- **Python 3.11+** - Core programming language
- **Anthropic Claude** - Advanced AI for flashcard generation
- **OpenAI Whisper** - Speech-to-text transcription
- **Supabase** - PostgreSQL database with real-time features
- **WebSockets** - Real-time bidirectional communication

### Frontend

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **React Bootstrap** - Responsive UI components
- **WebSocket API** - Real-time chat functionality
- **MediaRecorder API** - Browser audio recording

### AI Models

| Model             | Provider  | Use Case                                |
| ----------------- | --------- | --------------------------------------- |
| Claude 3.5 Sonnet | Anthropic | Complex reasoning, flashcard generation |
| GPT-4             | OpenAI    | Code generation, technical questions    |
| Gemini 2.5 Flash  | Google    | General knowledge, fast responses       |
| Llama 3.1         | Groq      | Creative content, summarization         |

---

## 📊 API Endpoints

### Chat Endpoints

```
WS  /ws                          # WebSocket chat connection
GET /health                      # System health check
GET /                            # API information
```

### Flashcard Endpoints

```
POST   /api/flashcards/generate        # Generate flashcards from transcript
POST   /api/flashcards/transcribe      # Transcribe audio + generate flashcards
GET    /api/flashcards                 # List all flashcards
POST   /api/flashcards                 # Create flashcard manually
GET    /api/flashcards/{id}            # Get specific flashcard
PUT    /api/flashcards/{id}            # Update flashcard
DELETE /api/flashcards/{id}            # Delete flashcard
GET    /api/flashcards/export/anki     # Export as Anki CSV
```

**Full API documentation**: http://localhost:8000/docs

---

## 🧪 Testing

### Test Supabase Connection

```bash
cd backend
python test_supabase.py
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

---

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):

```env
# AI Model API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=gsk_...

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGc...
```

### Customization

- **Change AI Models**: Edit `backend/app/services/llm_router.py`
- **Adjust Flashcard Count**: Modify range in `frontend/src/components/flashcards/LectureRecorder.tsx`
- **Database Schema**: Modify `backend/database/schema.sql`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Anthropic** for Claude AI
- **OpenAI** for GPT and Whisper
- **Google** for Gemini
- **Groq** for fast inference
- **Supabase** for database infrastructure
- Built for the **Cursor Hackathon**

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/2AcademicVictims/StudyBuddy/issues)
- **Documentation**: See `QUICK_START.md` and `FEATURE_DOCUMENTATION.md`
- **API Docs**: http://localhost:8000/docs

---

## 🎓 Built by Students, For Students

Created by [@2AcademicVictims](https://github.com/2AcademicVictims) to make studying more efficient and effective.

**Happy Studying! 📚✨**

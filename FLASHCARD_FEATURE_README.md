# Lecture Recording to Flashcard Generation Feature

## Overview

This feature allows users to record lectures via voice, automatically transcribe them, and generate Anki-compatible flashcards using AI. It includes a voice-based quiz mode for interactive studying.

## Tech Stack

### Frontend

- React 18 with TypeScript
- Bootstrap 5 and react-bootstrap
- MediaRecorder API (browser built-in)
- Web Speech API (Speech Recognition & Synthesis)

### Backend

- Python 3.10+ with FastAPI
- Claude (Anthropic) for flashcard generation
- OpenAI Whisper for audio transcription
- Supabase for database storage

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

#### Get API Keys

- **Claude (Anthropic)**: https://console.anthropic.com/
- **OpenAI** (for Whisper): https://platform.openai.com/api-keys
- **Supabase**: https://supabase.com/ (Settings → API)

#### Setup Supabase Database

1. Create a new project at https://supabase.com/
2. Run the following SQL in Supabase SQL Editor:

```sql
-- Create flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  lecture_title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create lecture_sessions table
CREATE TABLE lecture_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  transcript TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_lecture_title ON flashcards(lecture_title);
CREATE INDEX idx_lecture_sessions_user_id ON lecture_sessions(user_id);
```

#### Start Backend Server

```bash
cd backend
python main.py
```

The backend will be running at `http://localhost:8000`

### 2. Frontend Setup

#### Install Dependencies (if not already done)

```bash
cd frontend
npm install
```

#### Configure API URL

Create `.env` in the frontend folder (if needed):

```bash
REACT_APP_API_URL=http://localhost:8000
```

#### Start Frontend

```bash
cd frontend
npm start
```

The frontend will be running at `http://localhost:3000`

## File Structure

### Backend

```
backend/
├── app/
│   ├── models/
│   │   └── flashcard.py              # Pydantic models
│   ├── routers/
│   │   └── flashcards.py             # REST API endpoints
│   └── services/
│       ├── flashcard_generator.py    # Claude AI integration
│       └── supabase_client.py        # Database service
├── main.py                           # FastAPI app entry
└── requirements.txt                  # Python dependencies
```

### Frontend

```
frontend/src/
├── components/
│   └── flashcards/
│       ├── LectureRecorder.tsx       # Audio recording component
│       ├── FlashcardDisplay.tsx      # Card display with flip
│       ├── QuizMode.tsx              # Voice quiz component
│       └── FlashcardList.tsx         # Saved flashcards view
├── pages/
│   └── FlashcardPage.tsx             # Main page with modes
├── hooks/
│   └── useFlashcards.ts              # API interaction hook
└── types/
    └── flashcard.types.ts            # TypeScript types
```

## API Endpoints

### POST /api/flashcards/generate

Generate flashcards from transcript text

```json
{
  "transcript": "Today we're learning about...",
  "lecture_title": "Intro to Data Structures",
  "num_flashcards": 10
}
```

### POST /api/flashcards/transcribe

Upload audio file and generate flashcards

- Multipart form data with audio file
- Query params: `lecture_title`, `num_flashcards`

### GET /api/flashcards

Get all flashcards

- Query params: `user_id`, `lecture_title`, `limit`

### POST /api/flashcards

Create a single flashcard manually

### PUT /api/flashcards/{id}

Update an existing flashcard

### DELETE /api/flashcards/{id}

Delete a flashcard

### GET /api/flashcards/export/anki

Export flashcards to Anki CSV format

## User Flow

1. **Record Mode**

   - User enters lecture title
   - Clicks "Start Recording" and speaks
   - Or pastes transcript manually
   - AI generates 10-15 flashcards

2. **Review Mode**

   - Display flashcards with flip animation
   - Navigate between cards
   - Edit/delete individual cards
   - Save to database

3. **Quiz Mode**

   - Show question only
   - User types or speaks answer
   - Reveal correct answer (spoken aloud)
   - Mark correct/incorrect
   - View quiz statistics

4. **List Mode**
   - View all saved flashcards
   - Filter by lecture title
   - Select lectures to review
   - Export to Anki format

## Features

### ✅ Voice Recording

- Browser-based audio recording (MediaRecorder API)
- Real-time timer display
- Visual recording indicator

### ✅ AI-Powered Generation

- Claude AI analyzes lecture content
- Generates 10-15 quality flashcards
- Extracts key concepts automatically

### ✅ Flashcard Display

- Card flip animation
- Previous/Next navigation
- Progress indicator
- Edit/Delete controls

### ✅ Voice Quiz Mode

- Speech recognition for answers
- Text-to-speech for correct answers
- Quiz statistics tracking
- Honest self-grading

### ✅ Database Storage

- Supabase PostgreSQL database
- CRUD operations
- Filter and search
- Export to Anki CSV

## Browser Compatibility

### Required Features

- **MediaRecorder API**: Chrome, Firefox, Edge, Safari 14.1+
- **Web Speech API**: Chrome, Edge, Safari (with webkit prefix)

### Fallback Options

- If speech recognition unavailable: type answers manually
- If speech synthesis unavailable: read answers silently

## Demo Script

1. Navigate to "Lecture Flashcards" tab
2. Enter lecture title: "Binary Search Trees"
3. Click "Record Lecture" → speak for 30-60 seconds
4. Watch as transcript appears and flashcards generate
5. Review flashcards with flip animation
6. Enter Quiz Mode
7. Answer questions with voice
8. View final statistics
9. Save flashcards to database
10. Export to Anki format

## Troubleshooting

### Microphone not working

- Check browser permissions (allow microphone access)
- Try HTTPS (required for some browsers)
- Check if MediaRecorder is supported

### Speech recognition not working

- Use Chrome or Edge (best support)
- Check microphone permissions
- Fall back to typing answers

### API errors

- Verify all API keys in `.env`
- Check backend server is running
- Check Supabase credentials
- Review browser console for details

### Flashcards not generating

- Ensure transcript is at least 10 characters
- Check Claude API key and quota
- Review backend logs for errors

## Cost Considerations

### Free Tiers Available

- **Supabase**: 500MB database, 2GB bandwidth/month
- **OpenAI Whisper**: Pay-per-use, ~$0.006/minute of audio

### Paid Services

- **Claude (Anthropic)**: Pay-per-token
  - ~$0.01 per flashcard generation (approximate)
  - Free trial credits usually available

## Development Tips

### Adding New Features

1. **Backend**: Add endpoints in `routers/flashcards.py`
2. **Frontend**: Add hooks in `useFlashcards.ts`
3. **Components**: Create in `components/flashcards/`
4. **Types**: Update `flashcard.types.ts`

### Testing

- Test audio recording in different browsers
- Test with various lecture lengths
- Verify database operations
- Test export functionality

### Deployment

- Deploy backend to Heroku, Railway, or similar
- Deploy frontend to Vercel, Netlify, or similar
- Update CORS settings for production domains
- Set environment variables in hosting platform

## Credits

Built as part of StudyBuddy hackathon project.

- AI: Claude (Anthropic)
- Transcription: OpenAI Whisper
- Database: Supabase
- Framework: FastAPI + React

## License

MIT License - See project root for details

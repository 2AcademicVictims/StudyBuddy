# Quick Start Guide - Lecture Flashcards Feature

## 🚀 Get Started in 5 Minutes

### Step 1: Setup API Keys

1. **Create `backend/.env` file** (copy from `.env.example`):

```bash
cd backend
cp .env.example .env
```

2. **Get your API keys**:

**Claude API (Required for flashcard generation)**

- Go to: https://console.anthropic.com/
- Sign up / Login
- Click "Get API Keys"
- Copy your key (starts with `sk-ant-api03-`)
- Paste in `.env`: `ANTHROPIC_API_KEY=sk-ant-api03-...`

**OpenAI API (Required for audio transcription)**

- Go to: https://platform.openai.com/api-keys
- Sign up / Login
- Click "Create new secret key"
- Copy your key (starts with `sk-`)
- Paste in `.env`: `OPENAI_API_KEY=sk-...`

**Supabase (Required for database)**

- Go to: https://supabase.com/
- Sign up / Login
- Create a new project
- Go to Settings → API
- Copy "Project URL" and "anon public" key
- Paste in `.env`:
  ```
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_KEY=your-anon-key-here
  ```

3. **Setup Supabase Database**:

- In Supabase dashboard, go to SQL Editor
- Run this SQL:

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

-- Add indexes
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_lecture_title ON flashcards(lecture_title);
CREATE INDEX idx_lecture_sessions_user_id ON lecture_sessions(user_id);
```

### Step 2: Install Dependencies

**Backend:**

```bash
cd backend
pip install -r requirements.txt
```

**Frontend (if not done):**

```bash
cd frontend
npm install
```

### Step 3: Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
python main.py
```

✅ Backend running at http://localhost:8000

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

✅ Frontend running at http://localhost:3000

### Step 4: Test the Feature

1. Open http://localhost:3000
2. Click "📚 Lecture Flashcards" tab
3. Enter lecture title: "Test Lecture"
4. Choose one option:

   **Option A - Record Audio:**

   - Click "Start Recording"
   - Allow microphone access
   - Speak for 30-60 seconds about a topic
   - Click "Stop Recording"
   - Wait for transcription and flashcard generation

   **Option B - Paste Text:**

   - Scroll to "Or paste your transcript manually"
   - Paste lecture text (min 10 characters)
   - Click "Generate Flashcards from Text"

5. Review generated flashcards (click to flip)
6. Click "Start Quiz Mode" to test yourself
7. Use voice input or type answers
8. View your quiz results
9. Check "My Flashcards" tab to see saved cards

## 📝 Sample Lecture Text for Testing

Copy and paste this if you want to test without recording:

```
Today we're learning about Binary Search Trees or BSTs. A Binary Search Tree is a data structure where each node has at most two children. The key property of a BST is that for each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater. This property makes searching very efficient. The time complexity of searching in a balanced BST is O(log n), where n is the number of nodes. This is because each comparison allows you to skip about half of the tree. To insert a node, you start at the root and compare values, going left if the new value is smaller or right if it's larger, until you find an empty spot. Common operations include insertion, deletion, and traversal. The three main traversal methods are in-order, pre-order, and post-order. BSTs are used in many applications like implementing maps, sets, and priority queues.
```

## ⚠️ Troubleshooting

### "Failed to start recording"

- Allow microphone permissions in your browser
- Use Chrome, Edge, or Firefox (best support)
- Try using HTTPS if on a hosted site

### "Failed to generate flashcards"

- Check your `ANTHROPIC_API_KEY` in `.env`
- Ensure you have API credits
- Check backend terminal for error messages

### "Failed to transcribe"

- Check your `OPENAI_API_KEY` in `.env`
- Ensure audio is at least 1 second long
- Try the text input option instead

### "Database error"

- Check `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Verify you ran the SQL setup in Supabase
- Check Supabase dashboard for connection issues

### Backend won't start

```bash
# Make sure you're in the backend folder
cd backend

# Install dependencies again
pip install -r requirements.txt

# Check for errors in .env file
cat .env  # or: type .env on Windows
```

### Frontend won't start

```bash
# Make sure you're in the frontend folder
cd frontend

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json  # or: rmdir /s node_modules on Windows
npm install
npm start
```

## 💡 Usage Tips

1. **Best Recording Practices:**

   - Speak clearly at a moderate pace
   - Record 2-5 minutes for best results
   - Focus on key concepts and definitions
   - Use structured content (not casual conversation)

2. **Quiz Mode:**

   - Enable microphone for voice input
   - Be honest when marking correct/incorrect
   - Review missed questions after completing

3. **Saving Flashcards:**
   - Click "Save" in Review mode to add to database
   - Use "My Flashcards" tab to access all saved cards
   - Export to Anki for offline studying

## 🎯 Next Steps

1. ✅ Generate your first flashcards
2. ✅ Complete a quiz
3. ✅ Export to Anki format
4. 📚 Start using for real study sessions!

## 📚 Full Documentation

See `FLASHCARD_FEATURE_README.md` for complete documentation including:

- Detailed architecture
- API endpoints reference
- File structure explanation
- Development tips
- Deployment guide

## 🆘 Need Help?

- Check backend logs in terminal for errors
- Check browser console (F12) for frontend errors
- Verify all API keys are correct in `.env`
- Ensure backend is running before starting frontend
- Make sure you have credits in your API accounts

## 🎉 Success!

If you see flashcards generated from your lecture, congratulations!
The feature is working correctly. Start using it for your study sessions!

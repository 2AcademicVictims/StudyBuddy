import os
import json
import re
from typing import List, Dict, Optional
from anthropic import Anthropic
import httpx
from datetime import datetime


class FlashcardGenerator:
    """Service for generating flashcards from lecture transcripts using Claude AI"""
    
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")
        self.client = Anthropic(api_key=self.api_key)
        self.model = "claude-sonnet-4-5-20250929"
    
    async def generate_flashcards_from_transcript(
        self, 
        transcript: str, 
        lecture_title: str,
        num_flashcards: int = 10,
        user_id: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Generate flashcards from lecture transcript using Claude AI
        
        Args:
            transcript: The lecture transcript text
            lecture_title: Title of the lecture
            num_flashcards: Number of flashcards to generate (5-30)
            user_id: Optional user identifier
            
        Returns:
            List of flashcard dictionaries with question, answer, and metadata
        """
        
        # Construct the prompt
        prompt = self._build_flashcard_prompt(transcript, num_flashcards)
        
        try:
            # Call Claude API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0.7,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Extract the text response
            response_text = message.content[0].text
            
            # Parse flashcards from response
            flashcards = self._parse_flashcards(response_text, lecture_title, user_id)
            
            return flashcards
            
        except Exception as e:
            print(f"Error generating flashcards: {str(e)}")
            raise
    
    def _build_flashcard_prompt(self, transcript: str, num_flashcards: int) -> str:
        """Build the Claude prompt for flashcard generation"""
        return f"""Analyze this lecture transcript and create {num_flashcards} high-quality flashcards for studying.

LECTURE TRANSCRIPT:
{transcript}

INSTRUCTIONS:
1. Extract the most important concepts, definitions, facts, and relationships
2. Create clear, concise questions that test understanding
3. Provide complete, accurate answers
4. Focus on key learning objectives
5. Vary question types (definitions, applications, comparisons, etc.)
6. Make questions specific and unambiguous

FORMAT YOUR RESPONSE AS JSON:
{{
  "flashcards": [
    {{
      "question": "What is a binary search tree?",
      "answer": "A binary search tree (BST) is a data structure where each node has at most two children, and for each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater."
    }},
    {{
      "question": "What is the time complexity of searching in a balanced BST?",
      "answer": "O(log n), where n is the number of nodes, because each comparison allows the search to skip about half of the tree."
    }}
  ]
}}

Generate exactly {num_flashcards} flashcards in this JSON format. Ensure the JSON is valid and properly formatted."""
    
    def _parse_flashcards(
        self, 
        response_text: str, 
        lecture_title: str,
        user_id: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Parse flashcards from Claude's response"""
        flashcards = []
        
        try:
            # Try to extract JSON from the response
            # Claude sometimes wraps JSON in markdown code blocks
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find raw JSON
                json_match = re.search(r'\{.*"flashcards".*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    json_str = response_text
            
            # Parse JSON
            data = json.loads(json_str)
            flashcard_list = data.get("flashcards", [])
            
            # Convert to our format
            for idx, card in enumerate(flashcard_list):
                flashcards.append({
                    "id": f"{datetime.now().timestamp()}-{idx}",
                    "question": card["question"].strip(),
                    "answer": card["answer"].strip(),
                    "lecture_title": lecture_title,
                    "user_id": user_id,
                    "created_at": datetime.now().isoformat()
                })
            
        except json.JSONDecodeError:
            # Fallback: Try to parse Q: A: format
            flashcards = self._parse_qa_format(response_text, lecture_title, user_id)
        
        return flashcards
    
    def _parse_qa_format(
        self, 
        text: str, 
        lecture_title: str,
        user_id: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Fallback parser for Q: A: format"""
        flashcards = []
        
        # Pattern to match Q: ... A: ... format
        pattern = r'(?:Q:|Question:)\s*(.+?)\s*(?:A:|Answer:)\s*(.+?)(?=(?:Q:|Question:|\Z))'
        matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
        
        for idx, (question, answer) in enumerate(matches):
            flashcards.append({
                "id": f"{datetime.now().timestamp()}-{idx}",
                "question": question.strip(),
                "answer": answer.strip(),
                "lecture_title": lecture_title,
                "user_id": user_id,
                "created_at": datetime.now().isoformat()
            })
        
        return flashcards
    
    async def transcribe_audio(self, audio_file: bytes, file_format: str = "webm") -> str:
        """
        Transcribe audio file to text using OpenAI Whisper API
        
        Args:
            audio_file: Audio file bytes
            file_format: Audio file format (webm, mp3, wav, etc.)
            
        Returns:
            Transcript text
        """
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required for transcription")
        
        try:
            # Create multipart form data
            files = {
                'file': (f'audio.{file_format}', audio_file, f'audio/{file_format}'),
                'model': (None, 'whisper-1'),
            }
            
            # Call Whisper API
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    'https://api.openai.com/v1/audio/transcriptions',
                    files=files,
                    headers={'Authorization': f'Bearer {openai_api_key}'}
                )
                response.raise_for_status()
                result = response.json()
                return result.get('text', '')
                
        except Exception as e:
            print(f"Error transcribing audio: {str(e)}")
            raise


# Singleton instance
_generator = None


def get_flashcard_generator() -> FlashcardGenerator:
    """Get or create flashcard generator instance"""
    global _generator
    if _generator is None:
        _generator = FlashcardGenerator()
    return _generator

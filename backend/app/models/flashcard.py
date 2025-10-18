from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


class FlashcardBase(BaseModel):
    """Base flashcard model with core fields"""
    question: str = Field(..., min_length=1, max_length=1000)
    answer: str = Field(..., min_length=1, max_length=2000)
    lecture_title: str = Field(..., min_length=1, max_length=200)


class FlashcardCreate(FlashcardBase):
    """Model for creating a new flashcard"""
    user_id: Optional[str] = None


class Flashcard(FlashcardBase):
    """Complete flashcard model with all fields"""
    id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FlashcardUpdate(BaseModel):
    """Model for updating a flashcard"""
    question: Optional[str] = Field(None, min_length=1, max_length=1000)
    answer: Optional[str] = Field(None, min_length=1, max_length=2000)
    lecture_title: Optional[str] = Field(None, min_length=1, max_length=200)


class LectureSession(BaseModel):
    """Model for a lecture recording session"""
    id: str
    transcript: str
    flashcards: list[Flashcard] = []
    created_at: datetime
    user_id: Optional[str] = None


class TranscriptRequest(BaseModel):
    """Model for transcript-based flashcard generation request"""
    transcript: str = Field(..., min_length=10)
    lecture_title: str = Field(..., min_length=1, max_length=200)
    user_id: Optional[str] = None
    num_flashcards: int = Field(default=10, ge=5, le=30)


class FlashcardGenerationResponse(BaseModel):
    """Response model for flashcard generation"""
    flashcards: list[Flashcard]
    session_id: str
    total_generated: int

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Optional
import io
from datetime import datetime

from app.models.flashcard import (
    Flashcard,
    FlashcardCreate,
    FlashcardUpdate,
    TranscriptRequest,
    FlashcardGenerationResponse,
    LectureSession
)
from app.services.flashcard_generator import get_flashcard_generator
from app.services.supabase_client import get_supabase_service

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])


@router.post("/generate", response_model=FlashcardGenerationResponse)
async def generate_flashcards(request: TranscriptRequest):
    """
    Generate flashcards from a lecture transcript using Claude AI
    
    Args:
        request: TranscriptRequest containing transcript, title, and options
        
    Returns:
        Generated flashcards and session ID
    """
    try:
        generator = get_flashcard_generator()
        
        # Generate flashcards using Claude
        flashcards_data = await generator.generate_flashcards_from_transcript(
            transcript=request.transcript,
            lecture_title=request.lecture_title,
            num_flashcards=request.num_flashcards,
            user_id=request.user_id
        )
        
        # Create lecture session in database
        supabase = get_supabase_service()
        session = await supabase.create_lecture_session({
            'transcript': request.transcript,
            'user_id': request.user_id
        })
        
        session_id = session['id'] if session else f"session-{datetime.now().timestamp()}"
        
        # Convert to Flashcard models
        flashcards = [
            Flashcard(
                id=card['id'],
                question=card['question'],
                answer=card['answer'],
                lecture_title=card['lecture_title'],
                user_id=card.get('user_id'),
                created_at=datetime.fromisoformat(card['created_at'])
            )
            for card in flashcards_data
        ]
        
        return FlashcardGenerationResponse(
            flashcards=flashcards,
            session_id=session_id,
            total_generated=len(flashcards)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    lecture_title: str = Query(..., description="Title of the lecture"),
    user_id: Optional[str] = Query(None, description="User ID"),
    num_flashcards: int = Query(10, ge=5, le=30, description="Number of flashcards to generate")
):
    """
    Transcribe audio and generate flashcards in one step
    
    Args:
        audio: Audio file (webm, mp3, wav, etc.)
        lecture_title: Title of the lecture
        user_id: Optional user identifier
        num_flashcards: Number of flashcards to generate
        
    Returns:
        Transcript and generated flashcards
    """
    try:
        # Read audio file
        audio_bytes = await audio.read()
        file_format = audio.filename.split('.')[-1] if '.' in audio.filename else 'webm'
        
        # Transcribe audio
        generator = get_flashcard_generator()
        transcript = await generator.transcribe_audio(audio_bytes, file_format)
        
        if not transcript or len(transcript) < 10:
            raise HTTPException(status_code=400, detail="Transcription failed or too short")
        
        # Generate flashcards from transcript
        flashcards_data = await generator.generate_flashcards_from_transcript(
            transcript=transcript,
            lecture_title=lecture_title,
            num_flashcards=num_flashcards,
            user_id=user_id
        )
        
        # Create lecture session
        supabase = get_supabase_service()
        session = await supabase.create_lecture_session({
            'transcript': transcript,
            'user_id': user_id
        })
        
        session_id = session['id'] if session else f"session-{datetime.now().timestamp()}"
        
        # Convert to Flashcard models
        flashcards = [
            Flashcard(
                id=card['id'],
                question=card['question'],
                answer=card['answer'],
                lecture_title=card['lecture_title'],
                user_id=card.get('user_id'),
                created_at=datetime.fromisoformat(card['created_at'])
            )
            for card in flashcards_data
        ]
        
        return {
            "transcript": transcript,
            "flashcards": flashcards,
            "session_id": session_id,
            "total_generated": len(flashcards)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process audio: {str(e)}")


@router.get("", response_model=List[Flashcard])
async def get_flashcards(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    lecture_title: Optional[str] = Query(None, description="Filter by lecture title"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of flashcards to return")
):
    """
    Get all flashcards with optional filters
    
    Args:
        user_id: Optional user ID filter
        lecture_title: Optional lecture title filter (partial match)
        limit: Maximum number of results
        
    Returns:
        List of flashcards
    """
    try:
        supabase = get_supabase_service()
        flashcards_data = await supabase.get_flashcards(
            user_id=user_id,
            lecture_title=lecture_title,
            limit=limit
        )
        
        return [
            Flashcard(
                id=str(card['id']),
                question=card['question'],
                answer=card['answer'],
                lecture_title=card['lecture_title'],
                user_id=card.get('user_id'),
                created_at=card['created_at']
            )
            for card in flashcards_data
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve flashcards: {str(e)}")


@router.post("", response_model=Flashcard)
async def create_flashcard(flashcard: FlashcardCreate):
    """
    Create a new flashcard manually
    
    Args:
        flashcard: Flashcard data
        
    Returns:
        Created flashcard
    """
    try:
        supabase = get_supabase_service()
        flashcard_data = await supabase.create_flashcard({
            'question': flashcard.question,
            'answer': flashcard.answer,
            'lecture_title': flashcard.lecture_title,
            'user_id': flashcard.user_id
        })
        
        return Flashcard(
            id=str(flashcard_data['id']),
            question=flashcard_data['question'],
            answer=flashcard_data['answer'],
            lecture_title=flashcard_data['lecture_title'],
            user_id=flashcard_data.get('user_id'),
            created_at=flashcard_data['created_at']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create flashcard: {str(e)}")


@router.get("/{flashcard_id}", response_model=Flashcard)
async def get_flashcard(flashcard_id: str):
    """
    Get a specific flashcard by ID
    
    Args:
        flashcard_id: Flashcard ID
        
    Returns:
        Flashcard details
    """
    try:
        supabase = get_supabase_service()
        flashcard_data = await supabase.get_flashcard_by_id(flashcard_id)
        
        if not flashcard_data:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        
        return Flashcard(
            id=str(flashcard_data['id']),
            question=flashcard_data['question'],
            answer=flashcard_data['answer'],
            lecture_title=flashcard_data['lecture_title'],
            user_id=flashcard_data.get('user_id'),
            created_at=flashcard_data['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve flashcard: {str(e)}")


@router.put("/{flashcard_id}", response_model=Flashcard)
async def update_flashcard(flashcard_id: str, flashcard_update: FlashcardUpdate):
    """
    Update an existing flashcard
    
    Args:
        flashcard_id: Flashcard ID
        flashcard_update: Updated flashcard data
        
    Returns:
        Updated flashcard
    """
    try:
        # Get existing flashcard first
        supabase = get_supabase_service()
        existing = await supabase.get_flashcard_by_id(flashcard_id)
        
        if not existing:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        
        # Prepare update data (only include non-None fields)
        update_data = {}
        if flashcard_update.question is not None:
            update_data['question'] = flashcard_update.question
        if flashcard_update.answer is not None:
            update_data['answer'] = flashcard_update.answer
        if flashcard_update.lecture_title is not None:
            update_data['lecture_title'] = flashcard_update.lecture_title
        
        # Update flashcard
        flashcard_data = await supabase.update_flashcard(flashcard_id, update_data)
        
        return Flashcard(
            id=str(flashcard_data['id']),
            question=flashcard_data['question'],
            answer=flashcard_data['answer'],
            lecture_title=flashcard_data['lecture_title'],
            user_id=flashcard_data.get('user_id'),
            created_at=flashcard_data['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update flashcard: {str(e)}")


@router.delete("/{flashcard_id}")
async def delete_flashcard(flashcard_id: str):
    """
    Delete a flashcard
    
    Args:
        flashcard_id: Flashcard ID
        
    Returns:
        Success message
    """
    try:
        supabase = get_supabase_service()
        
        # Check if flashcard exists
        existing = await supabase.get_flashcard_by_id(flashcard_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        
        # Delete flashcard
        await supabase.delete_flashcard(flashcard_id)
        
        return {"message": "Flashcard deleted successfully", "id": flashcard_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete flashcard: {str(e)}")


@router.get("/export/anki")
async def export_to_anki(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    lecture_title: Optional[str] = Query(None, description="Filter by lecture title")
):
    """
    Export flashcards to Anki-compatible format (CSV)
    
    Args:
        user_id: Optional user ID filter
        lecture_title: Optional lecture title filter
        
    Returns:
        CSV file with flashcards
    """
    try:
        supabase = get_supabase_service()
        flashcards_data = await supabase.get_flashcards(
            user_id=user_id,
            lecture_title=lecture_title,
            limit=1000
        )
        
        # Create CSV content
        csv_lines = ["Question;Answer;Lecture Title;Created At"]
        
        for card in flashcards_data:
            question = card['question'].replace(';', ',').replace('\n', ' ')
            answer = card['answer'].replace(';', ',').replace('\n', ' ')
            lecture = card['lecture_title'].replace(';', ',')
            created = card['created_at']
            
            csv_lines.append(f"{question};{answer};{lecture};{created}")
        
        csv_content = '\n'.join(csv_lines)
        
        # Return as downloadable file
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=flashcards_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export flashcards: {str(e)}")

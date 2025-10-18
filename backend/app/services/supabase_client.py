import os
from typing import Optional, List, Dict
from supabase import create_client, Client
from datetime import datetime


class SupabaseService:
    """Service for interacting with Supabase database"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required")
        
        try:
            # Create client using the public interface
            self.client: Client = create_client(supabase_url, supabase_key)
        except Exception as e:
            print(f"Error creating Supabase client: {str(e)}")
            raise
    
    async def create_flashcard(self, flashcard_data: Dict) -> Dict:
        """Create a new flashcard in the database"""
        try:
            response = self.client.table('flashcards').insert({
                'question': flashcard_data['question'],
                'answer': flashcard_data['answer'],
                'lecture_title': flashcard_data['lecture_title'],
                'user_id': flashcard_data.get('user_id'),
            }).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating flashcard: {str(e)}")
            raise
    
    async def get_flashcards(
        self, 
        user_id: Optional[str] = None,
        lecture_title: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get flashcards from the database with optional filters"""
        try:
            query = self.client.table('flashcards').select('*')
            
            if user_id:
                query = query.eq('user_id', user_id)
            
            if lecture_title:
                query = query.ilike('lecture_title', f'%{lecture_title}%')
            
            query = query.order('created_at', desc=True).limit(limit)
            
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error getting flashcards: {str(e)}")
            raise
    
    async def get_flashcard_by_id(self, flashcard_id: str) -> Optional[Dict]:
        """Get a single flashcard by ID"""
        try:
            response = self.client.table('flashcards').select('*').eq('id', flashcard_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting flashcard: {str(e)}")
            raise
    
    async def update_flashcard(self, flashcard_id: str, update_data: Dict) -> Optional[Dict]:
        """Update a flashcard"""
        try:
            response = self.client.table('flashcards').update(update_data).eq('id', flashcard_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating flashcard: {str(e)}")
            raise
    
    async def delete_flashcard(self, flashcard_id: str) -> bool:
        """Delete a flashcard"""
        try:
            self.client.table('flashcards').delete().eq('id', flashcard_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting flashcard: {str(e)}")
            raise
    
    async def create_lecture_session(self, session_data: Dict) -> Dict:
        """Create a new lecture session"""
        try:
            response = self.client.table('lecture_sessions').insert({
                'transcript': session_data['transcript'],
                'user_id': session_data.get('user_id'),
            }).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating lecture session: {str(e)}")
            raise


# Singleton instance
_supabase_service = None


def get_supabase_service() -> SupabaseService:
    """Get or create Supabase service instance"""
    global _supabase_service
    if _supabase_service is None:
        _supabase_service = SupabaseService()
    return _supabase_service

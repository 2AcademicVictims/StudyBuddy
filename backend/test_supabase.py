"""
Test Supabase Connection and Database Tables
Run this to verify your Supabase setup is working correctly
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

def test_connection():
    """Test Supabase connection and table existence"""
    
    print("=" * 50)
    print("TESTING SUPABASE CONNECTION")
    print("=" * 50)
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    print(f"\n1. Environment Variables:")
    print(f"   SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Missing'}")
    print(f"   SUPABASE_KEY: {'✅ Set' if supabase_key else '❌ Missing'}")
    
    if not supabase_url or not supabase_key:
        print("\n❌ ERROR: Missing Supabase credentials!")
        print("Please set SUPABASE_URL and SUPABASE_KEY in your .env file")
        return
    
    # Try to connect
    try:
        print(f"\n2. Creating Supabase client...")
        client = create_client(supabase_url, supabase_key)
        print("   ✅ Client created successfully")
        
        # Test flashcards table
        print(f"\n3. Testing 'flashcards' table...")
        try:
            response = client.table('flashcards').select('*').limit(1).execute()
            print(f"   ✅ Table exists (found {len(response.data)} records)")
        except Exception as e:
            print(f"   ❌ Table access failed: {str(e)}")
            print("\n   💡 You need to create the flashcards table!")
            print("   Run the SQL in: backend/database/schema.sql")
        
        # Test lecture_sessions table
        print(f"\n4. Testing 'lecture_sessions' table...")
        try:
            response = client.table('lecture_sessions').select('*').limit(1).execute()
            print(f"   ✅ Table exists (found {len(response.data)} records)")
        except Exception as e:
            print(f"   ❌ Table access failed: {str(e)}")
            print("\n   💡 You need to create the lecture_sessions table!")
            print("   Run the SQL in: backend/database/schema.sql")
        
        # Test insert operation
        print(f"\n5. Testing INSERT operation...")
        try:
            test_card = {
                'question': 'Test Question',
                'answer': 'Test Answer',
                'lecture_title': 'Connection Test',
                'user_id': None
            }
            response = client.table('flashcards').insert(test_card).execute()
            
            if response.data:
                flashcard_id = response.data[0]['id']
                print(f"   ✅ INSERT successful (ID: {flashcard_id})")
                
                # Clean up test data
                client.table('flashcards').delete().eq('id', flashcard_id).execute()
                print(f"   ✅ Test data cleaned up")
            else:
                print(f"   ⚠️ INSERT returned no data")
                
        except Exception as e:
            print(f"   ❌ INSERT failed: {str(e)}")
            print("\n   💡 Check your Supabase policies/permissions")
        
        print(f"\n{'=' * 50}")
        print("✅ CONNECTION TEST COMPLETE")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED: {str(e)}")
        print("\nPossible issues:")
        print("1. Wrong SUPABASE_URL or SUPABASE_KEY")
        print("2. Supabase project is paused/deleted")
        print("3. Network connection issues")

if __name__ == "__main__":
    test_connection()

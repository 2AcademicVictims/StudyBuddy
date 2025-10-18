"""
Multi-LLM Router Service
Routes user queries to the most appropriate AI model based on keywords
"""
import os
from typing import Tuple
from anthropic import Anthropic
from openai import OpenAI
import google.generativeai as genai
from groq import Groq
import httpx


class LLMRouter:
    def __init__(self):
        """Initialize all LLM clients with API keys from environment"""
        self.available_models = {}
        self.api_key_status = {}
        
        # Claude (Anthropic)
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        if anthropic_key:
            anthropic_key = anthropic_key.strip("'\"")
        if anthropic_key and not anthropic_key.startswith('your_'):
            try:
                # Create httpx client without proxies to avoid parameter error
                http_client = httpx.Client()
                self.anthropic = Anthropic(
                    api_key=anthropic_key,
                    http_client=http_client
                )
                self.available_models['Claude'] = True
                self.api_key_status['Claude'] = 'configured'
            except Exception as e:
                self.anthropic = None
                self.available_models['Claude'] = False
                self.api_key_status['Claude'] = f'error: {str(e)}'
        else:
            self.anthropic = None
            self.available_models['Claude'] = False
            self.api_key_status['Claude'] = 'missing or invalid key'
        
        # ChatGPT (OpenAI)
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key:
            openai_key = openai_key.strip("'\"")
        if openai_key and not openai_key.startswith('your_'):
            try:
                # Create httpx client without proxies to avoid parameter error
                http_client = httpx.Client()
                self.openai = OpenAI(
                    api_key=openai_key,
                    http_client=http_client
                )
                self.available_models['ChatGPT'] = True
                self.api_key_status['ChatGPT'] = 'configured'
            except Exception as e:
                self.openai = None
                self.available_models['ChatGPT'] = False
                self.api_key_status['ChatGPT'] = f'error: {str(e)}'
        else:
            self.openai = None
            self.available_models['ChatGPT'] = False
            self.api_key_status['ChatGPT'] = 'missing or invalid key'
        
        # Gemini (Google)
        google_key = os.getenv('GOOGLE_API_KEY')
        if google_key:
            google_key = google_key.strip("'\"")
        if google_key and not google_key.startswith('your_'):
            try:
                genai.configure(api_key=google_key)
                # ✅ FIXED - Using gemini-1.5-flash (faster and newer)
                self.gemini = genai.GenerativeModel('gemini-2.5-flash')  # Latest stable
                self.available_models['Gemini'] = True
                self.api_key_status['Gemini'] = 'configured'
            except Exception as e:
                self.gemini = None
                self.available_models['Gemini'] = False
                self.api_key_status['Gemini'] = f'error: {str(e)}'
        else:
            self.gemini = None
            self.available_models['Gemini'] = False
            self.api_key_status['Gemini'] = 'missing or invalid key'
        
        # Groq
        groq_key = os.getenv('GROQ_API_KEY')
        if groq_key:
            groq_key = groq_key.strip("'\"")
        if groq_key and not groq_key.startswith('your_'):
            try:
                # Create httpx client without proxies to avoid parameter error
                http_client = httpx.Client()
                self.groq = Groq(
                    api_key=groq_key,
                    http_client=http_client
                )
                self.available_models['Groq'] = True
                self.api_key_status['Groq'] = 'configured'
            except Exception as e:
                self.groq = None
                self.available_models['Groq'] = False
                self.api_key_status['Groq'] = f'error: {str(e)}'
        else:
            self.groq = None
            self.available_models['Groq'] = False
            self.api_key_status['Groq'] = 'missing or invalid key'
        
        # Log status
        print("\n=== LLM Router Status ===")
        for model, status in self.api_key_status.items():
            icon = "✅" if self.available_models.get(model) else "❌"
            print(f"{icon} {model}: {status}")
        print("========================\n")
    
    def get_available_models(self):
        """Get list of available models"""
        return [model for model, available in self.available_models.items() if available]
    
    def has_any_model(self):
        """Check if at least one model is available"""
        return any(self.available_models.values())
    
    async def route_message(self, text: str) -> Tuple[str, str]:
        """
        Route message to appropriate LLM based on keywords
        Returns: (model_name, response_text)
        """
        # Check if we have any working models
        if not self.has_any_model():
            return ("System", "❌ No AI models are available. Please configure at least one API key in your .env file. Check the API_KEY_GUIDE.md for instructions.")
        
        text_lower = text.lower()
        available = self.get_available_models()
        
        # Technical keywords -> Claude (if available)
        technical_keywords = [
            'code', 'program', 'algorithm', 'database', 'sql', 
            'python', 'javascript', 'function', 'debug', 'class',
            'method', 'api', 'framework', 'compile', 'syntax',
            'variable', 'array', 'loop', 'data structure', 'linked list',
            'binary tree', 'recursion', 'complexity', 'implement'
        ]
        
        if any(keyword in text_lower for keyword in technical_keywords):
            if 'Claude' in available:
                return await self._call_claude(text)
            elif available:  # Use any available model
                return await self.call_specific_model(available[0], text)
        
        # Creative keywords -> ChatGPT (if available)
        creative_keywords = [
            'idea', 'brainstorm', 'essay', 'write', 'story', 
            'creative', 'design', 'imagine', 'compose', 'draft',
            'outline', 'thesis', 'argument', 'narrative', 'poem',
            'blog', 'article', 'script', 'dialogue'
        ]
        
        if any(keyword in text_lower for keyword in creative_keywords):
            if 'ChatGPT' in available:
                return await self._call_chatgpt(text)
            elif available:
                return await self.call_specific_model(available[0], text)
        
        # Factual keywords -> Gemini (if available)
        factual_keywords = [
            'define', 'what is', 'explain', 'meaning', 'concept',
            'definition', 'who was', 'when did', 'where is', 'how does',
            'theory', 'principle', 'law', 'rule', 'fact',
            'history', 'science', 'mathematics', 'physics', 'chemistry'
        ]
        
        if any(keyword in text_lower for keyword in factual_keywords):
            if 'Gemini' in available:
                return await self._call_gemini(text)
            elif available:
                return await self.call_specific_model(available[0], text)
        
        # Default -> Groq (if available), otherwise first available model
        if 'Groq' in available:
            return await self._call_groq(text)
        elif available:
            return await self.call_specific_model(available[0], text)
        else:
            return ("System", "❌ No AI models are configured. Please add API keys to your .env file.")
    
    async def call_specific_model(self, model_name: str, text: str) -> Tuple[str, str]:
        """
        Call a specific LLM model directly
        Returns: (model_name, response_text)
        """
        model_map = {
            'Claude': self._call_claude,
            'ChatGPT': self._call_chatgpt,
            'Gemini': self._call_gemini,
            'Groq': self._call_groq
        }
        
        if model_name in model_map:
            return await model_map[model_name](text)
        else:
            # Fallback to auto-routing if invalid model
            return await self.route_message(text)
    
    async def _call_claude(self, text: str) -> Tuple[str, str]:
        """Call Claude (Anthropic) for technical questions"""
        if not self.anthropic:
            return ("Claude", "⚠️ Claude is not available. Please configure a valid Anthropic API key in your .env file. Visit https://console.anthropic.com/ to get an API key.")
        
        try:
            message = self.anthropic.messages.create(
                model="claude-sonnet-4-5-20250929",  # Claude Sonnet 4.5 (Sep 2025)
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": text}
                ]
            )
            response = message.content[0].text
            return ("Claude", response)
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "authentication" in error_msg.lower():
                return ("Claude", "❌ Authentication failed. Your Anthropic API key is invalid. Please check your API key in the .env file.")
            elif "insufficient_quota" in error_msg or "rate" in error_msg.lower():
                return ("Claude", "⚠️ API quota exceeded or rate limited. Please check your Anthropic account credits.")
            else:
                return ("Claude", f"Error: {error_msg}")
    
    async def _call_chatgpt(self, text: str) -> Tuple[str, str]:
        """Call ChatGPT (OpenAI) for creative tasks"""
        if not self.openai:
            return ("ChatGPT", "⚠️ ChatGPT is not available. Please configure a valid OpenAI API key in your .env file. Visit https://platform.openai.com/api-keys to get an API key.")
        
        try:
            completion = self.openai.chat.completions.create(
                model="gpt-5-2025-08-07",
                messages=[
                    {"role": "system", "content": "You are a creative and helpful study assistant."},
                    {"role": "user", "content": text}
                ],
                # max_completion_tokens=1024
            )
            response = completion.choices[0].message.content
            return ("ChatGPT", response)
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "invalid_api_key" in error_msg:
                return ("ChatGPT", "❌ Authentication failed. Your OpenAI API key is invalid. Please check your API key in the .env file.")
            elif "insufficient_quota" in error_msg or "exceeded" in error_msg.lower():
                return ("ChatGPT", "⚠️ API quota exceeded. Please add credits to your OpenAI account at https://platform.openai.com/account/billing")
            else:
                return ("ChatGPT", f"Error: {error_msg}")
    
    async def _call_gemini(self, text: str) -> Tuple[str, str]:
        """Call Gemini (Google) for factual information"""
        if not self.gemini:
            return ("Gemini", "⚠️ Gemini is not available. Please configure a valid Google API key in your .env file. Visit https://aistudio.google.com/app/apikey to get a FREE API key.")
        
        try:
            response = self.gemini.generate_content(text)
            return ("Gemini", response.text)
        except Exception as e:
            error_msg = str(e)
            if "400" in error_msg or "API_KEY_INVALID" in error_msg:
                return ("Gemini", "❌ Authentication failed. Your Google API key is invalid. Please get a new key at https://aistudio.google.com/app/apikey (it's FREE!)")
            elif "quota" in error_msg.lower() or "rate" in error_msg.lower():
                return ("Gemini", "⚠️ Rate limit exceeded. Please wait a moment and try again (free tier: 60 requests/minute).")
            else:
                return ("Gemini", f"Error: {error_msg}")
    
    async def _call_groq(self, text: str) -> Tuple[str, str]:
        """Call Groq for quick/simple queries"""
        if not self.groq:
            return ("Groq", "⚠️ Groq is not available. Please configure a valid Groq API key in your .env file. Visit https://console.groq.com/ to get a FREE API key.")
        
        try:
            completion = self.groq.chat.completions.create(
                model="llama-3.3-70b-versatile",  # ✅ FIXED - Latest Llama 3.3 model (Oct 2024)
                messages=[
                    {"role": "system", "content": "You are a concise and helpful study assistant."},
                    {"role": "user", "content": text}
                ],
                temperature=0.7,
                max_tokens=1024  # Groq still uses max_tokens (not max_completion_tokens)
            )
            response = completion.choices[0].message.content
            return ("Groq", response)
        except Exception as e:
            import traceback
            error_msg = str(e)
            print(f"Groq Error Details: {traceback.format_exc()}")  # Debug line
            if "401" in error_msg or "invalid_api_key" in error_msg:
                return ("Groq", "❌ Authentication failed. Your Groq API key is invalid. Please get a new key at https://console.groq.com/ (it's FREE!)")
            elif "rate" in error_msg.lower():
                return ("Groq", "⚠️ Rate limit exceeded. Free tier allows 30 requests/minute. Please wait a moment and try again.")
            elif "model" in error_msg.lower():
                return ("Groq", f"⚠️ Model error: {error_msg}. The model may have been updated. Please check https://console.groq.com/docs/models")
            else:
                return ("Groq", f"Error: {error_msg}")


# Singleton instance
llm_router = LLMRouter()

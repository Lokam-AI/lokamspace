import logging
from openai import AsyncOpenAI
from app.config import get_settings
from typing import Dict, Any, Optional
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("garagebot.ai_agent")

settings = get_settings()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class AIAgent:
    def __init__(self):
        self.conversation_history = []
        self.metrics = {
            "llm": {},
            "stt": {},
            "tts": {}
        }

    async def transcribe_audio(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Convert speech to text using OpenAI's Whisper model
        """
        try:
            logger.info("Starting audio transcription")
            response = await client.audio.transcriptions.create(
                model="whisper-1",
                file=("audio.wav", audio_data),
                response_format="verbose_json"
            )
            
            # Store metrics
            self.metrics["stt"].update({
                "timestamp": datetime.now().isoformat(),
                "duration": response.duration,
                "language": response.language
            })
            
            return {
                "text": response.text,
                "language": response.language,
                "duration": response.duration,
                "segments": response.segments
            }
        except Exception as e:
            logger.error(f"Failed to transcribe audio: {str(e)}")
            raise Exception(f"Failed to transcribe audio: {str(e)}")

    async def generate_response(self, text: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate AI response using OpenAI's GPT model with context awareness
        """
        try:
            logger.info("Generating AI response")
            
            # Build messages with conversation history
            messages = [
                {"role": "system", "content": "You are a helpful garage assistant, trained to handle customer inquiries professionally."}
            ]
            
            # Add context if provided
            if context:
                messages.append({
                    "role": "system",
                    "content": f"Context: {json.dumps(context)}"
                })
            
            # Add conversation history
            messages.extend(self.conversation_history)
            
            # Add current user message
            messages.append({"role": "user", "content": text})
            
            start_time = datetime.now()
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                presence_penalty=0.6,
                frequency_penalty=0.0
            )
            end_time = datetime.now()
            
            # Store the interaction in conversation history
            self.conversation_history.append({"role": "user", "content": text})
            self.conversation_history.append({"role": "assistant", "content": response.choices[0].message.content})
            
            # Store metrics
            self.metrics["llm"].update({
                "timestamp": datetime.now().isoformat(),
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
                "response_time": (end_time - start_time).total_seconds()
            })
            
            return {
                "text": response.choices[0].message.content,
                "usage": response.usage.dict(),
                "finish_reason": response.choices[0].finish_reason
            }
        except Exception as e:
            logger.error(f"Failed to generate response: {str(e)}")
            raise Exception(f"Failed to generate response: {str(e)}")

    async def text_to_speech(self, text: str) -> Dict[str, Any]:
        """
        Convert text to speech using OpenAI's TTS model
        """
        try:
            logger.info("Converting text to speech")
            start_time = datetime.now()
            
            response = await client.audio.speech.create(
                model="tts-1",
                voice="nova",
                input=text,
                speed=1.0
            )
            
            end_time = datetime.now()
            
            # Store metrics
            self.metrics["tts"].update({
                "timestamp": datetime.now().isoformat(),
                "text_length": len(text),
                "response_time": (end_time - start_time).total_seconds()
            })
            
            return {
                "audio_data": await response.read(),
                "duration": self.metrics["tts"]["response_time"]
            }
        except Exception as e:
            logger.error(f"Failed to convert text to speech: {str(e)}")
            raise Exception(f"Failed to convert text to speech: {str(e)}")

    def get_metrics(self) -> Dict[str, Any]:
        """Get all collected metrics"""
        return self.metrics

    def get_conversation_history(self) -> list:
        """Get the conversation history"""
        return self.conversation_history

    def clear_conversation_history(self) -> None:
        """Clear the conversation history"""
        self.conversation_history = [] 
import json
from typing import Dict, List, Any, Optional
from openai import OpenAI, AsyncOpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ConversationAnalyzer:
    def __init__(self, api_key: str = None):
        self.ratings = {
            "overall_service": None,
            "timeliness": None,
            "cleanliness": None,
            "advisor_helpfulness": None,
            "work_quality": None,
            "recommendation": None
        }
        self.additional_feedback = None
        
        # Set up OpenAI client
        if api_key:
            self.client = AsyncOpenAI(api_key=api_key)
        elif os.getenv("OPENAI_API_KEY"):
            self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        else:
            raise ValueError("OpenAI API key must be provided either through environment variable or constructor")

    async def analyze_conversation(self, conversation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use LLM to analyze the entire conversation and extract structured information.
        """
        # Format conversation for LLM
        formatted_conversation = "\n".join([
            f"{'Agent' if msg.get('role') == 'assistant' else 'Customer'}: {msg.get('content', [''])[0]}"
            for msg in conversation.get('items', [])
            if msg.get('type') == 'message' and msg.get('content')
        ])

        try:
            # Create the completion request using the new API format
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a precise conversation analyzer focused on extracting detailed information from customer service reviews.
                        You must analyze each question-answer pair in detail, including exact quotes, sentiment, and tone.
                        You must always return valid JSON format and extract exact numerical ratings when provided."""
                    },
                    {
                        "role": "user",
                        "content": f"""Analyze this car service review conversation and provide a detailed breakdown of each question-answer interaction.
                        Extract the following in JSON format:

1. Detailed analysis of each rating question, including:
   - The exact question asked
   - The complete customer response (exact quote)
   - Numerical rating (1-10)
   - Sentiment analysis of the response
   - Key points from the response
   - Tone analysis (e.g., satisfied, neutral, frustrated)

2. Overall feedback analysis:
   - Positive aspects mentioned
   - Areas for improvement
   - Additional suggestions
   - Customer tone throughout conversation

3. Overall sentiment and summary

Conversation:
{formatted_conversation}

Return ONLY valid JSON in this exact format:
{{
    "detailed_qa_analysis": {{
        "overall_service": {{
            "question": "exact question text",
            "response": "exact customer response",
            "rating": <number or null>,
            "sentiment": "positive/neutral/negative",
            "key_points": ["point1", "point2"],
            "tone": "description of customer's tone",
            "context_notes": "any additional context or observations"
        }},
        "timeliness": {{
            // same structure as above
        }},
        "cleanliness": {{
            // same structure as above
        }},
        "advisor_helpfulness": {{
            // same structure as above
        }},
        "work_quality": {{
            // same structure as above
        }},
        "recommendation": {{
            // same structure as above
        }}
    }},
    "overall_analysis": {{
        "ratings_summary": {{
            "individual_ratings": {{
                "overall_service": <number or null>,
                "timeliness": <number or null>,
                "cleanliness": <number or null>,
                "advisor_helpfulness": <number or null>,
                "work_quality": <number or null>,
                "recommendation": <number or null>
            }},
            "average_rating": <number>
        }},
        "feedback": {{
            "positive_points": ["point1", "point2"],
            "areas_for_improvement": ["area1", "area2"],
            "additional_comments": ["comment1", "comment2"]
        }},
        "customer_tone": {{
            "overall": "description of overall tone",
            "progression": "how tone changed during conversation",
            "notable_moments": ["moment1", "moment2"]
        }},
        "sentiment": {{
            "overall": "positive/neutral/negative",
            "explanation": "detailed explanation",
            "confidence": "high/medium/low"
        }}
    }},
    "conversation_summary": "comprehensive summary",
    "recommendations_for_staff": ["recommendation1", "recommendation2"]
}}"""
                    }
                ],
                temperature=0.1
            )
            
            # Extract and process the response
            response_content = response.choices[0].message.content
            response_content = response_content.strip()
            if response_content.startswith("```json"):
                response_content = response_content[7:-3]
            
            analysis = json.loads(response_content)
            
            # Update internal ratings from the detailed analysis
            self.ratings = analysis["overall_analysis"]["ratings_summary"]["individual_ratings"]
            
            return analysis

        except Exception as e:
            print(f"Error in LLM analysis: {e}")
            return self._generate_error_response()

    def _generate_error_response(self) -> Dict[str, Any]:
        """Generate a structured error response"""
        return {
            "detailed_qa_analysis": {
                category: {
                    "question": "Not available",
                    "response": "Not available",
                    "rating": None,
                    "sentiment": "unknown",
                    "key_points": [],
                    "tone": "unknown",
                    "context_notes": "Error in analysis"
                } for category in self.ratings.keys()
            },
            "overall_analysis": {
                "ratings_summary": {
                    "individual_ratings": self.ratings,
                    "average_rating": 0.0
                },
                "feedback": {
                    "positive_points": [],
                    "areas_for_improvement": [],
                    "additional_comments": []
                },
                "customer_tone": {
                    "overall": "unknown",
                    "progression": "unknown",
                    "notable_moments": []
                },
                "sentiment": {
                    "overall": "unknown",
                    "explanation": "Error in analysis",
                    "confidence": "low"
                }
            },
            "conversation_summary": "Error occurred during analysis",
            "recommendations_for_staff": []
        }

    def get_average_rating(self, analysis: Dict[str, Any]) -> float:
        """
        Calculate average rating from the analysis results.
        Only includes ratings that are not None and are valid numbers.
        """
        ratings = analysis["overall_analysis"]["ratings_summary"]["individual_ratings"]
        valid_ratings = [
            float(rating) for rating in ratings.values() 
            if rating is not None and str(rating).isdigit() and 1 <= float(rating) <= 10
        ]
        
        if not valid_ratings:
            return 0.0
            
        average = sum(valid_ratings) / len(valid_ratings)
        return round(average, 2)

    def store_analysis_to_json(self, analysis: Dict[str, Any]):
        """
        Store the analysis results in Feedback.json with the same structure as the printed output.
        """
        # Calculate average rating
        average_rating = self.get_average_rating(analysis)
        
        feedback_data = {
            "detailed_conversation_analysis": {
                "question_by_question_analysis": {
                    category: {
                        "question": details['question'],
                        "response": details['response'],
                        "rating": details['rating'],
                        "sentiment": details['sentiment'],
                        "key_points": details['key_points'],
                        "tone": details['tone'],
                        "context_notes": details['context_notes']
                    } for category, details in analysis["detailed_qa_analysis"].items()
                },
                "overall_analysis": {
                    "ratings_summary": {
                        "individual_ratings": analysis["overall_analysis"]["ratings_summary"]["individual_ratings"],
                        "average_rating": average_rating
                    },
                    "feedback": {
                        "positive_points": analysis["overall_analysis"]["feedback"]["positive_points"],
                        "areas_for_improvement": analysis["overall_analysis"]["feedback"]["areas_for_improvement"]
                    },
                    "customer_tone": {
                        "overall": analysis["overall_analysis"]["customer_tone"]["overall"],
                        "progression": analysis["overall_analysis"]["customer_tone"]["progression"],
                        "notable_moments": analysis["overall_analysis"]["customer_tone"]["notable_moments"]
                    },
                    "sentiment": {
                        "overall": analysis["overall_analysis"]["sentiment"]["overall"],
                        "explanation": analysis["overall_analysis"]["sentiment"]["explanation"],
                        "confidence": analysis["overall_analysis"]["sentiment"]["confidence"]
                    }
                },
                "recommendations_for_staff": analysis["recommendations_for_staff"],
                "conversation_summary": analysis["conversation_summary"]
            }
        }

        try:
            with open('Feedback.json', 'w') as f:
                json.dump(feedback_data, f, indent=2)
        except Exception as e:
            raise Exception(f"Error saving analysis to Feedback.json: {str(e)}")

async def main():
    # Get API key from command line argument
    import sys
    if len(sys.argv) < 2:
        raise ValueError("OpenAI API key must be provided as a command line argument")
    
    api_key = sys.argv[1]
    
    try:
        # Read conversation data from Transcription.json
        with open('Transcription.json', 'r') as file:
            conversation_data = json.load(file)
            
        # Create analyzer instance with API key
        analyzer = ConversationAnalyzer(api_key)

        # Get comprehensive analysis
        analysis = await analyzer.analyze_conversation(conversation_data)
        
        # Store the analysis in Feedback.json
        analyzer.store_analysis_to_json(analysis)

    except FileNotFoundError:
        raise FileNotFoundError("Transcription.json file not found. Please ensure the file exists and contains valid conversation data.")
    except json.JSONDecodeError:
        raise json.JSONDecodeError("Transcription.json contains invalid JSON data. Please check the file format.", "", 0)
    except Exception as e:
        raise Exception(f"Error running analysis: {str(e)}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 
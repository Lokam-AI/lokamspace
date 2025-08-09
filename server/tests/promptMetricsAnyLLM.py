#!/usr/bin/env python3

"""
Script to test and evaluate prompt accuracy using different LLM providers.
This script allows you to test the prompt against multiple models and compare their results.
"""

import os
import sys
import json
import time
import asyncio
import statistics
import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.anyLLM_service import AnyLLMService
from app.core.config import settings

# Sample test data - Aligned with the few-shot examples from the prompt
SAMPLE_TRANSCRIPTS = [
    # Sample 1: Similar to Example A in prompt - Clear positive feedback with explicit NPS
    [
        {"role": "human", "message": "Hello?"},
        {"role": "assistant", "message": "Hi there. Hope you're doing well. This is Luke from Garage 25. Now a good time to talk?"},
        {"role": "human", "message": "Yep. Good time to talk."},
        {"role": "assistant", "message": "Great. I just wanted to check-in and see how your recent oil change service experience was for you."},
        {"role": "human", "message": "It was good. Thanks for asking."},
        {"role": "assistant", "message": "Thanks for sharing that. Always nice to hear. Just 1 last question. On a scale of 0 to 10, 0 is not at all likely and 10 is extremely likely, how likely are you to recommend garage 25 to a friend or colleague?"},
        {"role": "human", "message": "9."}
    ],
    # Sample 2: Similar to Example B in prompt - Feedback about timing issues
    [
        {"role": "human", "message": "Hello."},
        {"role": "assistant", "message": "Awesome. I just wanted to quickly check-in on your recent oil change with us. How was the overall service experience for you?"},
        {"role": "human", "message": "It was alright. You could have improved the timing."},
        {"role": "assistant", "message": "Thanks for sharing that. I appreciate your honesty. Just to understand how you feel overall. On a scale of 0 to 10, 0 is not at all likely, and 10 is extremely likely, likely are you to recommend Garage 25 to a friend or colleague?"},
        {"role": "human", "message": "I'll give you the 8."},
        {"role": "human", "message": "Time. Time. Timing."}
    ],
    # Sample 3: Similar to Example C in prompt - Communication issues
    [
        {"role": "human", "message": "Hi."},
        {"role": "assistant", "message": "Great. Thanks. I'm just following up quickly about recent oil change service. Was the entire service experience for you?"},
        {"role": "human", "message": "It's good. Thanks for asking."},
        {"role": "assistant", "message": "Thanks for sharing that. Always nice to hear. Just 1 last question. On a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely, likely are you to recommend garage 25 to a friend or colleague?"},
        {"role": "human", "message": "7?"},
        {"role": "assistant", "message": "Got it. A 7. Appreciate that. What do you think could have improved your experience to push that score closer to a 10?"},
        {"role": "human", "message": "Maybe you can have you know, better communication because it was not communicated very well with me when to come and when to go."}
    ],
    # Sample 4: Similar to Example D in prompt - Neutral feedback
    [
        {"role": "human", "message": "Hello there."},
        {"role": "assistant", "message": "I was referring to the engine diagnosis service you recently had at garage 25. Just wanted to know how your experience was."},
        {"role": "human", "message": "It was okay. Nothing too great. Nothing too bad."},
        {"role": "assistant", "message": "Appreciate that. And just to get a clearer picture, on a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely, how likely are you to recommend garage"},
        {"role": "human", "message": "It's nothing too great, nothing too bad."}
    ],
    # Sample 5: Similar to Example E in prompt - Dissatisfied with pricing and quality
    [
        {"role": "human", "message": "Hi."},
        {"role": "assistant", "message": "Great. Just wanted to check was the entire service experience for you at Garage 25?"},
        {"role": "human", "message": "Less Okeesh."},
        {"role": "assistant", "message": "Thank you for being honest. Could you share a bit more about what made the experience less okay? Was it related to timeliness, pricing, quality of work, communication, or or or something else?"},
        {"role": "human", "message": "The pricing as well as the bulk of your work."},
        {"role": "assistant", "message": "I appreciate your feedback. To get a clearer picture, a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely."},
        {"role": "human", "message": "I'll do it at 3."}
    ],
    # Sample 6: Similar to Example F in prompt - Excellent experience with timely service
    [
        {"role": "human", "message": "Hello?"},
        {"role": "assistant", "message": "Great. I just wanted to check how was the entire service experience for you?"},
        {"role": "human", "message": "You mean the service experience that I had, I your service station that is?"},
        {"role": "assistant", "message": "Exactly. I'm referring to the service experience at our station for your recent oil change. How did everything go for you?"},
        {"role": "human", "message": "It went very well."},
        {"role": "assistant", "message": "So nice to hear. Thanks for sharing that. Just 1 last question. On a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely, how likely are you to recommend Garage 25 to a friend or colleague"},
        {"role": "human", "message": "Maybe a 9"},
        {"role": "assistant", "message": "Thanks so much for that. Glad to know you had a great experience. Could you tell me what stood out for you? Was it efficiency? Friendliness, satisfaction, or something else?"},
        {"role": "human", "message": "The timeliness I got the car right on time, so the timeliness."}
    ],
    # Sample 7: Similar to Example G in prompt - Mediocre experience
    [
        {"role": "human", "message": "Hi."},
        {"role": "assistant", "message": "Great. Just wanted to check how was the entire service experience for you?"},
        {"role": "human", "message": "It was okay."},
        {"role": "assistant", "message": "Appreciate that. And just to get a clearer picture, a scale of 0 to 10, where 0 is not at all likely and 10 is extremely likely, how likely are you to recommend garage 25 to a friend or colleague?"},
        {"role": "human", "message": "6"},
        {"role": "assistant", "message": "Thanks for being honest. Can you share what went wrong? Or what could have been better? Like, timeliness, pricing transparency, quality of work, staff professionalism,"}
    ],
    # Sample 8: Similar to Example H in prompt - Praise for staff but areas for improvement
    [
        {"role": "human", "message": "Hey."},
        {"role": "assistant", "message": "Great. Just wanted to check how was the entire service experience for you?"},
        {"role": "human", "message": "Oh, it was amazing. The staff was on Boeing."},
        {"role": "assistant", "message": "That's fantastic to hear. Thanks for sharing that."},
        {"role": "human", "message": "Yeah."},
        {"role": "assistant", "message": "Always nice to hear. Just 1 last question. On a scale of 0 to 10, where 0 got it. Thank you for your feedback."},
        {"role": "human", "message": "7."},
        {"role": "assistant", "message": "What could have made your experience a 10?"},
        {"role": "human", "message": "Timeliness, maybe some customer experience, and pricing."}
    ],
    # Sample 9: Similar to Example I in prompt - Serious doubts about service quality
    [
        {"role": "human", "message": "Hello."},
        {"role": "assistant", "message": "Thank you. I'm calling to get your feedback on your recent oil change service with us. Just wanted to check how was the entire service experience for you?"},
        {"role": "human", "message": "Be honest, I'm really like, I have doubts that did you really change the oil?"},
        {"role": "assistant", "message": "Really sorry to hear that you're feeling this way. Can you tell me what specifically led you to to doubt it? Was there any particular issue or concern?"},
        {"role": "human", "message": "I'm not seeing any improvements in the driving experience. I'm still seeing some, I know, grinding noise from the engine. I have issue."},
        {"role": "assistant", "message": "Thank you for sharing that. I understand how concerning that must be,"},
        {"role": "assistant", "message": "especially after an oil change. That grinding noise"},
        {"role": "assistant", "message": "isn't what you'd expect. On a scale of 0 to 10, how likely are you to recommend garage 25 to a friend or colleague considering this experience?"},
        {"role": "human", "message": "I recommend it. I will give it a 2 or a 1."}
    ],
    # Sample 10: Similar to Example J in prompt - Pricing concerns despite satisfaction
    [
        {"role": "human", "message": "Hi."},
        {"role": "assistant", "message": "Thanks. Great. Thank you. Just wanted to check. How was the entire service experience for you."},
        {"role": "human", "message": "Yeah. Quite good."},
        {"role": "assistant", "message": "That's wonderful to hear. Thank you for sharing that with me. Just 1 last question. On a scale of 0 to 10, where 0 is not at all likely and 10 is extremely likely, How likely are you to recommend garage 25 to a friend or colleague?"},
        {"role": "human", "message": "Say 8"},
        {"role": "assistant", "message": "Appreciate that, Richard. What could we have done to improve your score to a perfect 10?"},
        {"role": "human", "message": "Give me a cheaper price."}
    ]
]

# Sample service record data - Made to match Garage 25
SAMPLE_SERVICE_RECORD = {
    "customer_name": "John Doe",
    "service_type": "Oil Change",
    "vehicle_info": "2019 Honda Civic",
    "service_advisor_name": "Mike Smith"
}

# Sample organization data - Match your prompt examples
SAMPLE_ORGANIZATION = {
    "name": "Garage 25",
    "description": "We are a customer-first automobile service company committed to delivering fast, transparent, and high-quality service experiences for every vehicle owner.",
    "service_center_description": "Our service center specializes in diagnostics, repairs, and preventive maintenance, equipped with certified technicians and state-of-the-art tools.",
    "location": "Los Angeles, CA, USA"
}

# Sample tags - Exactly matching the tags in the prompt examples
SAMPLE_TAGS = ["Reduce Wait Time", "Improve Advisor Communication", "Increase Service Transparency", "Enhance Customer Experience", "Streamline Booking Process"]

# Expected results for evaluation - Aligned with the prompt examples
EXPECTED_RESULTS = [
    {
        "call_summary": "Customer had a positive experience with the oil change service and gave a high recommendation score.",
        "nps_score": 9,
        "positive_mentions": ["Enhance Customer Experience", "Reduce Wait Time"],
        "detractors": ["Increase Service Transparency"]
    },
    {
        "call_summary": "Customer reported adequate service but highlighted timing issues with the oil change.",
        "nps_score": 8,
        "positive_mentions": ["Enhance Customer Experience", "Improve Advisor Communication"],
        "detractors": ["Reduce Wait Time"]
    },
    {
        "call_summary": "Customer was satisfied with service but identified communication issues regarding timing.",
        "nps_score": 7,
        "positive_mentions": ["Enhance Customer Experience"],
        "detractors": ["Improve Advisor Communication", "Streamline Booking Process"]
    },
    {
        "call_summary": "Customer felt the engine diagnosis service was average.",
        "nps_score": 5,
        "positive_mentions": [],
        "detractors": ["Enhance Customer Experience", "Increase Service Transparency"]
    },
    {
        "call_summary": "Customer was dissatisfied with both pricing and quality of work.",
        "nps_score": 3,
        "positive_mentions": [],
        "detractors": ["Increase Service Transparency", "Enhance Customer Experience", "Improve Advisor Communication"]
    },
    {
        "call_summary": "Customer had an excellent experience with emphasis on timely service completion.",
        "nps_score": 9,
        "positive_mentions": ["Reduce Wait Time", "Enhance Customer Experience"],
        "detractors": ["Streamline Booking Process"]
    },
    {
        "call_summary": "Customer found the service experience to be mediocre.",
        "nps_score": 6,
        "positive_mentions": [],
        "detractors": ["Enhance Customer Experience", "Increase Service Transparency", "Reduce Wait Time"]
    },
    {
        "call_summary": "Customer praised staff but identified three areas for service improvement.",
        "nps_score": 7,
        "positive_mentions": ["Improve Advisor Communication"],
        "detractors": ["Reduce Wait Time", "Enhance Customer Experience", "Increase Service Transparency"]
    },
    {
        "call_summary": "Customer expressed serious doubts about service completion due to persistent engine noise.",
        "nps_score": 1,
        "positive_mentions": [],
        "detractors": ["Increase Service Transparency", "Enhance Customer Experience", "Improve Advisor Communication"]
    },
    {
        "call_summary": "Customer had a positive experience but noted pricing concerns affected their recommendation score.",
        "nps_score": 8,
        "positive_mentions": ["Enhance Customer Experience", "Improve Advisor Communication"],
        "detractors": ["Increase Service Transparency"]
    }
]


class ModelCompareTester:
    def __init__(self, models_to_test=None):
        self.service = AnyLLMService()
        
        # Define the models to test (if not provided, use defaults)
        self.models_to_test = models_to_test or [
            # Format is "provider/model_name"
            "openai/gpt-4o",
            "openai/gpt-4o-mini",
            "groq/llama-3.1-8b-instant",
            "groq/deepseek-r1-distill-llama-70b",
            "groq/moonshotai/kimi-k2-instruct",
            "groq/llama-3.3-70b-versatile",  # Groq's Llama3 70B
            "groq/openai/gpt-oss-120b",
            "groq/openai/gpt-oss-20b"

            # "openai/gpt-4o-2024-08-06",  # Default OpenAI model
            # "anthropic/claude-3-opus-20240229",  # Anthropic's top model
            # "anthropic/claude-3-sonnet-20240229",  # More affordable Anthropic model
            # "mistral/mistral-large-latest",  # Mistral's top model
            # "ollama/llama3",  # Commented out as it requires local setup
        ]
        
        self.results = {}
        self.timing = {}
        self.token_usage = {}
        
        for model in self.models_to_test:
            self.results[model] = []
            self.timing[model] = []
            self.token_usage[model] = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        
        # Define which transcripts are considered "challenging" (the additional ones)
        self.challenging_transcripts = [5, 6, 7, 8, 9]  # 0-indexed
    
    def count_challenging_cases(self, model_name):
        """Count how many of the challenging cases the model handled correctly"""
        correct_count = 0
        for idx in self.challenging_transcripts:
            result = self.results[model_name][idx]
            expected = EXPECTED_RESULTS[idx]
            # Check if NPS is correct or within 1 point
            nps_correct = False
            if result["nps_score"] == expected["nps_score"]:
                nps_correct = True
            elif result["nps_score"] is not None and expected["nps_score"] is not None:
                if abs(result["nps_score"] - expected["nps_score"]) <= 1:
                    nps_correct = True
            
            # Check if key tags are correct (at least 50% match)
            pos_correct = False
            if expected["positive_mentions"]:
                match_count = len(set(result["positive_mentions"]) & set(expected["positive_mentions"]))
                if match_count / len(expected["positive_mentions"]) >= 0.5:
                    pos_correct = True
            else:
                # If no positive mentions expected, it's correct if none or very few were found
                if len(result["positive_mentions"]) <= 1:
                    pos_correct = True
            
            neg_correct = False
            if expected["detractors"]:
                match_count = len(set(result["detractors"]) & set(expected["detractors"]))
                if match_count / len(expected["detractors"]) >= 0.5:
                    neg_correct = True
            else:
                # If no detractors expected, it's correct if none or very few were found
                if len(result["detractors"]) <= 1:
                    neg_correct = True
            
            # Consider the case handled correctly if NPS and at least one tag type is correct
            if nps_correct and (pos_correct or neg_correct):
                correct_count += 1
        
        return correct_count

    def print_ascii_chart(self, metrics_dict):
        """Print an ASCII chart comparing key metrics for all models"""
        # ANSI color codes
        GREEN = "\033[92m"
        RED = "\033[91m"
        BOLD = "\033[1m"
        ENDC = "\033[0m"
        
        # Select key metrics to visualize
        key_metrics = [
            {"name": "Overall Score", "key": "overall_score"},
            {"name": "NPS Accuracy", "key": "nps_exact_match"},
            {"name": "Summary Match", "key": "summary_match"},
            {"name": "Positive Tags F1", "key": "positive_mentions_f1"},
            {"name": "Detractor Tags F1", "key": "detractors_f1"},
        ]
        
        max_width = 40  # Maximum width of the bar
        
        # Find best model for each metric
        best_models = {}
        for metric in key_metrics:
            best_val = 0
            best_model = None
            for model_name in self.models_to_test:
                val = metrics_dict[model_name][metric["key"]]
                if val > best_val:
                    best_val = val
                    best_model = model_name
            best_models[metric["key"]] = best_model
        
        # Print headers
        print(f"\n{'Metric':<25} {'Value':<10} {'Model':<30}")
        print("-" * 80)
        
        for metric in key_metrics:
            for model_name in self.models_to_test:
                val = metrics_dict[model_name][metric["key"]]
                bar_len = int((val / 100) * max_width)
                
                # Format the bar with colors for the best model
                if model_name == best_models[metric["key"]]:
                    bar = f"{GREEN}{'█' * bar_len}{ENDC}"
                    model_display = f"{GREEN}{model_name.split('/')[-1]}{ENDC}"
                else:
                    bar = f"{'█' * bar_len}"
                    model_display = model_name.split('/')[-1]
                
                # Print the chart line
                print(f"{metric['name']:<25} {val:.1f}%{' ' * 5} {model_display:<30} {bar}")
            
            # Add a separator between metrics
            print("-" * 80)

    async def test_model(self, model_name: str, transcript_idx: int) -> Dict[str, Any]:
        """Test a specific model with a specific transcript"""
        transcript = SAMPLE_TRANSCRIPTS[transcript_idx]
        
        start_time = time.time()
        max_retries = 2  # Allow one retry for JSON parsing errors
        
        for attempt in range(max_retries):
            try:
                # Check if API key is available for this provider
                provider = model_name.split('/')[0]
                env_var_name = f"{provider.upper()}_API_KEY"
                api_key = os.environ.get(env_var_name)
                
                if not api_key:
                    print(f"Warning: {env_var_name} not found in environment. Skipping {model_name}.")
                    return {
                        "call_summary": f"Error: No API key found for {provider}",
                        "nps_score": None,
                        "overall_feedback": "",
                        "positive_mentions": [],
                        "detractors": []
                    }
                
                # Add delay for rate limiting, especially for Groq
                if provider.lower() == "groq":
                    await asyncio.sleep(3.0)  # 3 second delay for Groq to avoid rate limits
                else:
                    await asyncio.sleep(0.5)  # Small delay for other providers
                    
                result = await self.service.analyze_call_transcript(
                    transcript, SAMPLE_SERVICE_RECORD, SAMPLE_ORGANIZATION, SAMPLE_TAGS, model=model_name
                )
                end_time = time.time()
                self.timing[model_name].append(end_time - start_time)
                
                return result
                
            except Exception as e:
                error_msg = str(e)
                is_json_error = "json" in error_msg.lower() or "parse" in error_msg.lower()
                is_rate_limit = "rate limit" in error_msg.lower() or "429" in error_msg
                
                # If it's the last attempt or not a retryable error, give up
                if attempt == max_retries - 1 or not is_json_error:
                    print(f"❌ Error with {model_name} on transcript {transcript_idx}: {error_msg}")
                    
                    # Add a longer delay after errors to prevent cascading rate limit issues
                    if is_rate_limit:
                        print(f"   Rate limit detected for {model_name}, waiting 5 seconds...")
                        await asyncio.sleep(5)
                    elif is_json_error:
                        print(f"   JSON parsing error for {model_name}, this might be a model output formatting issue")
                        await asyncio.sleep(1)
                    else:
                        await asyncio.sleep(1)
                        
                    return {
                        "call_summary": f"Error: {error_msg}",
                        "nps_score": None,
                        "overall_feedback": "",
                        "positive_mentions": [],
                        "detractors": []
                    }
                else:
                    # Retry for JSON parsing errors
                    print(f"🔄 JSON error with {model_name}, retrying (attempt {attempt + 2}/{max_retries})...")
                    await asyncio.sleep(2)
                    continue

    def calculate_accuracy(self, model_name: str, results: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate accuracy metrics compared to expected results"""
        metrics = {
            "summary_match": 0,
            "nps_exact_match": 0,
            "nps_within_1": 0,
            "positive_mentions_precision": [],
            "positive_mentions_recall": [],
            "positive_mentions_f1": [],
            "detractors_precision": [],
            "detractors_recall": [],
            "detractors_f1": [],
            "overall_score": 0
        }
        
        for i, result in enumerate(results):
            expected = EXPECTED_RESULTS[i]
            
            # Summary accuracy (simple keyword match)
            if any(keyword in result["call_summary"].lower() for keyword in expected["call_summary"].lower().split()):
                metrics["summary_match"] += 1
            
            # NPS score accuracy
            if result["nps_score"] == expected["nps_score"]:
                metrics["nps_exact_match"] += 1
            
            if result["nps_score"] is not None and expected["nps_score"] is not None:
                if abs(result["nps_score"] - expected["nps_score"]) <= 1:
                    metrics["nps_within_1"] += 1
            elif result["nps_score"] is None and expected["nps_score"] is None:
                metrics["nps_within_1"] += 1
            
            # Tag accuracy (precision and recall)
            # Positive mentions precision
            pos_precision = 0.0
            pos_recall = 0.0
            pos_f1 = 0.0
            if result["positive_mentions"]:
                pos_precision = len(set(result["positive_mentions"]) & set(expected["positive_mentions"])) / len(result["positive_mentions"])
                metrics["positive_mentions_precision"].append(pos_precision)
            elif not expected["positive_mentions"]:
                pos_precision = 1.0  # Correctly identified none
                metrics["positive_mentions_precision"].append(pos_precision)
            
            # Positive mentions recall
            if expected["positive_mentions"]:
                pos_recall = len(set(result["positive_mentions"]) & set(expected["positive_mentions"])) / len(expected["positive_mentions"])
                metrics["positive_mentions_recall"].append(pos_recall)
            elif not result["positive_mentions"]:
                pos_recall = 1.0  # Correctly identified none
                metrics["positive_mentions_recall"].append(pos_recall)
            
            # Calculate F1 score for positive mentions
            if pos_precision + pos_recall > 0:
                pos_f1 = 2 * pos_precision * pos_recall / (pos_precision + pos_recall)
                metrics["positive_mentions_f1"].append(pos_f1)
            else:
                metrics["positive_mentions_f1"].append(0.0)
            
            # Detractors precision
            det_precision = 0.0
            det_recall = 0.0
            det_f1 = 0.0
            if result["detractors"]:
                det_precision = len(set(result["detractors"]) & set(expected["detractors"])) / len(result["detractors"])
                metrics["detractors_precision"].append(det_precision)
            elif not expected["detractors"]:
                det_precision = 1.0  # Correctly identified none
                metrics["detractors_precision"].append(det_precision)
            
            # Detractors recall
            if expected["detractors"]:
                det_recall = len(set(result["detractors"]) & set(expected["detractors"])) / len(expected["detractors"])
                metrics["detractors_recall"].append(det_recall)
            elif not result["detractors"]:
                det_recall = 1.0  # Correctly identified none
                metrics["detractors_recall"].append(det_recall)
            
            # Calculate F1 score for detractors
            if det_precision + det_recall > 0:
                det_f1 = 2 * det_precision * det_recall / (det_precision + det_recall)
                metrics["detractors_f1"].append(det_f1)
            else:
                metrics["detractors_f1"].append(0.0)
        
        # Calculate averages for precision, recall and F1
        for key in ["positive_mentions_precision", "positive_mentions_recall", "positive_mentions_f1",
                  "detractors_precision", "detractors_recall", "detractors_f1"]:
            if metrics[key]:
                metrics[key] = statistics.mean(metrics[key])
            else:
                metrics[key] = 0.0
        
        # Calculate normalized metrics (as percentages)
        metrics["summary_match"] = (metrics["summary_match"] / len(results)) * 100
        metrics["nps_exact_match"] = (metrics["nps_exact_match"] / len(results)) * 100
        metrics["nps_within_1"] = (metrics["nps_within_1"] / len(results)) * 100
        metrics["positive_mentions_precision"] *= 100
        metrics["positive_mentions_recall"] *= 100
        metrics["positive_mentions_f1"] *= 100
        metrics["detractors_precision"] *= 100
        metrics["detractors_recall"] *= 100
        metrics["detractors_f1"] *= 100
        
        # Calculate overall score (weighted average of all metrics)
        metrics["overall_score"] = (
            metrics["summary_match"] * 0.15 +
            metrics["nps_exact_match"] * 0.15 +
            metrics["nps_within_1"] * 0.1 +
            metrics["positive_mentions_precision"] * 0.1 +
            metrics["positive_mentions_recall"] * 0.1 +
            metrics["positive_mentions_f1"] * 0.1 +
            metrics["detractors_precision"] * 0.1 +
            metrics["detractors_recall"] * 0.1 +
            metrics["detractors_f1"] * 0.1
        )
        
        return metrics

    async def run_tests(self):
        """Run all tests for all models"""
        print("Starting prompt accuracy tests across multiple LLM models...")
        
        # Create a timestamp for the results file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Test each model
        all_metrics = {}
        for model_idx, model_name in enumerate(self.models_to_test):
            provider = model_name.split('/')[0]
            model_short = model_name.split('/')[-1]
            
            print(f"\n[{model_idx + 1}/{len(self.models_to_test)}] Testing {provider.upper()} model: {model_short}...")
            
            # Track successful and failed requests
            successful_requests = 0
            failed_requests = 0
            
            for i in range(len(SAMPLE_TRANSCRIPTS)):
                try:
                    print(f" Processing transcript {i+1}/{len(SAMPLE_TRANSCRIPTS)}...", end=" ", flush=True)
                    
                    result = await self.test_model(model_name, i)
                    self.results[model_name].append(result)
                    
                    # Check if the request was successful
                    if "Error:" not in result.get("call_summary", ""):
                        successful_requests += 1
                        print("✅")
                    else:
                        failed_requests += 1
                        print("❌")
                        
                except KeyboardInterrupt:
                    print(f"\n\n⚠️  Test interrupted by user for {model_name}")
                    print(f"   Completed: {i}/{len(SAMPLE_TRANSCRIPTS)} transcripts")
                    # Fill remaining results with empty ones for consistency
                    while len(self.results[model_name]) < len(SAMPLE_TRANSCRIPTS):
                        self.results[model_name].append({
                            "call_summary": "Test interrupted by user",
                            "nps_score": None,
                            "overall_feedback": "",
                            "positive_mentions": [],
                            "detractors": []
                        })
                    break
                except Exception as e:
                    print(f"❌ (Unexpected error: {e})")
                    failed_requests += 1
                    self.results[model_name].append({
                        "call_summary": f"Unexpected error: {str(e)}",
                        "nps_score": None,
                        "overall_feedback": "",
                        "positive_mentions": [],
                        "detractors": []
                    })
            
            # Calculate metrics for this model
            metrics = self.calculate_accuracy(model_name, self.results[model_name])
            all_metrics[model_name] = metrics
            
            # Print a brief summary for this model
            print(f"\n📊 {provider.upper()} - {model_short} Results:")
            print(f"   ✅ Successful requests: {successful_requests}/{len(SAMPLE_TRANSCRIPTS)}")
            print(f"   ❌ Failed requests: {failed_requests}/{len(SAMPLE_TRANSCRIPTS)}")
            if successful_requests > 0:
                print(f"   📈 Overall Score: {metrics['overall_score']:.2f}%")
                print(f"   🎯 NPS Accuracy: {metrics['nps_exact_match']:.2f}%")
                print(f"   🏆 Challenging Cases: {self.count_challenging_cases(model_name)}/5")
                
                # Calculate average response time with error handling
                if self.timing[model_name]:
                    avg_time = statistics.mean(self.timing[model_name])
                    print(f"   ⏱️  Avg Response Time: {avg_time:.2f}s")
                else:
                    print(f"   ⏱️  Avg Response Time: N/A (no successful requests)")
            else:
                print(f"   ⚠️  No successful requests - cannot calculate metrics")
                # Set all metrics to 0 for failed models
                for key in metrics:
                    metrics[key] = 0.0
        
        # Sort models by overall score
        sorted_models = sorted(all_metrics.keys(), key=lambda m: all_metrics[m]["overall_score"], reverse=True)
        
        # Print final results with ASCII charts
        print("\n" + "="*80)
        print(f"\033[1mMODEL COMPARISON RESULTS\033[0m")
        print("="*80)
        
        print("\n🏆 Model Rankings (by overall score):")
        for i, model in enumerate(sorted_models):
            provider = model.split('/')[0]
            model_short = model.split('/')[-1]
            score = all_metrics[model]["overall_score"]
            
            # Calculate average time with error handling
            if self.timing[model]:
                time_avg = statistics.mean(self.timing[model])
                print(f"{i+1}. {provider.upper()}/{model_short}: {score:.2f}% (avg {time_avg:.2f}s)")
            else:
                print(f"{i+1}. {provider.upper()}/{model_short}: {score:.2f}% (no timing data)")
        
        # Print ASCII chart for visual comparison
        print("\n📊 Visual Comparison of Models:")
        self.print_ascii_chart(all_metrics)
        
        # Save detailed results to file
        results_file = f"model_comparison_{timestamp}.json"
        with open(results_file, "w") as f:
            json.dump({
                "test_time": timestamp,
                "models_tested": self.models_to_test,
                "results": {model: [self._clean_for_json(r) for r in self.results[model]] 
                           for model in self.models_to_test},
                "metrics": all_metrics,
                "timing": {model: [round(t, 4) for t in self.timing[model]] 
                          for model in self.models_to_test},
                "rankings": {
                    "overall_score": [(model, all_metrics[model]["overall_score"]) 
                                    for model in sorted_models]
                }
            }, f, indent=2)
        
        print(f"\nDetailed results saved to: {os.path.abspath(results_file)}")
        
        # Ask if user wants to see per-transcript details
        print("\nDisplay options:")
        print("1. Show detailed results for all models and transcripts")
        print("2. Show results for best model only")
        print("3. Exit")
        
        choice = input("Enter your choice (1-3) [default=2]: ").strip() or "2"
        
        if choice == "1":
            for model_name in sorted_models:
                provider = model_name.split('/')[0]
                model_short = model_name.split('/')[-1]
                print(f"\n\033[1m{provider.upper()}/{model_short} DETAILED RESULTS:\033[0m")
                
                for i in range(len(SAMPLE_TRANSCRIPTS)):
                    result = self.results[model_name][i]
                    expected = EXPECTED_RESULTS[i]
                    
                    print(f"\nTranscript {i+1}:")
                    print(f"Expected: NPS={expected['nps_score']}, Tags+={expected['positive_mentions']}, Tags-={expected['detractors']}")
                    print(f"Result: NPS={result['nps_score']}, Tags+={result['positive_mentions']}, Tags-={result['detractors']}")
        
        elif choice == "2":
            best_model = sorted_models[0]
            provider = best_model.split('/')[0]
            model_short = best_model.split('/')[-1]
            print(f"\n\033[1mBEST MODEL ({provider.upper()}/{model_short}) DETAILED RESULTS:\033[0m")
            
            for i in range(len(SAMPLE_TRANSCRIPTS)):
                result = self.results[best_model][i]
                expected = EXPECTED_RESULTS[i]
                
                print(f"\nTranscript {i+1}:")
                print(f"Expected: NPS={expected['nps_score']}, Tags+={expected['positive_mentions']}, Tags-={expected['detractors']}")
                print(f"Result: NPS={result['nps_score']}, Tags+={result['positive_mentions']}, Tags-={result['detractors']}")
    
    def _clean_for_json(self, obj):
        """Clean object for JSON serialization"""
        if isinstance(obj, dict):
            return {k: self._clean_for_json(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._clean_for_json(i) for i in obj]
        elif isinstance(obj, (int, float, str, bool, type(None))):
            return obj
        else:
            return str(obj)

async def main():
    # Setup basic logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logger = logging.getLogger("promptMetricsAnyLLM")
    
    # Define all models to test (using the complete list from ModelCompareTester class)
    all_models_to_test = [
        # OpenAI models
        "openai/gpt-4o",
        "openai/gpt-4o-mini",
        # Groq models
        "groq/llama-3.1-8b-instant",
        "groq/deepseek-r1-distill-llama-70b", 
        "groq/moonshotai/kimi-k2-instruct",
        "groq/llama-3.3-70b-versatile",
        "groq/openai/gpt-oss-120b",
        "groq/openai/gpt-oss-20b"
    ]
    
    # Check for API keys and filter models based on availability
    available_models = []
    
    # Check for API keys and add corresponding models
    if os.environ.get("OPENAI_API_KEY"):
        logger.info("OpenAI API key found")
        # Add all OpenAI models from our list
        available_models.extend([m for m in all_models_to_test if m.startswith("openai/")])
    else:
        logger.warning("OPENAI_API_KEY not found - OpenAI models will be skipped")
    
    if os.environ.get("GROQ_API_KEY"):
        logger.info("Groq API key found")
        # Add all Groq models from our list
        available_models.extend([m for m in all_models_to_test if m.startswith("groq/")])
    else:
        logger.warning("GROQ_API_KEY not found - Groq models will be skipped")
        
    if os.environ.get("ANTHROPIC_API_KEY"):
        logger.info("Anthropic API key found")
        available_models.append("anthropic/claude-3-sonnet-20240229")
    else:
        logger.warning("ANTHROPIC_API_KEY not found - Anthropic models will be skipped")
    
    if os.environ.get("MISTRAL_API_KEY"):
        logger.info("Mistral API key found")
        available_models.append("mistral/mistral-large-latest")
    else:
        logger.warning("MISTRAL_API_KEY not found - Mistral models will be skipped")
    
    if os.environ.get("OLLAMA_API_BASE"):
        logger.info("Ollama API base found")
        available_models.append("ollama/llama3")
    else:
        logger.warning("OLLAMA_API_BASE not found - Ollama models will be skipped")
    
    if not available_models:
        logger.warning("No API keys found in environment. Using mock mode.")
        print("\nWARNING: No API keys found. Please set at least one of the following environment variables:")
        print("  - OPENAI_API_KEY")
        print("  - GROQ_API_KEY")
        print("  - ANTHROPIC_API_KEY")
        print("  - MISTRAL_API_KEY")
        print("  - OLLAMA_API_BASE (for local Ollama instances)\n")
        
        # Use a mock model for testing the script structure
        available_models = ["mock/gpt-4o-mini"]
    
    logger.info(f"Available models for testing: {available_models}")
    
    # Print usage instructions
    print(f"\n📋 USAGE INSTRUCTIONS:")
    print(f"   python3 promptMetricsAnyLLM.py [provider]")
    print(f"   ")
    print(f"   Options:")
    print(f"   • No argument: Test all available models")
    print(f"   • openai: Test only OpenAI models")  
    print(f"   • groq: Test only Groq models")
    print(f"   • anthropic: Test only Anthropic models")
    print(f"   • fast/quick: Test only first 2 models (for quick testing)")
    print(f"   • openai,groq: Test multiple providers (comma-separated)")
    print(f"")
    
    # Allow command line arguments to select specific providers or models
    models_to_test = available_models
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ['openai', 'groq', 'anthropic', 'mistral', 'ollama']:
            # Filter by provider
            requested_providers = [arg]
            models_to_test = [m for m in available_models if m.split('/')[0] in requested_providers]
            logger.info(f"Filtered models based on provider '{arg}': {models_to_test}")
        elif arg in ['fast', 'quick']:
            # Quick test mode - only test a few models
            models_to_test = available_models[:2] if len(available_models) >= 2 else available_models
            logger.info(f"Quick test mode - testing only: {models_to_test}")
        else:
            # Try to parse as comma-separated providers
            try:
                requested_providers = arg.split(',')
                models_to_test = [m for m in available_models if m.split('/')[0] in requested_providers]
                logger.info(f"Filtered models based on command line args: {models_to_test}")
            except:
                logger.warning(f"Invalid command line argument: {arg}. Using all available models.")
    
    if not models_to_test:
        print(f"❌ No models available for testing with the given filters.")
        return
    
    # Print models that will be tested
    print(f"\n🚀 Starting tests with {len(models_to_test)} models:")
    for model in models_to_test:
        provider = model.split('/')[0]
        model_name = model.split('/')[-1]
        print(f"  - {provider.upper()}: {model_name}")
    
    tester = ModelCompareTester(models_to_test)
    await tester.run_tests()

if __name__ == "__main__":
    asyncio.run(main())
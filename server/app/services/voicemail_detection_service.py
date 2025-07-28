"""
Service for detecting voicemail calls and updating call status accordingly.
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class VoicemailDetectionService:
    """Service for detecting voicemail calls and determining appropriate status."""
    
    # VAPI endedReason values that indicate voicemail or failed calls
    VOICEMAIL_REASONS = {
        "voicemail",
        "voicemail-reached", 
        "voicemail-detected",
        "answering-machine",
        "machine-detected"
    }
    
    # Reasons that indicate call failure (technical issues)
    FAILED_REASONS = {
        "failed", "error", "network-error", "timeout", "system-error",
        "connection-failed", "technical-error", "service-unavailable"
    }
    
    # Reasons that indicate missed calls (customer-side issues, not technical)
    MISSED_REASONS = {
        "no-answer", "busy", "no-response", "hung-up", "cancelled", "interrupted"
    }
    
    @staticmethod
    def determine_call_status(
        ended_reason: Optional[str], 
        vapi_status: Optional[str] = None,
        has_transcript: bool = False,
        call_duration_seconds: Optional[int] = None
    ) -> str:
        """
        Determine the appropriate call status based on VAPI data.
        
        Args:
            ended_reason: The endedReason from VAPI webhook
            vapi_status: The status from VAPI (if available)
            has_transcript: Whether the call has meaningful transcript data
            call_duration_seconds: Duration of the call in seconds
            
        Returns:
            str: Appropriate call status ("Completed", "Missed", "Failed")
        """
        logger.info(f"Determining call status - ended_reason: {ended_reason}, "
                   f"vapi_status: {vapi_status}, has_transcript: {has_transcript}, "
                   f"duration: {call_duration_seconds}")
        
        if not ended_reason:
            logger.warning("No ended_reason provided, defaulting based on other factors")
            return VoicemailDetectionService._determine_fallback_status(
                vapi_status, has_transcript, call_duration_seconds
            )
        
        ended_reason_lower = ended_reason.lower()
        
        # Check for voicemail indicators - these should be marked as "Missed"
        if any(vm_reason in ended_reason_lower for vm_reason in VoicemailDetectionService.VOICEMAIL_REASONS):
            logger.info(f"Call went to voicemail (reason: {ended_reason}) - marking as Missed")
            return "Missed"
        
        # Check for explicit failure reasons
        if any(fail_reason in ended_reason_lower for fail_reason in VoicemailDetectionService.FAILED_REASONS):
            logger.info(f"Call failed (reason: {ended_reason}) - marking as Failed")
            return "Failed"
        
        # Check for missed call reasons
        if any(miss_reason in ended_reason_lower for miss_reason in VoicemailDetectionService.MISSED_REASONS):
            logger.info(f"Call was missed (reason: {ended_reason}) - marking as Missed")
            return "Missed"
        
        # Check for successful completion indicators
        success_reasons = {
            "completed", "finished", "ended-by-assistant", "ended-by-user", 
            "conversation-ended", "goal-achieved", "assistant-ended", "user-ended"
        }
        
        if any(success_reason in ended_reason_lower for success_reason in success_reasons):
            # Additional validation for truly completed calls
            if VoicemailDetectionService._validate_completed_call(has_transcript, call_duration_seconds):
                logger.info(f"Call completed successfully (reason: {ended_reason})")
                return "Completed"
            else:
                logger.info(f"Call ended as '{ended_reason}' but lacks interaction - marking as Missed")
                return "Missed"
        
        # Unknown ended_reason - use fallback logic
        logger.warning(f"Unknown ended_reason: {ended_reason} - using fallback logic")
        return VoicemailDetectionService._determine_fallback_status(
            vapi_status, has_transcript, call_duration_seconds
        )
    
    @staticmethod
    def _validate_completed_call(has_transcript: bool, call_duration_seconds: Optional[int]) -> bool:
        """
        Validate if a call was truly completed based on interaction data.
        
        Args:
            has_transcript: Whether the call has meaningful transcript
            call_duration_seconds: Duration of the call in seconds
            
        Returns:
            bool: True if the call appears to be a genuine completion
        """
        # If there's a meaningful transcript, it's likely a real interaction
        if has_transcript:
            return True
        
        # If the call lasted a reasonable amount of time, likely completed   
        if call_duration_seconds and call_duration_seconds >= 10:  # At least 10 seconds
            return True
        
        # Otherwise, it might be a voicemail or quick disconnect
        return False
    
    @staticmethod
    def _determine_fallback_status(
        vapi_status: Optional[str], 
        has_transcript: bool, 
        call_duration_seconds: Optional[int]
    ) -> str:
        """
        Fallback logic when ended_reason is not available or unknown.
        
        Args:
            vapi_status: The status from VAPI
            has_transcript: Whether call has transcript
            call_duration_seconds: Call duration in seconds
            
        Returns:
            str: Fallback status
        """
        # Use VAPI status if available
        if vapi_status:
            vapi_status_lower = vapi_status.lower()
            if vapi_status_lower in ["failed", "error"]:
                return "Failed"
            elif vapi_status_lower in ["no-answer", "busy", "missed"]:
                return "Missed"
        
        # Use interaction-based heuristics
        if VoicemailDetectionService._validate_completed_call(has_transcript, call_duration_seconds):
            return "Completed"
        
        # Default to Missed for ambiguous cases
        logger.info("Using default status 'Missed' for ambiguous case")
        return "Missed"
    
    @staticmethod
    def is_voicemail_call(ended_reason: Optional[str]) -> bool:
        """
        Check if a call specifically went to voicemail.
        
        Args:
            ended_reason: The endedReason from VAPI
            
        Returns:
            bool: True if the call went to voicemail
        """
        if not ended_reason:
            return False
        
        ended_reason_lower = ended_reason.lower()
        return any(vm_reason in ended_reason_lower for vm_reason in VoicemailDetectionService.VOICEMAIL_REASONS)
    
    @staticmethod
    def get_status_explanation(status: str, ended_reason: Optional[str]) -> str:
        """
        Get a human-readable explanation for the call status.
        
        Args:
            status: The determined call status
            ended_reason: The endedReason from VAPI
            
        Returns:
            str: Human-readable explanation
        """
        if not ended_reason:
            return f"Call status: {status}"
        
        explanations = {
            "Missed": {
                "voicemail": "Call went to customer's voicemail",
                "no-answer": "Customer did not answer the call", 
                "busy": "Customer's line was busy",
                "hung-up": "Customer hung up during the call",
                "no-response": "No response from customer"
            },
            "Failed": {
                "failed": "Call failed due to technical issues",
                "network-error": "Network connectivity problems",
                "timeout": "Call timed out",
                "error": "System error occurred during call"
            },
            "Completed": {
                "completed": "Call completed successfully",
                "conversation-ended": "Conversation ended naturally",
                "assistant-ended": "AI assistant ended the call",
                "user-ended": "Customer ended the call after interaction"
            }
        }
        
        ended_reason_lower = ended_reason.lower()
        status_explanations = explanations.get(status, {})
        
        for reason_key, explanation in status_explanations.items():
            if reason_key in ended_reason_lower:
                return explanation
        
        return f"Call {status.lower()} - {ended_reason}"

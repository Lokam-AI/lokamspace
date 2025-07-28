#!/usr/bin/env python3
"""
Test script for VoicemailDetectionService
Tests various scenarios to ensure correct call status determination
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.voicemail_detection_service import VoicemailDetectionService


class VoicemailDetectionTester:
    """Test suite for voicemail detection logic"""
    
    def __init__(self):
        self.test_cases = [
            # Voicemail scenarios - should be marked as "Missed"
            {
                "name": "Standard voicemail",
                "ended_reason": "voicemail",
                "vapi_status": None,
                "has_transcript": False,
                "duration_seconds": 45,
                "expected": "Missed"
            },
            {
                "name": "Voicemail reached",
                "ended_reason": "voicemail-reached",
                "vapi_status": None,
                "has_transcript": False,
                "duration_seconds": 30,
                "expected": "Missed"
            },
            {
                "name": "Answering machine",
                "ended_reason": "answering-machine",
                "vapi_status": None,
                "has_transcript": False,
                "duration_seconds": 60,
                "expected": "Missed"
            },
            
            # Failed calls scenarios - should be marked as "Failed"
            {
                "name": "Network error",
                "ended_reason": "network-error",
                "vapi_status": "failed",
                "has_transcript": False,
                "duration_seconds": 5,
                "expected": "Failed"
            },
            {
                "name": "Call failed",
                "ended_reason": "failed",
                "vapi_status": "error",
                "has_transcript": False,
                "duration_seconds": 2,
                "expected": "Failed"
            },
            
            # Missed calls scenarios - should be marked as "Missed"
            {
                "name": "No answer",
                "ended_reason": "no-answer",
                "vapi_status": None,
                "has_transcript": False,
                "duration_seconds": 25,
                "expected": "Missed"
            },
            {
                "name": "Line busy",
                "ended_reason": "busy",
                "vapi_status": None,
                "has_transcript": False,
                "duration_seconds": 8,
                "expected": "Missed"
            },
            {
                "name": "Customer hung up quickly",
                "ended_reason": "hung-up",
                "vapi_status": None,
                "has_transcript": False,
                "duration_seconds": 3,
                "expected": "Missed"
            },
            
            # Completed calls scenarios - should be marked as "Completed"
            {
                "name": "Successful conversation with transcript",
                "ended_reason": "completed",
                "vapi_status": "completed",
                "has_transcript": True,
                "duration_seconds": 120,
                "expected": "Completed"
            },
            {
                "name": "User ended after conversation",
                "ended_reason": "user-ended",
                "vapi_status": "completed",
                "has_transcript": True,
                "duration_seconds": 90,
                "expected": "Completed"
            },
            {
                "name": "Assistant ended conversation",
                "ended_reason": "assistant-ended",
                "vapi_status": "completed",
                "has_transcript": True,
                "duration_seconds": 180,
                "expected": "Completed"
            },
            
            # Edge cases
            {
                "name": "Completed but no transcript (likely voicemail)",
                "ended_reason": "completed",
                "vapi_status": "completed",
                "has_transcript": False,
                "duration_seconds": 5,
                "expected": "Missed"
            },
            {
                "name": "Long duration without transcript (possible voicemail)",
                "ended_reason": "completed",
                "vapi_status": "completed",
                "has_transcript": False,
                "duration_seconds": 45,
                "expected": "Completed"  # Long duration suggests real interaction
            },
            {
                "name": "Unknown ended reason with transcript",
                "ended_reason": "unknown-reason",
                "vapi_status": None,
                "has_transcript": True,
                "duration_seconds": 60,
                "expected": "Completed"  # Fallback logic with transcript
            },
            {
                "name": "No ended reason, no transcript",
                "ended_reason": None,
                "vapi_status": None,
                "has_transcript": False,
                "duration_seconds": 8,
                "expected": "Missed"  # Fallback default
            }
        ]
    
    def run_tests(self):
        """Run all test cases and report results"""
        print("🧪 Running Voicemail Detection Tests")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for i, test_case in enumerate(self.test_cases, 1):
            result = self._run_single_test(i, test_case)
            if result:
                passed += 1
            else:
                failed += 1
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed} passed, {failed} failed")
        
        if failed == 0:
            print("✅ All tests passed! Voicemail detection is working correctly.")
        else:
            print(f"❌ {failed} tests failed. Review the implementation.")
        
        return failed == 0
    
    def _run_single_test(self, test_num: int, test_case: dict) -> bool:
        """Run a single test case"""
        try:
            actual_status = VoicemailDetectionService.determine_call_status(
                ended_reason=test_case["ended_reason"],
                vapi_status=test_case["vapi_status"],
                has_transcript=test_case["has_transcript"],
                call_duration_seconds=test_case["duration_seconds"]
            )
            
            expected_status = test_case["expected"]
            success = actual_status == expected_status
            
            # Get explanation for the determination
            explanation = VoicemailDetectionService.get_status_explanation(
                actual_status, test_case["ended_reason"]
            )
            
            status_icon = "✅" if success else "❌"
            
            print(f"{status_icon} Test {test_num:2d}: {test_case['name']}")
            print(f"    Ended Reason: {test_case['ended_reason']}")
            print(f"    Expected: {expected_status}, Got: {actual_status}")
            print(f"    Explanation: {explanation}")
            
            if not success:
                print(f"    ⚠️  MISMATCH: Expected '{expected_status}' but got '{actual_status}'")
            
            print()
            return success
            
        except Exception as e:
            print(f"❌ Test {test_num}: {test_case['name']} - ERROR: {str(e)}")
            print()
            return False
    
    def test_voicemail_detection_methods(self):
        """Test specific voicemail detection methods"""
        print("\n🔍 Testing Additional Methods")
        print("-" * 40)
        
        # Test is_voicemail_call
        voicemail_cases = [
            ("voicemail", True),
            ("voicemail-reached", True),
            ("answering-machine", True),
            ("completed", False),
            ("failed", False),
            (None, False)
        ]
        
        print("Testing is_voicemail_call:")
        for ended_reason, expected in voicemail_cases:
            result = VoicemailDetectionService.is_voicemail_call(ended_reason)
            status = "✅" if result == expected else "❌"
            print(f"  {status} '{ended_reason}' -> {result} (expected {expected})")
        
        print()


def main():
    """Main test execution"""
    tester = VoicemailDetectionTester()
    
    # Run main test suite
    success = tester.run_tests()
    
    # Test additional methods
    tester.test_voicemail_detection_methods()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

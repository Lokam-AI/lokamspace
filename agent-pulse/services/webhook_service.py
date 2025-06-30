import logging
from typing import Dict, Any

from .call_report_service import process_call_report

logger = logging.getLogger(__name__)

class WebhookService:
    def __init__(self):
        pass
    
    async def process_webhook_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process webhook data from VAPI and update database.
        
        Args:
            data: The webhook payload data from VAPI
            
        Returns:
            Dict containing processing results
        """
        try:
            # Check if the data has a message wrapper (VAPI format) or is direct (our saved format)
            if "message" in data:
                # VAPI webhook format: { "message": { "type": "end-of-call-report", ... } }
                message = data.get("message", {})
                call_type = message.get("type")
            else:
                # Our saved format: { "type": "end-of-call-report", ... }
                call_type = data.get("type")
            
            # Process end-of-call reports for database update
            if call_type == "end-of-call-report":
                # Pass the entire data structure to the call report service
                # The call report service will extract the call_id from the appropriate location
                db_result = await process_call_report(data)
                return {
                    "file_saved": False,
                    "file_path": None,
                    "database_updated": db_result["success"],
                    "db_message": db_result.get("message", ""),
                    "db_error": db_result.get("error", "")
                }
            else:
                return {
                    "file_saved": False,
                    "file_path": None,
                    "database_updated": False,
                    "message": f"Call type '{call_type}' not processed for database update"
                }
                
        except Exception as e:
            logger.error(f"Error processing webhook data: {str(e)}")
            return {
                "file_saved": False,
                "database_updated": False,
                "error": str(e)
            } 
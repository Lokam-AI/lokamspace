from typing import Dict, Any
from app.core.logging import get_logger
from app.services.call_report_service import CallReportService

logger = get_logger(__name__)

class WebhookService:
    """Service for processing VAPI webhook data."""
    
    def __init__(self):
        pass
    
    async def process_webhook_data(self, data: Dict[str, Any], db_session) -> Dict[str, Any]:
        """
        Process webhook data from VAPI and update database.
        
        Args:
            data: The webhook payload data from VAPI
            db_session: Database session for processing
            
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
                # Use the call report service to process the data
                call_report_service = CallReportService(db_session)
                db_result = await call_report_service.process_end_call_report(data)
                
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
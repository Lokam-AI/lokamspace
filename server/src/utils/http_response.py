from typing import Any, Optional
from fastapi.responses import JSONResponse

class ResponseBuilder:
    @staticmethod
    def success(message: str = "Success", data: Optional[Any] = None, status_code: int = 200):
        return JSONResponse(
            status_code=status_code,
            content={
                "error": False,
                "data": data,
                "message": message
            }
        )

    @staticmethod
    def error(message: str = "An error occurred", data: Optional[Any] = None, status_code: int = 400):
        return JSONResponse(
            status_code=status_code,
            content={
                "error": True,
                "data": data,
                "message": message
            }
        )

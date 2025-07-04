from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import Any, Optional

class ResponseBuilder:
    @staticmethod
    def success(data: Optional[Any] = None, message: str = "Success", status_code: int = 200):
        return JSONResponse(
            status_code=status_code,
            content=jsonable_encoder({
                "error": False,
                "data": data,
                "message": message
            })
        )

    @staticmethod
    def error(message: str = "Error occurred", data: Optional[Any] = None, status_code: int = 400):
        return JSONResponse(
            status_code=status_code,
            content=jsonable_encoder({
                "error": True,
                "data": data,
                "message": message
            })
        )

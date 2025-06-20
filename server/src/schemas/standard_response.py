from typing import Generic, Optional, TypeVar
from pydantic.generics import GenericModel

T = TypeVar("T")

class StandardResponse(GenericModel, Generic[T]):
    error: bool = False
    data: Optional[T]
    message: str

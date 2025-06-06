from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    class Config:
        env_file = ".env"               # picked up locally
        env_file_encoding = "utf-8"

@lru_cache
def get_settings():
    return Settings()

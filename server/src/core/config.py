from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    LIVEKIT_URL: str = "https://your-cloud.livekit.server"
    LIVEKIT_API_KEY: str = "LIVEKIT_API_KEY"
    LIVEKIT_API_SECRET: str = "LIVEKIT_API_SECRET"
    LIVEKIT_SIP_TRUNK_ID: str = "ST_YOUR_OUTBOUND_TRUNK_ID"
    DATABASE_URL: str = "sqlite:///./lokamspace.db"  # default value

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

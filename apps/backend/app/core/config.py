from functools import lru_cache
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import os

load_dotenv()



class Settings(BaseSettings):
    PROJECT_NAME: str = "bitehack API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    DATABASE_URL: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Compose DATABASE_URL dynamically
        self.DATABASE_URL = (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:5432/"
            f"{self.POSTGRES_DB}"
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

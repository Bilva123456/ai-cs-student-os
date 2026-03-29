from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://bilvarchithayadiki:password@127.0.0.1:5432/ai_cs_os"
    secret_key: str = "change-this-secret-key-in-production-minimum-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    openai_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

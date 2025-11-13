"""Configuration management for AI Code Review Team"""

import os
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Config(BaseSettings):
    """Centralized configuration for the application with validation"""

    # OpenAI Configuration (required)
    OPENAI_API_KEY: str = Field(..., min_length=1, description="OpenAI API key is required")

    # Admin password for unlimited access (bypass rate limiting)
    ADMIN_PASSWORD: str = Field(
        default="alhgeuisy90uwjfcp2349snfdjvegiru",
        description="Admin password for bypassing rate limits"
    )

    # Model Configuration with fallback chain
    PRIMARY_MODEL: str = Field(default="gpt-4o-mini", description="Primary model to use")
    FALLBACK_MODELS: List[str] = Field(
        default=[
            "gpt-4o-mini",
            "gpt-3.5-turbo",
            "gpt-3.5-turbo-0125",
        ],
        description="Fallback models to try in order"
    )

    # API Configuration
    API_TIMEOUT: int = Field(default=60, ge=1, le=300, description="API timeout in seconds")
    MAX_RETRIES: int = Field(default=2, ge=0, le=5, description="Maximum retry attempts")
    TEMPERATURE: float = Field(default=0.3, ge=0.0, le=2.0, description="Model temperature")

    # Review Configuration
    MAX_CODE_LENGTH: int = Field(
        default=10000,
        ge=100,
        le=100000,
        description="Maximum code length in characters"
    )
    ENABLE_PARALLEL_REVIEWS: bool = Field(
        default=True,
        description="Enable parallel agent reviews"
    )

    # Rate Limiting Configuration
    FREE_TIER_DAILY_LIMIT: int = Field(
        default=5,
        ge=1,
        le=100,
        description="Daily review limit for free tier"
    )
    FREE_TIER_HOURLY_LIMIT: int = Field(
        default=3,
        ge=1,
        le=50,
        description="Hourly review limit for free tier"
    )

    @field_validator("OPENAI_API_KEY")
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        """Validate OpenAI API key format"""
        if not v or len(v) < 20:
            raise ValueError("OPENAI_API_KEY must be a valid OpenAI API key")
        if not v.startswith("sk-"):
            raise ValueError("OPENAI_API_KEY should start with 'sk-'")
        return v

    @field_validator("FALLBACK_MODELS")
    @classmethod
    def validate_models(cls, v: List[str]) -> List[str]:
        """Validate model list is not empty"""
        if not v or len(v) == 0:
            raise ValueError("FALLBACK_MODELS must contain at least one model")
        return v

    def get_available_models(self) -> List[str]:
        """Get list of models to try in order"""
        return self.FALLBACK_MODELS

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create and validate config instance
try:
    config = Config()
    print("✓ Configuration loaded and validated successfully")
except Exception as e:
    print(f"✗ Configuration error: {e}")
    raise

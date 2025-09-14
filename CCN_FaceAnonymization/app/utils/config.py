"""
Configuration settings for the Face Anonymization Service
"""

import os
from pydantic import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # CORS settings
    cors_origins: List[str] = ["*"]
    
    # Face detection settings
    min_detection_confidence: float = 0.5
    min_tracking_confidence: float = 0.5
    max_num_faces: int = 5
    
    # Image processing settings
    max_image_size: int = 2000  # Maximum dimension for processing
    min_image_size: int = 200   # Minimum dimension for reliable processing
    
    # Anonymization settings
    default_method: str = "pixelate"
    default_quality: str = "medium"
    
    # Quality settings for different anonymization methods
    quality_settings: dict = {
        "blur": {
            "low": {"kernel_size": 25, "sigma": 8},
            "medium": {"kernel_size": 45, "sigma": 15},
            "high": {"kernel_size": 65, "sigma": 25},
            "extreme": {"kernel_size": 85, "sigma": 35}
        },
        "pixelate": {
            "low": {"pixel_size": 12},
            "medium": {"pixel_size": 20},
            "high": {"pixel_size": 30},
            "extreme": {"pixel_size": 40}
        },
        "solid": {
            "low": {"color": [0, 0, 0]},
            "medium": {"color": [0, 0, 0]},
            "high": {"color": [0, 0, 0]},
            "extreme": {"color": [0, 0, 0]}
        },
        "hybrid": {
            "low": {"kernel_size": 35, "sigma": 12, "pixel_size": 15},
            "medium": {"kernel_size": 55, "sigma": 20, "pixel_size": 25},
            "high": {"kernel_size": 75, "sigma": 30, "pixel_size": 35},
            "extreme": {"kernel_size": 95, "sigma": 40, "pixel_size": 45}
        }
    }
    
    # Logging settings
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

def get_settings() -> Settings:
    """Get application settings"""
    return Settings()

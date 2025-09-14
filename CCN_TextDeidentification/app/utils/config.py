"""
Configuration settings for CCN Text De-identification Service
"""

from pydantic import BaseSettings
from typing import Dict, List, Any

class Settings(BaseSettings):
    """Application settings"""
    
    # Service configuration
    service_name: str = "CCN Text De-identification Service"
    version: str = "1.0.0"
    debug: bool = False
    
    # API configuration
    host: str = "0.0.0.0"
    port: int = 8001
    cors_origins: List[str] = ["*"]
    
    # De-identification settings
    default_method: str = "comprehensive"
    default_sensitivity: str = "high"
    preserve_context: bool = True
    
    # PHI detection thresholds
    confidence_threshold: float = 0.7
    context_length: int = 20
    
    # Performance settings
    max_text_length: int = 10000
    processing_timeout: int = 30
    
    # Logging configuration
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Model settings
    spacy_model: str = "en_core_web_sm"
    nltk_data_path: str = "/tmp/nltk_data"
    
    # Presidio settings
    presidio_language: str = "en"
    presidio_entities: List[str] = [
        "PERSON", "DATE", "LOCATION", "ORGANIZATION", 
        "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD",
        "IBAN_CODE", "IP_ADDRESS", "MEDICAL_LICENSE",
        "US_SSN", "US_PASSPORT", "US_DRIVER_LICENSE"
    ]
    
    # Custom PHI patterns
    custom_patterns: Dict[str, List[str]] = {
        "medical_ids": [
            r"\bMRN:?\s*\d+\b",
            r"\bPatient ID:?\s*\d+\b",
            r"\bCase #:?\s*\d+\b",
            r"\bChart #:?\s*\d+\b"
        ],
        "medical_dates": [
            r"\bDOB:?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
            r"\bAdmission:?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
            r"\bDischarge:?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"
        ],
        "medical_measurements": [
            r"\bWeight:?\s*\d+\s*(?:lbs?|kg)\b",
            r"\bHeight:?\s*\d+\s*(?:ft|feet|in|inches|cm)\b",
            r"\bBP:?\s*\d+/\d+\b",
            r"\bHR:?\s*\d+\s*bpm\b"
        ]
    }
    
    # Replacement patterns
    replacement_patterns: Dict[str, str] = {
        "PERSON": "[PATIENT NAME]",
        "DATE": "[DATE]",
        "LOCATION": "[LOCATION]",
        "ORGANIZATION": "[ORGANIZATION]",
        "PHONE_NUMBER": "[PHONE NUMBER]",
        "EMAIL_ADDRESS": "[EMAIL ADDRESS]",
        "CREDIT_CARD": "[CREDIT CARD]",
        "US_SSN": "[SSN]",
        "US_PASSPORT": "[PASSPORT]",
        "US_DRIVER_LICENSE": "[DRIVER LICENSE]",
        "MEDICAL_LICENSE": "[MEDICAL LICENSE]",
        "medical_ids": "[MEDICAL ID]",
        "medical_dates": "[MEDICAL DATE]",
        "medical_measurements": "[MEDICAL MEASUREMENT]"
    }
    
    # Context preservation settings
    context_preservation: Dict[str, Any] = {
        "enabled": True,
        "medical_terms": [
            "symptoms", "diagnosis", "treatment", "medication", "allergy",
            "blood pressure", "heart rate", "temperature", "pulse",
            "chest pain", "headache", "fever", "nausea", "vomiting",
            "diabetes", "hypertension", "asthma", "pneumonia",
            "x-ray", "ct scan", "mri", "ultrasound", "lab results",
            "emergency", "urgent", "critical", "stable", "improving",
            "patient", "doctor", "nurse", "hospital", "clinic"
        ],
        "preserve_medical_context": True,
        "preserve_clinical_terms": True
    }
    
    # Sensitivity levels
    sensitivity_levels: Dict[str, Dict[str, Any]] = {
        "low": {
            "description": "Basic PHI detection",
            "patterns": ["names", "dates", "ids"],
            "confidence_threshold": 0.8,
            "context_preservation": True
        },
        "medium": {
            "description": "Standard PHI detection",
            "patterns": ["names", "dates", "ids", "phones", "emails"],
            "confidence_threshold": 0.7,
            "context_preservation": True
        },
        "high": {
            "description": "Comprehensive PHI detection",
            "patterns": ["names", "dates", "ids", "phones", "emails", "addresses", "medical_phi"],
            "confidence_threshold": 0.6,
            "context_preservation": True
        },
        "extreme": {
            "description": "Maximum PHI detection",
            "patterns": ["all"],
            "confidence_threshold": 0.5,
            "context_preservation": False
        }
    }
    
    # Performance optimization
    performance: Dict[str, Any] = {
        "batch_size": 100,
        "max_concurrent_requests": 10,
        "cache_size": 1000,
        "cache_ttl": 3600,  # 1 hour
        "enable_caching": True
    }
    
    # Security settings
    security: Dict[str, Any] = {
        "enable_audit_logging": True,
        "log_phi_detection": False,  # Don't log actual PHI
        "encrypt_sensitive_data": True,
        "data_retention_days": 30
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = False

def get_settings() -> Settings:
    """Get application settings"""
    return Settings()


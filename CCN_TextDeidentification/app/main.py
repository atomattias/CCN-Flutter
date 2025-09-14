"""
CCN Text De-identification Service
Clinical Communication Network - Privacy-Preserving Text Processing

This service provides comprehensive PHI (Protected Health Information) detection
and de-identification for clinical text data, following GDPR and HIPAA compliance.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import logging
import time
from datetime import datetime

from app.services.deidentifier import TextDeidentifier
from app.utils.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CCN Text De-identification Service",
    description="Privacy-preserving text processing for clinical data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for mobile app integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global deidentifier instance
deidentifier = None

# Pydantic models for API
class TextRequest(BaseModel):
    text: str
    method: str = "comprehensive"  # "regex", "nlp", "comprehensive", "hybrid"
    sensitivity: str = "high"  # "low", "medium", "high", "extreme"
    preserve_context: bool = True
    custom_patterns: Optional[List[str]] = None

class PHIDetection(BaseModel):
    type: str
    value: str
    start: int
    end: int
    confidence: float
    context: str

class DeidentificationResult(BaseModel):
    original_text: str
    deidentified_text: str
    phi_detected: List[PHIDetection]
    processing_time: float
    method_used: str
    sensitivity_level: str
    phi_count: int
    confidence_score: float
    preserved_context: bool

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    deidentifier_loaded: bool

@app.on_event("startup")
async def startup_event():
    """Initialize the text deidentifier on startup"""
    global deidentifier
    try:
        logger.info("🚀 Starting CCN Text De-identification Service...")
        deidentifier = TextDeidentifier()
        await deidentifier.initialize()
        logger.info("✅ Text De-identification Service initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Text De-identification Service: {e}")
        raise

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="CCN Text De-identification Service",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
        deidentifier_loaded=deidentifier is not None and deidentifier.is_loaded
    )

@app.post("/deidentify", response_model=DeidentificationResult)
async def deidentify_text(request: TextRequest):
    """
    De-identify clinical text by removing PHI
    
    Args:
        request: TextRequest containing text and processing options
        
    Returns:
        DeidentificationResult with de-identified text and PHI detection results
    """
    if not deidentifier or not deidentifier.is_loaded:
        raise HTTPException(status_code=503, detail="Text deidentifier not available")
    
    try:
        start_time = time.time()
        
        logger.info(f"Processing text de-identification: {len(request.text)} characters")
        
        # Process text de-identification
        result = await deidentifier.deidentify_text(
            text=request.text,
            method=request.method,
            sensitivity=request.sensitivity,
            preserve_context=request.preserve_context,
            custom_patterns=request.custom_patterns
        )
        
        processing_time = time.time() - start_time
        
        logger.info(f"Text de-identification completed: {result['phi_count']} PHI items detected, {processing_time:.2f}s")
        
        return DeidentificationResult(
            original_text=request.text,
            deidentified_text=result['deidentified_text'],
            phi_detected=result['phi_detected'],
            processing_time=processing_time,
            method_used=request.method,
            sensitivity_level=request.sensitivity,
            phi_count=result['phi_count'],
            confidence_score=result['confidence_score'],
            preserved_context=request.preserve_context
        )
        
    except Exception as e:
        logger.error(f"Text de-identification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Text de-identification failed: {str(e)}")

@app.post("/deidentify-json", response_model=DeidentificationResult)
async def deidentify_text_json(request: TextRequest):
    """
    De-identify clinical text via JSON request (for mobile app integration)
    
    This endpoint is specifically designed for mobile app integration,
    following the same pattern as the face anonymization service.
    """
    return await deidentify_text(request)

@app.post("/detect-phi", response_model=Dict[str, Any])
async def detect_phi_only(request: TextRequest):
    """
    Detect PHI in text without de-identifying (for user choice)
    
    This allows the mobile app to show users what PHI was detected
    before deciding whether to de-identify, similar to face detection.
    """
    if not deidentifier or not deidentifier.is_loaded:
        raise HTTPException(status_code=503, detail="Text deidentifier not available")
    
    try:
        start_time = time.time()
        
        logger.info(f"Detecting PHI in text: {len(request.text)} characters")
        
        # Detect PHI without de-identifying
        phi_detected = await deidentifier.detect_phi(
            text=request.text,
            method=request.method,
            sensitivity=request.sensitivity
        )
        
        processing_time = time.time() - start_time
        
        logger.info(f"PHI detection completed: {len(phi_detected)} items detected, {processing_time:.2f}s")
        
        return {
            "original_text": request.text,
            "phi_detected": phi_detected,
            "processing_time": processing_time,
            "method_used": request.method,
            "sensitivity_level": request.sensitivity,
            "phi_count": len(phi_detected),
            "confidence_score": sum(item['confidence'] for item in phi_detected) / len(phi_detected) if phi_detected else 0.0
        }
        
    except Exception as e:
        logger.error(f"PHI detection failed: {e}")
        raise HTTPException(status_code=500, detail=f"PHI detection failed: {str(e)}")

@app.get("/methods")
async def get_available_methods():
    """Get available de-identification methods and their descriptions"""
    return {
        "methods": {
            "regex": {
                "description": "Pattern-based PHI detection using regular expressions",
                "speed": "fast",
                "accuracy": "medium",
                "suitable_for": "basic PHI detection"
            },
            "nlp": {
                "description": "Natural Language Processing-based PHI detection",
                "speed": "medium",
                "accuracy": "high",
                "suitable_for": "complex clinical text"
            },
            "comprehensive": {
                "description": "Combined regex and NLP approach for maximum accuracy",
                "speed": "medium",
                "accuracy": "very_high",
                "suitable_for": "production clinical data"
            },
            "hybrid": {
                "description": "Advanced hybrid approach with context preservation",
                "speed": "slow",
                "accuracy": "maximum",
                "suitable_for": "research and high-security applications"
            }
        },
        "sensitivity_levels": {
            "low": "Basic PHI detection (names, dates, IDs)",
            "medium": "Standard PHI detection with medical terms",
            "high": "Comprehensive PHI detection with context analysis",
            "extreme": "Maximum PHI detection with advanced NLP"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


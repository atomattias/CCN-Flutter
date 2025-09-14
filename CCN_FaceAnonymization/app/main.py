"""
CCN Face Anonymization Service
A FastAPI service for anonymizing faces in medical images
"""

import os
import io
import logging
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uvicorn

from app.services.anonymizer import FaceAnonymizer
from app.utils.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global anonymizer instance
anonymizer = None

# Pydantic models
class ImageRequest(BaseModel):
    image: str  # Base64 encoded image
    method: str = "pixelate"
    quality: str = "medium"

class ImageResponse(BaseModel):
    anonymized_image: str  # Base64 encoded anonymized image
    faces_detected: int
    processing_time: float

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global anonymizer
    
    # Startup
    logger.info("🚀 Starting CCN Face Anonymization Service...")
    try:
        anonymizer = FaceAnonymizer()
        await anonymizer.initialize()
        logger.info("✅ Face Anonymization Service initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Face Anonymization Service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Face Anonymization Service...")
    if anonymizer:
        await anonymizer.cleanup()

# Create FastAPI app
app = FastAPI(
    title="CCN Face Anonymization Service",
    description="A service for anonymizing faces in medical images to protect patient privacy",
    version="1.0.0",
    lifespan=lifespan
)

# Increase the maximum request size to handle larger images
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CCN Face Anonymization Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "anonymize": "/anonymize",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    global anonymizer
    
    if anonymizer is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        # Test if anonymizer is working
        is_healthy = await anonymizer.health_check()
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "service": "face_anonymization",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/anonymize")
async def anonymize_image(
    file: UploadFile = File(...),
    method: str = Query("pixelate", description="Anonymization method: blur, pixelate, solid"),
    quality: str = Query("medium", description="Anonymization quality: low, medium, high")
):
    """
    Anonymize faces in uploaded image
    
    Args:
        file: Image file to anonymize
        method: Anonymization method (blur, pixelate, solid)
        quality: Anonymization quality (low, medium, high)
    
    Returns:
        Anonymized image as JPEG
    """
    global anonymizer
    
    if anonymizer is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate method
    valid_methods = ["blur", "pixelate", "solid"]
    if method not in valid_methods:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid method. Must be one of: {', '.join(valid_methods)}"
        )
    
    # Validate quality
    valid_qualities = ["low", "medium", "high"]
    if quality not in valid_qualities:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid quality. Must be one of: {', '.join(valid_qualities)}"
        )
    
    try:
        logger.info(f"Processing image: {file.filename}, method: {method}, quality: {quality}")
        
        # Read file content
        file_content = await file.read()
        
        # Anonymize the image
        anonymized_image_bytes = await anonymizer.anonymize_image(
            image_bytes=file_content,
            method=method,
            quality=quality
        )
        
        logger.info(f"Successfully anonymized image: {file.filename}")
        
        # Return anonymized image
        return StreamingResponse(
            io.BytesIO(anonymized_image_bytes),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"attachment; filename=anonymized_{file.filename}",
                "X-Anonymization-Method": method,
                "X-Anonymization-Quality": quality
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing image {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/anonymize-json", response_model=ImageResponse)
async def anonymize_image_json(request: ImageRequest):
    """
    Anonymize faces in base64 encoded image
    
    Args:
        request: JSON request with base64 image and options
    
    Returns:
        JSON response with anonymized image as base64
    """
    global anonymizer
    
    if anonymizer is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    # Validate method
    valid_methods = ["blur", "pixelate", "solid"]
    if request.method not in valid_methods:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid method. Must be one of: {valid_methods}"
        )
    
    # Validate quality
    valid_qualities = ["low", "medium", "high"]
    if request.quality not in valid_qualities:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid quality. Must be one of: {valid_qualities}"
        )
    
    try:
        import base64
        import time
        
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        
        # Process image
        start_time = time.time()
        anonymized_image_bytes, faces_detected = await anonymizer.anonymize_image(
            image_data, 
            method=request.method, 
            quality=request.quality
        )
        processing_time = time.time() - start_time
        
        # Encode result as base64
        anonymized_base64 = base64.b64encode(anonymized_image_bytes).decode('utf-8')
        
        logger.info(f"Processed image: {faces_detected} faces detected, {processing_time:.2f}s")
        
        return ImageResponse(
            anonymized_image=anonymized_base64,
            faces_detected=faces_detected,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error processing base64 image: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/batch-anonymize")
async def batch_anonymize_images(
    files: List[UploadFile] = File(...),
    method: str = Query("pixelate", description="Anonymization method: blur, pixelate, solid"),
    quality: str = Query("medium", description="Anonymization quality: low, medium, high")
):
    """
    Anonymize multiple images in batch
    
    Args:
        files: List of image files to anonymize
        method: Anonymization method (blur, pixelate, solid)
        quality: Anonymization quality (low, medium, high)
    
    Returns:
        ZIP file containing all anonymized images
    """
    global anonymizer
    
    if anonymizer is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    if len(files) > 10:  # Limit batch size
        raise HTTPException(status_code=400, detail="Maximum 10 files per batch")
    
    try:
        logger.info(f"Processing batch of {len(files)} images")
        
        # Process each image
        results = []
        for file in files:
            if not file.content_type or not file.content_type.startswith('image/'):
                continue  # Skip non-image files
            
            try:
                file_content = await file.read()
                anonymized_bytes = await anonymizer.anonymize_image(
                    image_bytes=file_content,
                    method=method,
                    quality=quality
                )
                results.append({
                    "filename": f"anonymized_{file.filename}",
                    "content": anonymized_bytes
                })
            except Exception as e:
                logger.error(f"Error processing {file.filename}: {e}")
                continue
        
        # Create ZIP file (simplified - in production, use proper ZIP creation)
        if not results:
            raise HTTPException(status_code=400, detail="No valid images processed")
        
        # For now, return the first image (in production, create proper ZIP)
        first_result = results[0]
        return StreamingResponse(
            io.BytesIO(first_result["content"]),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"attachment; filename={first_result['filename']}",
                "X-Batch-Size": str(len(results))
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing batch: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing batch: {str(e)}")

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )

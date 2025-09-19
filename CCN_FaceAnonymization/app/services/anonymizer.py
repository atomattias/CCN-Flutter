"""
Face Anonymization Service
Core service for detecting and anonymizing faces in medical images
"""

import io
import logging
import numpy as np
import cv2
import mediapipe as mp
from typing import Optional, Tuple, List
from app.utils.config import get_settings

logger = logging.getLogger(__name__)

class FaceAnonymizer:
    """Face anonymization service using MediaPipe and OpenCV"""
    
    def __init__(self):
        self.settings = get_settings()
        self.face_detection = None
        self.face_mesh = None
        self.mp_face_detection = None
        self.mp_face_mesh = None
        self.mp_drawing = None
        
        # Define eye region landmarks - focused on eyes, eyebrows and orbital bones
        self.EYE_REGION_INDICES = [
            # Left eye
            33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
            # Right eye
            263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466,
            # Left eyebrow
            70, 63, 105, 66, 107, 55, 65, 52, 53, 46,
            # Right eyebrow
            336, 296, 334, 293, 300, 285, 295, 282, 283, 276,
            # Orbital bones (eye sockets)
            276, 282, 283, 285, 293, 295, 296, 300, 334, 336, 46, 52, 53, 55, 63, 65, 66, 70, 105, 107
        ]
        
        # Lower eye landmarks to ensure full eye coverage
        self.LOWER_EYE_INDICES = [
            # Lower left eye
            145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
            # Lower right eye
            374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466,
            # Lower orbital bones
            111, 117, 118, 119, 120, 121, 128, 245,  # Left lower orbital
            346, 347, 348, 349, 350, 357, 465        # Right lower orbital
        ]
        
        # Define ear landmark indices for MediaPipe Face Mesh
        self.LEFT_EAR_INDICES = [
            356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234,
            127, 162, 21, 54, 103, 67, 109, 10
        ]
        
        self.RIGHT_EAR_INDICES = [
            127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454,
            356, 389, 251, 284, 332, 297, 338, 332
        ]
        
        # Add temporal bone landmarks (area between ear and eye)
        self.LEFT_TEMPORAL_INDICES = [447, 323, 330, 347, 348, 349, 330, 454, 356, 264, 372, 383, 300, 293, 334, 296, 336]
        self.RIGHT_TEMPORAL_INDICES = [227, 137, 177, 215, 138, 135, 227, 127, 234, 93, 132, 58, 172, 136, 150, 149, 176]
        
        # Landmarks for the sides of the face (temple to ear region)
        self.LEFT_SIDE_FACE_INDICES = [
            356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234,
            127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389
        ]
        
        self.RIGHT_SIDE_FACE_INDICES = [
            127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454,
            356, 389, 251, 284, 332, 297, 338, 332, 10, 109, 67, 103, 54, 21
        ]
    
    async def initialize(self):
        """Initialize MediaPipe models"""
        try:
            logger.info("Initializing MediaPipe models...")
            
            # Initialize MediaPipe
            self.mp_face_detection = mp.solutions.face_detection
            self.mp_face_mesh = mp.solutions.face_mesh
            self.mp_drawing = mp.solutions.drawing_utils
            
            # Configure face detection with higher confidence threshold for reliability
            self.face_detection = self.mp_face_detection.FaceDetection(
                min_detection_confidence=self.settings.min_detection_confidence,
                model_selection=1  # model_selection=1 for full range head detection
            )
            
            # Configure face mesh with multiple face support and side view detection
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=self.settings.max_num_faces,
                refine_landmarks=True,
                min_detection_confidence=self.settings.min_detection_confidence,
                min_tracking_confidence=self.settings.min_tracking_confidence
            )
            
            logger.info("✅ MediaPipe models initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize MediaPipe models: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            if self.face_detection:
                self.face_detection.close()
            if self.face_mesh:
                self.face_mesh.close()
            logger.info("✅ MediaPipe models cleaned up successfully")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    async def health_check(self) -> bool:
        """Check if the service is healthy"""
        try:
            # Create a simple test image
            test_image = np.zeros((100, 100, 3), dtype=np.uint8)
            test_image_rgb = cv2.cvtColor(test_image, cv2.COLOR_BGR2RGB)
            
            # Test face detection
            results = self.face_detection.process(test_image_rgb)
            
            return True
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    async def anonymize_image(
        self, 
        image_bytes: bytes, 
        method: str = "pixelate", 
        quality: str = "medium"
    ) -> Tuple[bytes, int]:
        """
        Anonymize faces in an image
        
        Args:
            image_bytes: Raw image bytes
            method: Anonymization method (blur, pixelate, solid)
            quality: Anonymization quality (low, medium, high)
        
        Returns:
            Anonymized image as JPEG bytes
        """
        try:
            # Try to decode image with OpenCV first
            image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            
            # If OpenCV fails, try with Pillow (for HEIC and other formats)
            if image is None or image.size == 0:
                try:
                    from PIL import Image
                    import io
                    from pillow_heif import register_heif_opener
                    
                    # Register HEIF opener for HEIC support
                    register_heif_opener()
                    
                    # Try to open with Pillow
                    pil_image = Image.open(io.BytesIO(image_bytes))
                    
                    # Convert to RGB if necessary (HEIC might be in different color space)
                    if pil_image.mode != 'RGB':
                        pil_image = pil_image.convert('RGB')
                    
                    # Convert PIL image to OpenCV format
                    image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
                    
                    logger.info(f"Successfully converted image using Pillow (format: {pil_image.format})")
                    
                except Exception as pillow_error:
                    logger.error(f"Pillow conversion failed: {pillow_error}")
                    raise ValueError("Invalid image file - unsupported format")
            
            if image is None or image.size == 0:
                raise ValueError("Invalid image file")
            
            # Process the image
            anonymized_image, faces_detected = await self._process_image(image, method, quality)
            
            # Encode as JPEG
            _, img_encoded = cv2.imencode(".jpg", anonymized_image)
            return img_encoded.tobytes(), faces_detected
            
        except Exception as e:
            logger.error(f"Error anonymizing image: {e}")
            raise
    
    async def _process_image(
        self, 
        image: np.ndarray, 
        method: str, 
        quality: str
    ) -> Tuple[np.ndarray, int]:
        """Process image to anonymize faces"""
        
        # Check if image is very large and resize if necessary for processing
        max_dimension = self.settings.max_image_size
        h, w = image.shape[:2]
        
        # Store original size for potential upscaling later
        original_size = (w, h)
        resized = False
        
        if max(h, w) > max_dimension:
            # Calculate new dimensions while preserving aspect ratio
            if w > h:
                new_w = max_dimension
                new_h = int(h * (max_dimension / w))
            else:
                new_h = max_dimension
                new_w = int(w * (max_dimension / h))
            
            # Resize image for processing
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
            resized = True
        
        # For very small images, temporarily upscale for better landmark detection
        min_dimension = self.settings.min_image_size
        temp_upscaled = False
        temp_original_size = (w, h)
        
        if max(h, w) < min_dimension:
            # Calculate new dimensions while preserving aspect ratio
            scale_factor = min_dimension / max(h, w)
            new_w = int(w * scale_factor)
            new_h = int(h * scale_factor)
            
            # Temporarily upscale image for processing
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
            temp_upscaled = True
        
        # Convert to RGB for processing
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process with face mesh
        results = self.face_mesh.process(image_rgb)
        anonymized_image = image_rgb.copy()
        
        faces_processed = False
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                # Determine if face is in side view
                face_looking_left, face_looking_right = self._is_side_view(face_landmarks, image_rgb.shape[1])
                
                # Get eye region including orbital bones and stretched to ears for front view
                eye_region = self._get_eye_region_with_ears(image_rgb, face_landmarks, face_looking_left, face_looking_right)
                
                # Only anonymize if we have a valid eye region
                if eye_region:
                    anonymized_image = self._anonymize_region(anonymized_image, eye_region, method, quality)
                    faces_processed = True
                
                # Always anonymize ear regions for all face orientations (front, left, right)
                # For front view, anonymize both left and right ears
                if not face_looking_left and not face_looking_right:
                    # Front view - anonymize both ears
                    left_ear_region = self._get_ear_region(face_landmarks, image_rgb.shape, False, True)  # Simulate left ear visible
                    right_ear_region = self._get_ear_region(face_landmarks, image_rgb.shape, True, False)  # Simulate right ear visible
                    
                    if left_ear_region:
                        anonymized_image = self._anonymize_region(anonymized_image, left_ear_region, method, quality)
                        faces_processed = True
                    if right_ear_region:
                        anonymized_image = self._anonymize_region(anonymized_image, right_ear_region, method, quality)
                        faces_processed = True
                else:
                    # Side views - anonymize the visible ear
                    ear_region = self._get_ear_region(face_landmarks, image_rgb.shape, face_looking_left, face_looking_right)
                    if ear_region:
                        anonymized_image = self._anonymize_region(anonymized_image, ear_region, method, quality)
                        faces_processed = True
        
        # If no faces were processed with face mesh, fall back to simple face detection
        if not faces_processed:
            faces, _ = self._detect_faces_mediapipe(image)
            if faces:
                for (x, y, w, h) in faces:
                    # For small faces, be more precise about the eye region
                    face_size_ratio = (w * h) / (image.shape[0] * image.shape[1])
                    
                    if face_size_ratio < 0.1:  # Small face relative to image
                        # More precise eye region - just the upper part
                        eye_y_min = y + int(h * 0.1)  # Start a bit below the top
                        eye_y_max = y + int(h * 0.4)  # Cover eyes and brows plus more below
                        
                        # For small faces, still stretch horizontally to approximate ear width
                        eye_x_min = max(0, x - int(w * 0.1))   # Extend beyond face left
                        eye_x_max = min(image.shape[1], x + w + int(w * 0.1))  # Extend beyond face right
                    else:
                        # Standard eye region for normal-sized faces - stretch horizontally to ears
                        eye_y_min = y
                        eye_y_max = y + int(h * 0.4)  # Upper 40% of face
                        
                        # Stretch horizontally to include ears
                        eye_x_min = max(0, x - int(w * 0.1))
                        eye_x_max = min(image.shape[1], x + w + int(w * 0.1))
                    
                    # Anonymize eye region
                    eye_region = (eye_x_min, eye_y_min, eye_x_max, eye_y_max)
                    anonymized_image = self._anonymize_region(anonymized_image, eye_region, method, quality)
                    
                    # Always anonymize both ears for all faces (not just edge cases)
                    # Left ear region
                    left_ear_x_min = max(0, x - int(w * 0.2))
                    left_ear_x_max = x + int(w * 0.1)
                    left_ear_y_min = y + int(h * 0.2)
                    left_ear_y_max = y + int(h * 0.8)
                    
                    left_ear_region = (left_ear_x_min, left_ear_y_min, left_ear_x_max, left_ear_y_max)
                    anonymized_image = self._anonymize_region(anonymized_image, left_ear_region, method, quality)
                    
                    # Right ear region
                    right_ear_x_min = x + w - int(w * 0.1)
                    right_ear_x_max = min(image.shape[1], x + w + int(w * 0.2))
                    right_ear_y_min = y + int(h * 0.2)
                    right_ear_y_max = y + int(h * 0.8)
                    
                    right_ear_region = (right_ear_x_min, right_ear_y_min, right_ear_x_max, right_ear_y_max)
                    anonymized_image = self._anonymize_region(anonymized_image, right_ear_region, method, quality)
            else:
                logger.warning("No faces detected in image")
        
        # If image was temporarily upscaled for processing, revert to original size
        if temp_upscaled:
            anonymized_image = cv2.resize(anonymized_image, temp_original_size, interpolation=cv2.INTER_LINEAR)
        
        # If image was resized, scale it back to original size
        if resized:
            anonymized_image = cv2.resize(anonymized_image, original_size, interpolation=cv2.INTER_LINEAR)
        
        # Count faces detected
        faces_detected = len(results.multi_face_landmarks) if results.multi_face_landmarks else 0
        
        # Convert back to BGR for output
        return cv2.cvtColor(anonymized_image, cv2.COLOR_RGB2BGR), faces_detected
    
    def _detect_faces_mediapipe(self, image: np.ndarray) -> Tuple[List[Tuple[int, int, int, int]], np.ndarray]:
        """Detect faces using MediaPipe Face Detection"""
        try:
            # Convert image to RGB (OpenCV uses BGR by default)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect faces
            results = self.face_detection.process(image_rgb)
            
            # Extract bounding boxes
            faces = []
            if results.detections:
                for detection in results.detections:
                    bboxC = detection.location_data.relative_bounding_box
                    ih, iw, _ = image.shape
                    x, y = int(bboxC.xmin * iw), int(bboxC.ymin * ih)
                    w, h = int(bboxC.width * iw), int(bboxC.height * ih)
                    
                    # Ensure bounding box is within image dimensions
                    x, y = max(0, x), max(0, y)
                    w, h = min(w, iw - x), min(h, ih - y)
                    
                    faces.append((x, y, w, h))
            
            return faces, image_rgb
        except Exception as e:
            logger.error(f"Error detecting faces: {e}")
            return [], image_rgb
    
    def _is_side_view(self, face_landmarks, image_width: int) -> Tuple[bool, bool]:
        """Detect if face is in side view and which side the face is looking towards"""
        try:
            # Get all x coordinates
            all_x = [landmark.x for landmark in face_landmarks.landmark]
            
            # Calculate the distribution of landmarks across the face width
            left_half_count = sum(1 for x in all_x if x < 0.5)
            right_half_count = sum(1 for x in all_x if x >= 0.5)
            
            # If landmarks are heavily skewed to one side, it's likely a side view
            total_landmarks = len(all_x)
            threshold = 0.65  # 65% of landmarks on one side indicates side view
            
            # When more landmarks are on the left side of the image,
            # the face is looking to the right (and vice versa)
            face_looking_right = left_half_count / total_landmarks > threshold
            face_looking_left = right_half_count / total_landmarks > threshold
            
            # Additional check for nose orientation (more reliable for side view detection)
            # Nose tip is landmark 4
            if 4 < len(face_landmarks.landmark):
                nose_tip_x = face_landmarks.landmark[4].x
                
                # If nose is on the left side of the image, face is looking right
                if nose_tip_x < 0.35:  # Nose is on the left side
                    face_looking_right = True
                    face_looking_left = False
                # If nose is on the right side of the image, face is looking left
                elif nose_tip_x > 0.65:  # Nose is on the right side
                    face_looking_left = True
                    face_looking_right = False
            
            return face_looking_left, face_looking_right
        except:
            # Default to checking both sides if the specific check fails
            return False, False
    
    def _get_eye_region_with_ears(
        self, 
        image: np.ndarray, 
        face_landmarks, 
        face_looking_left: bool = False, 
        face_looking_right: bool = False
    ) -> Optional[Tuple[int, int, int, int]]:
        """Get eye region including orbital bones and stretch horizontally to ears"""
        try:
            h, w = image.shape[:2]
            
            # Extract eye region landmarks
            eye_points = []
            for idx in self.EYE_REGION_INDICES:
                if idx < len(face_landmarks.landmark):
                    lm = face_landmarks.landmark[idx]
                    # Only use visible landmarks
                    if not hasattr(lm, 'visibility') or lm.visibility > 0.5:
                        x, y = int(lm.x * w), int(lm.y * h)
                        eye_points.append((x, y))
            
            # Extract lower eye landmarks to ensure full coverage
            lower_eye_points = []
            for idx in self.LOWER_EYE_INDICES:
                if idx < len(face_landmarks.landmark):
                    lm = face_landmarks.landmark[idx]
                    if not hasattr(lm, 'visibility') or lm.visibility > 0.5:
                        x, y = int(lm.x * w), int(lm.y * h)
                        lower_eye_points.append((x, y))
            
            # Combine all eye points
            all_eye_points = eye_points + lower_eye_points
            
            # If we have enough landmarks, calculate the region
            if len(all_eye_points) >= 4:
                x_coords = [p[0] for p in all_eye_points]
                y_coords = [p[1] for p in all_eye_points]
                
                # Get the bounding box
                eye_x_min = max(0, min(x_coords))
                eye_x_max = min(w, max(x_coords))
                eye_y_min = max(0, min(y_coords))
                eye_y_max = min(h, max(y_coords))
                
                # Calculate region dimensions
                eye_width = eye_x_max - eye_x_min
                eye_height = eye_y_max - eye_y_min
                
                # Add padding - more above (for eyebrows) and below (for orbital rim)
                eye_y_min = max(0, eye_y_min - int(eye_height * 0.3))  # 30% padding above
                eye_y_max = min(h, eye_y_max + int(eye_height * 0.5))  # 50% padding below
                
                # For front view, stretch horizontally to ears
                if not face_looking_left and not face_looking_right:
                    # Get all face landmarks to find face width
                    all_x = [int(landmark.x * w) for landmark in face_landmarks.landmark]
                    face_left = max(0, min(all_x))
                    face_right = min(w, max(all_x))
                    
                    # Stretch to full face width with minimal margin
                    eye_x_min = face_left + int((face_right - face_left) * 0.02)  # 2% from left edge
                    eye_x_max = face_right - int((face_right - face_left) * 0.02)  # 2% from right edge
                else:
                    # For side views, add more horizontal padding
                    eye_x_min = max(0, eye_x_min - int(eye_width * 0.3))
                    eye_x_max = min(w, eye_x_max + int(eye_width * 0.3))
                
                return (eye_x_min, eye_y_min, eye_x_max, eye_y_max)
            
            # Fallback: use a more conservative approach for the upper face
            all_x = [int(landmark.x * w) for landmark in face_landmarks.landmark]
            all_y = [int(landmark.y * h) for landmark in face_landmarks.landmark]
            
            face_left = max(0, min(all_x))
            face_right = min(w, max(all_x))
            face_top = max(0, min(all_y))
            face_bottom = min(h, max(all_y))
            
            face_height = face_bottom - face_top
            face_width = face_right - face_left
            
            # Define eye region as upper 40% of face
            eye_y_min = face_top
            eye_y_max = face_top + int(face_height * 0.4)
            
            # For front view, stretch horizontally to almost full face width
            if not face_looking_left and not face_looking_right:
                eye_x_min = face_left + int(face_width * 0.02)
                eye_x_max = face_right - int(face_width * 0.02)
            else:
                # For side views, use a more focused region but still wider
                eye_x_min = face_left + int(face_width * 0.05)
                eye_x_max = face_right - int(face_width * 0.05)
            
            return (eye_x_min, eye_y_min, eye_x_max, eye_y_max)
        except Exception as e:
            logger.error(f"Error getting eye region: {e}")
            return None
    
    def _get_ear_region(
        self, 
        face_landmarks, 
        image_shape: Tuple[int, int, int], 
        face_looking_left: bool, 
        face_looking_right: bool
    ) -> Optional[Tuple[int, int, int, int]]:
        """Get ear region for all face orientations with improved coverage"""
        try:
            h, w = image_shape[:2]
            ear_landmarks = []
            
            # When face is looking to THEIR left, THEIR RIGHT ear is visible to us
            if face_looking_left:
                for idx in self.RIGHT_EAR_INDICES + self.RIGHT_SIDE_FACE_INDICES:
                    if idx < len(face_landmarks.landmark):
                        lm = face_landmarks.landmark[idx]
                        if not hasattr(lm, 'visibility') or lm.visibility > 0.5:
                            x, y = int(lm.x * w), int(lm.y * h)
                            ear_landmarks.append((x, y))
            
            # When face is looking to THEIR right, THEIR LEFT ear is visible to us
            elif face_looking_right:
                for idx in self.LEFT_EAR_INDICES + self.LEFT_SIDE_FACE_INDICES:
                    if idx < len(face_landmarks.landmark):
                        lm = face_landmarks.landmark[idx]
                        if not hasattr(lm, 'visibility') or lm.visibility > 0.5:
                            x, y = int(lm.x * w), int(lm.y * h)
                            ear_landmarks.append((x, y))
            
            # For front view, use both ear landmark sets to get better coverage
            else:
                # Combine both left and right ear landmarks for front view
                for idx in self.LEFT_EAR_INDICES + self.RIGHT_EAR_INDICES + self.LEFT_SIDE_FACE_INDICES + self.RIGHT_SIDE_FACE_INDICES:
                    if idx < len(face_landmarks.landmark):
                        lm = face_landmarks.landmark[idx]
                        if not hasattr(lm, 'visibility') or lm.visibility > 0.5:
                            x, y = int(lm.x * w), int(lm.y * h)
                            ear_landmarks.append((x, y))
            
            # If we have enough ear landmarks, calculate the region
            if len(ear_landmarks) >= 3:
                x_coords = [p[0] for p in ear_landmarks]
                y_coords = [p[1] for p in ear_landmarks]
                
                # Get the bounding box
                ear_x_min = max(0, min(x_coords))
                ear_x_max = min(w, max(x_coords))
                ear_y_min = max(0, min(y_coords))
                ear_y_max = min(h, max(y_coords))
                
                # Add moderate padding based on ear size
                ear_width = ear_x_max - ear_x_min
                ear_height = ear_y_max - ear_y_min
                
                # Add more padding for side views to ensure full ear coverage
                ear_x_min = max(0, ear_x_min - int(ear_width * 0.25))
                ear_x_max = min(w, ear_x_max + int(ear_width * 0.25))
                ear_y_min = max(0, ear_y_min - int(ear_height * 0.25))
                ear_y_max = min(h, ear_y_max + int(ear_height * 0.25))
                
                return (ear_x_min, ear_y_min, ear_x_max, ear_y_max)
            
            # Fallback: estimate ear position from face bounds
            if face_looking_left or face_looking_right:
                # Get face bounds
                all_x = [int(landmark.x * w) for landmark in face_landmarks.landmark]
                all_y = [int(landmark.y * h) for landmark in face_landmarks.landmark]
                
                face_left = max(0, min(all_x))
                face_right = min(w, max(all_x))
                face_top = max(0, min(all_y))
                face_bottom = min(h, max(all_y))
                
                face_width = face_right - face_left
                face_height = face_bottom - face_top
                
                # Estimate ear region based on face orientation
                if face_looking_left:  # Person looking to THEIR left, RIGHT ear visible on LEFT of image
                    ear_x_min = max(0, face_left - int(face_width * 0.2))
                    ear_x_max = face_left + int(face_width * 0.3)
                else:  # face_looking_right - Person looking to THEIR right, LEFT ear visible on RIGHT of image
                    ear_x_min = face_right - int(face_width * 0.3)
                    ear_x_max = min(w, face_right + int(face_width * 0.2))
                
                # Ensure ear region covers from mid-face height to lower face
                ear_y_min = face_top + int(face_height * 0.25)
                ear_y_max = face_top + int(face_height * 0.8)
                
                return (ear_x_min, ear_y_min, ear_x_max, ear_y_max)
            
            return None
        except Exception as e:
            logger.error(f"Error getting ear region: {e}")
            return None
    
    def _anonymize_region(
        self, 
        image: np.ndarray, 
        region: Tuple[int, int, int, int], 
        method: str, 
        quality: str
    ) -> np.ndarray:
        """Anonymize a region using the specified method and quality"""
        if image is None or region is None:
            return image
        
        # Create a copy of the image to avoid modifying the original
        anonymized_image = image.copy()
        
        x_min, y_min, x_max, y_max = region
        
        # Ensure region is valid
        if x_min >= x_max or y_min >= y_max:
            return anonymized_image
        
        # Extract the region
        area = anonymized_image[y_min:y_max, x_min:x_max]
        
        if area.size == 0:
            return anonymized_image
        
        # Get region dimensions
        region_height, region_width = area.shape[:2]
        
        # Get quality settings
        quality_settings = self.settings.quality_settings.get(method, {}).get(quality, {})
        
        if method == "blur":
            # Calculate kernel size based on quality settings
            kernel_size = quality_settings.get("kernel_size", 25)
            sigma = quality_settings.get("sigma", 8)
            
            # Ensure kernel size is odd
            kernel_size = kernel_size + 1 if kernel_size % 2 == 0 else kernel_size
            
            # Apply multiple passes of blur for stronger anonymization
            for _ in range(3):  # Apply blur 3 times for stronger effect
                area = cv2.GaussianBlur(area, (kernel_size, kernel_size), sigma)
        
        elif method == "pixelate":
            # Calculate pixel size based on quality settings
            pixel_size = quality_settings.get("pixel_size", 12)
            
            # Ensure we don't divide by zero
            if pixel_size > 0 and region_width > pixel_size and region_height > pixel_size:
                # Resize down to create pixelation effect
                temp = cv2.resize(area,
                                (max(1, region_width // pixel_size),
                                max(1, region_height // pixel_size)),
                                interpolation=cv2.INTER_LINEAR)
                # Resize back up to original size with nearest neighbor interpolation
                area = cv2.resize(temp, (region_width, region_height), interpolation=cv2.INTER_NEAREST)
        
        elif method == "solid":
            # Create a solid color
            color = quality_settings.get("color", [0, 0, 0])
            area = np.full_like(area, color)
        
        elif method == "hybrid":
            # Combine blur and pixelate for maximum anonymization
            # First apply heavy pixelation
            pixel_size = quality_settings.get("pixel_size", 20)
            if pixel_size > 0 and region_width > pixel_size and region_height > pixel_size:
                temp = cv2.resize(area,
                                (max(1, region_width // pixel_size),
                                max(1, region_height // pixel_size)),
                                interpolation=cv2.INTER_LINEAR)
                area = cv2.resize(temp, (region_width, region_height), interpolation=cv2.INTER_NEAREST)
            
            # Then apply heavy blur
            kernel_size = quality_settings.get("kernel_size", 45)
            sigma = quality_settings.get("sigma", 15)
            kernel_size = kernel_size + 1 if kernel_size % 2 == 0 else kernel_size
            
            for _ in range(2):  # Apply blur 2 times
                area = cv2.GaussianBlur(area, (kernel_size, kernel_size), sigma)
        
        # Replace the original region with the anonymized version
        anonymized_image[y_min:y_max, x_min:x_max] = area
        
        return anonymized_image








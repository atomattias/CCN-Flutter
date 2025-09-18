#!/usr/bin/env python3
"""
Create a large test image to test the face anonymization service limits
"""
from PIL import Image
import numpy as np

def create_large_test_image(width=2000, height=2000, filename="large_test_image.jpg"):
    """Create a large test image"""
    
    # Create a random image
    image_array = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
    
    # Add some patterns to make it more realistic
    for i in range(0, height, 100):
        for j in range(0, width, 100):
            image_array[i:i+50, j:j+50] = [255, 0, 0]  # Red squares
    
    # Convert to PIL Image
    image = Image.fromarray(image_array)
    
    # Save as JPEG with high quality to make it large
    image.save(filename, "JPEG", quality=95)
    
    print(f"Created large test image: {filename}")
    print(f"Size: {width}x{height}")
    
    # Get file size
    import os
    file_size = os.path.getsize(filename)
    print(f"File size: {file_size} bytes ({file_size/1024/1024:.2f} MB)")

if __name__ == "__main__":
    create_large_test_image()










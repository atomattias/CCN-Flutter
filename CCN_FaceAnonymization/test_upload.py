#!/usr/bin/env python3
"""
Test script to upload an image to the face anonymization service
"""
import requests
import base64
import json
import sys

def test_face_anonymization(image_path, service_url="http://192.168.1.224:8000"):
    """Test the face anonymization service with a real image"""
    
    try:
        # Read and encode the image
        print(f"Reading image: {image_path}")
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        print(f"Image size: {len(image_data)} bytes")
        print(f"Base64 size: {len(image_base64)} characters")
        
        # Prepare the request
        payload = {
            "image": image_base64,
            "method": "pixelate",
            "quality": "medium"
        }
        
        print(f"Sending request to {service_url}/anonymize-json")
        
        # Send the request
        response = requests.post(
            f"{service_url}/anonymize-json",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Faces detected: {result.get('faces_detected', 'N/A')}")
            print(f"Processing time: {result.get('processing_time', 'N/A')}s")
            print(f"Anonymized image size: {len(result.get('anonymized_image', ''))} characters")
            
            # Save the result
            if 'anonymized_image' in result:
                import os
                base_name = os.path.basename(image_path)
                name, ext = os.path.splitext(base_name)
                output_path = f"{name}_anonymized{ext}"
                with open(output_path, 'wb') as f:
                    f.write(base64.b64decode(result['anonymized_image']))
                print(f"Anonymized image saved to: {output_path}")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_upload.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    test_face_anonymization(image_path)

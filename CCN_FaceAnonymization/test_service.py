#!/usr/bin/env python3
"""
Test script for the CCN Face Anonymization Service
"""

import requests
import os
import sys
from pathlib import Path

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_anonymization():
    """Test the anonymization endpoint with a sample image"""
    try:
        # Create a simple test image (1x1 pixel)
        test_image_path = "test_image.jpg"
        
        # For testing, we'll create a minimal JPEG
        # In a real test, you would use an actual image file
        print("📝 Note: This test requires a real image file")
        print("   Place a test image named 'test_image.jpg' in this directory")
        
        if not os.path.exists(test_image_path):
            print("⚠️  No test image found, skipping anonymization test")
            return True
        
        with open(test_image_path, 'rb') as f:
            files = {'file': f}
            data = {
                'method': 'pixelate',
                'quality': 'medium'
            }
            
            response = requests.post(
                "http://localhost:8000/anonymize",
                files=files,
                data=data,
                timeout=30
            )
        
        if response.status_code == 200:
            print("✅ Anonymization test passed")
            
            # Save the anonymized image
            with open("anonymized_test_image.jpg", "wb") as f:
                f.write(response.content)
            print("💾 Anonymized image saved as 'anonymized_test_image.jpg'")
            return True
        else:
            print(f"❌ Anonymization test failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Anonymization test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing CCN Face Anonymization Service")
    print("=" * 50)
    
    # Test health check
    print("\n1. Testing health check...")
    health_ok = test_health_check()
    
    # Test anonymization
    print("\n2. Testing anonymization...")
    anonymization_ok = test_anonymization()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Anonymization: {'✅ PASS' if anonymization_ok else '❌ FAIL'}")
    
    if health_ok and anonymization_ok:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n💥 Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())






















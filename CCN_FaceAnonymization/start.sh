#!/bin/bash

# CCN Face Anonymization Service Startup Script

echo "🚀 Starting CCN Face Anonymization Service..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "📦 Using Docker deployment..."
    
    # Build the Docker image
    echo "🔨 Building Docker image..."
    docker build -t ccn-face-anonymization .
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker image built successfully"
        
        # Run the service
        echo "🏃 Starting service on port 8000..."
        docker run -p 8000:8000 --name ccn-face-anonymization ccn-face-anonymization
    else
        echo "❌ Failed to build Docker image"
        exit 1
    fi
else
    echo "🐍 Using Python deployment..."
    
    # Check if Python is available
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed"
        exit 1
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
        
        # Run the service
        echo "🏃 Starting service on port 8000..."
        python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --limit-request-body-size 10485760
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi












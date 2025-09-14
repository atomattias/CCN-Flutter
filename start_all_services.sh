#!/bin/bash

# CCN Complete System Startup Script
# This script starts all services for the Clinical Communication Network

echo "🚀 Starting CCN Complete System..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within 60 seconds"
    return 1
}

# Create logs directory
mkdir -p logs

# Kill any existing processes on our ports
print_status "Cleaning up existing processes..."
for port in 27017 3000 8000 8001 8081; do
    if check_port $port; then
        print_warning "Port $port is in use, killing existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done

echo ""
print_status "Starting services in order..."

# =============================================================================
# 1. MONGODB DATABASE
# =============================================================================
print_status "1/6 Starting MongoDB Database..."

if ! command -v mongod &> /dev/null; then
    print_error "MongoDB is not installed. Please install MongoDB first."
    exit 1
fi

# Start MongoDB
mongod --dbpath="/home/mattias/Thesis/Material/CCN report/CCN Repos/ccn-db" --logpath="logs/mongodb.log" --fork

if wait_for_service "http://localhost:27017" "MongoDB"; then
    print_success "MongoDB started successfully"
else
    print_error "MongoDB failed to start"
    exit 1
fi

# =============================================================================
# 2. TEXT DE-IDENTIFICATION SERVICE
# =============================================================================
print_status "2/6 Starting Text De-identification Service..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_TextDeidentification"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment for text de-identification service..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
else
    source venv/bin/activate
fi

# Start the service
nohup uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload > "../logs/text_deidentification.log" 2>&1 &
TEXT_DEID_PID=$!
echo $TEXT_DEID_PID > "../logs/text_deidentification.pid"

if wait_for_service "http://localhost:8001/health" "Text De-identification Service"; then
    print_success "Text De-identification Service started successfully"
else
    print_error "Text De-identification Service failed to start"
    exit 1
fi

# =============================================================================
# 3. FACE ANONYMIZATION SERVICE
# =============================================================================
print_status "3/6 Starting Face Anonymization Service..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_FaceAnonymization"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment for face anonymization service..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start the service
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "../logs/face_anonymization.log" 2>&1 &
FACE_ANON_PID=$!
echo $FACE_ANON_PID > "../logs/face_anonymization.pid"

if wait_for_service "http://localhost:8000/health" "Face Anonymization Service"; then
    print_success "Face Anonymization Service started successfully"
else
    print_error "Face Anonymization Service failed to start"
    exit 1
fi

# =============================================================================
# 4. CCN BACKEND API
# =============================================================================
print_status "4/6 Starting CCN Backend API..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Start the backend
nohup npm run dev > "../logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "../logs/backend.pid"

if wait_for_service "http://localhost:3000/api/auth/health" "CCN Backend API"; then
    print_success "CCN Backend API started successfully"
else
    print_error "CCN Backend API failed to start"
    exit 1
fi

# =============================================================================
# 5. CCN ADMIN PANEL
# =============================================================================
print_status "5/6 Starting CCN Admin Panel..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_Admin"

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    print_warning "Flutter is not installed. Skipping admin panel."
    print_warning "To install Flutter: https://flutter.dev/docs/get-started/install"
else
    # Check if dependencies are installed
    if [ ! -d "build" ]; then
        print_status "Getting Flutter dependencies..."
        flutter pub get
    fi
    
    # Start the admin panel
    nohup flutter run -d web-server --web-port 8080 --web-hostname 0.0.0.0 > "../logs/admin_panel.log" 2>&1 &
    ADMIN_PID=$!
    echo $ADMIN_PID > "../logs/admin_panel.pid"
    
    if wait_for_service "http://localhost:8080" "CCN Admin Panel"; then
        print_success "CCN Admin Panel started successfully"
    else
        print_warning "CCN Admin Panel failed to start (this is optional)"
    fi
fi

# =============================================================================
# 6. REACT NATIVE MOBILE APP
# =============================================================================
print_status "6/6 Starting React Native Mobile App..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_Mobile_ReactNative"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing mobile app dependencies..."
    npm install
fi

# Start the React Native app
nohup npx expo start --host tunnel --port 8081 > "../logs/mobile_app.log" 2>&1 &
MOBILE_PID=$!
echo $MOBILE_PID > "../logs/mobile_app.pid"

# Wait a bit for Expo to start
sleep 10

print_success "React Native Mobile App started successfully"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "🎉 CCN Complete System Started Successfully!"
echo "============================================="
echo ""
echo "📊 Service Status:"
echo "├── 🗄️  MongoDB Database:     http://localhost:27017"
echo "├── 🔤 Text De-identification: http://localhost:8001"
echo "├── 🖼️  Face Anonymization:   http://localhost:8000"
echo "├── 🔧 CCN Backend API:       http://localhost:3000"
echo "├── 👨‍💼 CCN Admin Panel:      http://localhost:8080"
echo "└── 📱 React Native App:      http://localhost:8081"
echo ""
echo "📋 Quick Test URLs:"
echo "├── Backend Health:           http://localhost:3000/api/auth/health"
echo "├── Text De-id Health:        http://localhost:8001/health"
echo "├── Face Anon Health:         http://localhost:8000/health"
echo "└── Admin Panel:              http://localhost:8080"
echo ""
echo "📁 Logs are available in: ./logs/"
echo "├── mongodb.log"
echo "├── text_deidentification.log"
echo "├── face_anonymization.log"
echo "├── backend.log"
echo "├── admin_panel.log"
echo "└── mobile_app.log"
echo ""
echo "🛑 To stop all services, run: ./stop_all_services.sh"
echo ""
print_success "All services are ready for testing! 🚀"



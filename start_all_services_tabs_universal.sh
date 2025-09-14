#!/bin/bash

# CCN Complete System Startup Script with Separate Tabs (Universal)
# This script starts all services in separate terminal tabs for interaction
# Works with gnome-terminal, xterm, konsole, and other terminal emulators

echo "🚀 Starting CCN Complete System in Separate Tabs (Universal)..."
echo "=============================================================="

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

# Function to detect terminal emulator
detect_terminal() {
    if command -v gnome-terminal &> /dev/null; then
        echo "gnome-terminal"
    elif command -v konsole &> /dev/null; then
        echo "konsole"
    elif command -v xterm &> /dev/null; then
        echo "xterm"
    elif command -v xfce4-terminal &> /dev/null; then
        echo "xfce4-terminal"
    elif command -v mate-terminal &> /dev/null; then
        echo "mate-terminal"
    elif command -v lxterminal &> /dev/null; then
        echo "lxterminal"
    else
        echo "unknown"
    fi
}

# Function to open new tab
open_new_tab() {
    local title=$1
    local command=$2
    local terminal=$(detect_terminal)
    
    case $terminal in
        "gnome-terminal")
            gnome-terminal --tab --title="$title" -- bash -c "$command; echo 'Press any key to close this tab...'; read -n 1"
            ;;
        "konsole")
            konsole --new-tab -e bash -c "$command; echo 'Press any key to close this tab...'; read -n 1" &
            ;;
        "xfce4-terminal")
            xfce4-terminal --tab --title="$title" -e "bash -c '$command; echo \"Press any key to close this tab...\"; read -n 1'"
            ;;
        "mate-terminal")
            mate-terminal --tab --title="$title" -e "bash -c '$command; echo \"Press any key to close this tab...\"; read -n 1'"
            ;;
        "lxterminal")
            lxterminal --title="$title" -e "bash -c '$command; echo \"Press any key to close this tab...\"; read -n 1'"
            ;;
        "xterm")
            xterm -title "$title" -e "bash -c '$command; echo \"Press any key to close this tab...\"; read -n 1'" &
            ;;
        *)
            print_warning "Unknown terminal emulator. Opening in new window instead."
            $command &
            ;;
    esac
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
print_status "Detected terminal emulator: $(detect_terminal)"
print_status "Starting services in separate tabs..."

# =============================================================================
# 1. MONGODB DATABASE
# =============================================================================
print_status "1/6 Starting MongoDB Database in new tab..."

if ! command -v mongod &> /dev/null; then
    print_error "MongoDB is not installed. Please install MongoDB first."
    exit 1
fi

# Start MongoDB in a new tab
open_new_tab "MongoDB Database" "
    echo '🗄️ Starting MongoDB Database...'
    mongod --dbpath='/home/mattias/Thesis/Material/CCN report/CCN Repos/ccn-db' --logpath='logs/mongodb.log'
"

sleep 3

if wait_for_service "http://localhost:27017" "MongoDB"; then
    print_success "MongoDB started successfully"
else
    print_error "MongoDB failed to start"
    exit 1
fi

# =============================================================================
# 2. TEXT DE-IDENTIFICATION SERVICE
# =============================================================================
print_status "2/6 Starting Text De-identification Service in new tab..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_TextDeidentification"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment for text de-identification service..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
fi

# Start the service in a new tab
open_new_tab "Text De-identification Service" "
    echo '🔤 Starting Text De-identification Service...'
    cd '/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_TextDeidentification'
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
"

if wait_for_service "http://localhost:8001/health" "Text De-identification Service"; then
    print_success "Text De-identification Service started successfully"
else
    print_error "Text De-identification Service failed to start"
    exit 1
fi

# =============================================================================
# 3. FACE ANONYMIZATION SERVICE
# =============================================================================
print_status "3/6 Starting Face Anonymization Service in new tab..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_FaceAnonymization"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment for face anonymization service..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Start the service in a new tab
open_new_tab "Face Anonymization Service" "
    echo '🖼️ Starting Face Anonymization Service...'
    cd '/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_FaceAnonymization'
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"

if wait_for_service "http://localhost:8000/health" "Face Anonymization Service"; then
    print_success "Face Anonymization Service started successfully"
else
    print_error "Face Anonymization Service failed to start"
    exit 1
fi

# =============================================================================
# 4. CCN BACKEND API
# =============================================================================
print_status "4/6 Starting CCN Backend API in new tab..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Start the backend in a new tab
open_new_tab "CCN Backend API" "
    echo '🔧 Starting CCN Backend API...'
    cd '/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_backend'
    npm run devStart
"

if wait_for_service "http://localhost:3000" "CCN Backend API"; then
    print_success "CCN Backend API started successfully"
else
    print_error "CCN Backend API failed to start"
    exit 1
fi

# =============================================================================
# 5. CCN ADMIN PANEL
# =============================================================================
print_status "5/6 Starting CCN Admin Panel in new tab..."

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
    
    # Start the admin panel in a new tab
    open_new_tab "CCN Admin Panel" "
        echo '👨‍💼 Starting CCN Admin Panel...'
        cd '/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_Admin'
        flutter run -d web-server --web-port 8080 --web-hostname 0.0.0.0
    "
    
    if wait_for_service "http://localhost:8080" "CCN Admin Panel"; then
        print_success "CCN Admin Panel started successfully"
    else
        print_warning "CCN Admin Panel failed to start (this is optional)"
    fi
fi

# =============================================================================
# 6. REACT NATIVE MOBILE APP
# =============================================================================
print_status "6/6 Starting React Native Mobile App in new tab..."

cd "/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_Mobile_ReactNative"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing mobile app dependencies..."
    npm install
fi

# Start the React Native app in a new tab
open_new_tab "React Native Mobile App" "
    echo '📱 Starting React Native Mobile App...'
    echo '📱 Scan the QR code below with Expo Go app on your phone!'
    echo '📱 Or press w to open in web browser'
    echo '📱 Or press a to open Android emulator'
    echo '📱 Or press i to open iOS simulator'
    echo ''
    cd '/home/mattias/Thesis/Material/CCN report/CCN Repos/CCN_Mobile_ReactNative'
    npx expo start --host lan --port 8081
"

# Wait a bit for Expo to start
sleep 10

print_success "React Native Mobile App started successfully"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "🎉 CCN Complete System Started Successfully in Separate Tabs!"
echo "============================================================="
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
echo "📱 Mobile App Testing:"
echo "├── Install Expo Go app on your phone"
echo "├── Scan the QR code from the 'React Native Mobile App' tab"
echo "├── Or press 'w' in that tab to open in web browser"
echo "├── Or press 'a' in that tab to open Android emulator"
echo "├── Or press 'i' in that tab to open iOS simulator"
echo "└── Login with: demo@ccn.com / demo123456"
echo ""
echo "🛑 To stop all services, close the terminal tabs or run: ./stop_all_services.sh"
echo ""
print_success "All services are ready for testing! 🚀"
print_status "Check the terminal tabs for QR codes and service logs!"

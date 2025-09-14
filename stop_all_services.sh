#!/bin/bash

# CCN Complete System Stop Script
# This script stops all CCN services

echo "🛑 Stopping CCN Complete System..."
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

# Function to kill process by PID file
kill_by_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                print_warning "Force killing $service_name..."
                kill -9 "$pid"
            fi
            print_success "$service_name stopped"
        else
            print_warning "$service_name was not running"
        fi
        rm -f "$pid_file"
    else
        print_warning "PID file for $service_name not found"
    fi
}

# Function to kill process by port
kill_by_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        print_status "Stopping $service_name on port $port (PID: $pid)..."
        kill "$pid" 2>/dev/null
        sleep 2
        if lsof -ti:$port >/dev/null 2>&1; then
            print_warning "Force killing $service_name on port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null
        fi
        print_success "$service_name stopped"
    else
        print_warning "$service_name was not running on port $port"
    fi
}

print_status "Stopping services in reverse order..."

# =============================================================================
# 1. REACT NATIVE MOBILE APP
# =============================================================================
print_status "1/6 Stopping React Native Mobile App..."
kill_by_pid_file "logs/mobile_app.pid" "React Native Mobile App"
kill_by_port 8081 "React Native Mobile App"

# =============================================================================
# 2. CCN ADMIN PANEL
# =============================================================================
print_status "2/6 Stopping CCN Admin Panel..."
kill_by_pid_file "logs/admin_panel.pid" "CCN Admin Panel"
kill_by_port 8080 "CCN Admin Panel"

# =============================================================================
# 3. CCN BACKEND API
# =============================================================================
print_status "3/6 Stopping CCN Backend API..."
kill_by_pid_file "logs/backend.pid" "CCN Backend API"
kill_by_port 3000 "CCN Backend API"

# =============================================================================
# 4. FACE ANONYMIZATION SERVICE
# =============================================================================
print_status "4/6 Stopping Face Anonymization Service..."
kill_by_pid_file "logs/face_anonymization.pid" "Face Anonymization Service"
kill_by_port 8000 "Face Anonymization Service"

# =============================================================================
# 5. TEXT DE-IDENTIFICATION SERVICE
# =============================================================================
print_status "5/6 Stopping Text De-identification Service..."
kill_by_pid_file "logs/text_deidentification.pid" "Text De-identification Service"
kill_by_port 8001 "Text De-identification Service"

# =============================================================================
# 6. MONGODB DATABASE
# =============================================================================
print_status "6/6 Stopping MongoDB Database..."
kill_by_port 27017 "MongoDB Database"

# Clean up any remaining processes
print_status "Cleaning up any remaining processes..."
for port in 27017 3000 8000 8001 8080 8081; do
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        print_warning "Force killing remaining process on port $port (PID: $pid)"
        kill -9 "$pid" 2>/dev/null
    fi
done

# Clean up PID files
rm -f logs/*.pid

echo ""
print_success "All CCN services have been stopped! 🛑"
echo ""
echo "📁 Logs are still available in: ./logs/"
echo "├── mongodb.log"
echo "├── text_deidentification.log"
echo "├── face_anonymization.log"
echo "├── backend.log"
echo "├── admin_panel.log"
echo "└── mobile_app.log"
echo ""
echo "🚀 To start all services again, run: ./start_all_services.sh"

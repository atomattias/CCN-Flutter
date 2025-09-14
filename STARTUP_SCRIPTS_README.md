# 🚀 CCN System Startup Scripts

This directory contains several scripts to start the complete CCN (Clinical Communication Network) system.

## 📋 Available Scripts

### 1. `start_all_services_tabs_universal.sh` ⭐ **RECOMMENDED**
**Best for testing and development**

- Starts all services in separate terminal tabs
- Works with most terminal emulators (gnome-terminal, konsole, xterm, etc.)
- Allows you to interact with each service individually
- **Perfect for scanning QR codes from Expo**
- Shows logs and allows keyboard interaction

```bash
./start_all_services_tabs_universal.sh
```

### 2. `start_all_services_tabs.sh`
**For GNOME Terminal users**

- Same as universal but optimized for gnome-terminal
- Starts all services in separate tabs
- Good for Ubuntu/GNOME users

```bash
./start_all_services_tabs.sh
```

### 3. `start_all_services.sh`
**For background operation**

- Starts all services in the background
- No terminal interaction possible
- Good for production or automated testing
- Logs are saved to `./logs/` directory

```bash
./start_all_services.sh
```

### 4. `stop_all_services.sh`
**Stop all services**

- Stops all running CCN services
- Cleans up processes and ports
- Works with any startup method

```bash
./stop_all_services.sh
```

## 🎯 Quick Start (Recommended)

1. **Start all services in tabs:**
   ```bash
   ./start_all_services_tabs_universal.sh
   ```

2. **Wait for all services to start** (about 2-3 minutes)

3. **Test the mobile app:**
   - Look for the "React Native Mobile App" tab
   - Scan the QR code with Expo Go app on your phone
   - Or press 'w' in that tab to open in web browser

4. **Login to the app:**
   - Email: `demo@ccn.com`
   - Password: `demo123456`

## 📊 Services Started

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| MongoDB Database | 27017 | http://localhost:27017 | Database |
| Text De-identification | 8001 | http://localhost:8001 | PHI removal service |
| Face Anonymization | 8000 | http://localhost:8000 | Image privacy service |
| CCN Backend API | 3000 | http://localhost:3000 | Main API |
| CCN Admin Panel | 8080 | http://localhost:8080 | Admin interface |
| React Native App | 8081 | http://localhost:8081 | Mobile app |

## 🧪 Testing the System

### 1. Health Checks
Test if all services are running:
```bash
curl http://localhost:3000/api/auth/health  # Backend
curl http://localhost:8001/health           # Text De-identification
curl http://localhost:8000/health           # Face Anonymization
```

### 2. Mobile App Testing
1. Install **Expo Go** app on your phone
2. Scan the QR code from the "React Native Mobile App" tab
3. Login with `demo@ccn.com` / `demo123456`
4. Test the "Create Case" feature

### 3. Create a Clinical Case
1. Open the mobile app
2. Tap "Create Case" on the home screen
3. Fill out the form with test data
4. Upload an image (will be anonymized)
5. Enter text with PHI (will be de-identified)
6. Submit the case

## 🛠️ Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
```bash
./stop_all_services.sh
./start_all_services_tabs_universal.sh
```

### Service Won't Start
1. Check the terminal tab for that service
2. Look at the error messages
3. Make sure all dependencies are installed
4. Try restarting the specific service

### Mobile App Issues
1. Make sure you're on the same network as your computer
2. Try the web version by pressing 'w' in the Expo tab
3. Check that the backend is running on port 3000

### Dependencies Missing
If services fail to start due to missing dependencies:

**Backend:**
```bash
cd CCN_backend && npm install
```

**Text De-identification:**
```bash
cd CCN_TextDeidentification && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

**Face Anonymization:**
```bash
cd CCN_FaceAnonymization && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

**Mobile App:**
```bash
cd CCN_Mobile_ReactNative && npm install
```

## 📱 Mobile App Features to Test

1. **Authentication**
   - Login with demo credentials
   - Logout functionality

2. **Create Clinical Case**
   - Fill out comprehensive forms
   - Upload images (face anonymization)
   - Enter text with PHI (text de-identification)
   - Submit case

3. **Browse Channels**
   - View available channels
   - Join/leave channels

4. **Profile Management**
   - View user profile
   - Update settings

## 🔧 Development Tips

- Each service runs in its own tab, so you can see logs in real-time
- Press Ctrl+C in any tab to stop that specific service
- The scripts automatically handle virtual environments and dependencies
- All logs are also saved to the `./logs/` directory

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ All 6 terminal tabs are open and running
- ✅ Health check URLs return success
- ✅ Mobile app loads and you can login
- ✅ You can create a clinical case with image and text processing
- ✅ Face anonymization and text de-identification work

Happy testing! 🚀



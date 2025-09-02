# CCN (Content Communication Network) Project

A comprehensive content communication network system with web admin panel, mobile app, and backend API.

## 🏗️ Project Structure

```
CCN Repos/
├── CCN_Admin/          # Flutter web admin panel
├── CCN_backend/        # Node.js/TypeScript backend API
├── CCN_Mobile_App/    # Flutter mobile application
└── ccn-db/            # MongoDB database dump files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Flutter 3.24+
- MongoDB 7.0+
- Git

### 1. Backend Setup
```bash
cd CCN_backend
npm install
npm run devStart
```
Backend will run on `http://localhost:3000`

### 2. Admin Panel Setup
```bash
cd CCN_Admin
flutter pub get
flutter run -d web-server --web-port 8080
```
Admin panel will run on `http://localhost:8080`

### 3. Mobile App Setup
```bash
cd CCN_Mobile_App
flutter pub get
flutter run -d web-server --web-port 8081
```
Mobile app will run on `http://localhost:8081`

## 🔐 Default Admin Credentials

- **Email**: `admin@test.com`
- **Password**: `admin123456`

## 📱 Current Status

- ✅ **Backend**: Fully functional with CORS enabled
- ✅ **Admin Panel**: Working with full user management
- ✅ **Database**: Restored with sample data
- ❌ **Mobile App**: Has dependency compatibility issues (being rewritten)

## 🛠️ Development

### Backend Features
- User authentication and authorization
- Channel management
- Message handling
- Subscription management
- File uploads
- Real-time chat with Socket.IO

### Admin Panel Features
- User management (create, edit, delete)
- Channel management
- Subscription management
- Role-based access control
- Real-time updates

### Mobile App Features (In Development)
- User authentication
- Channel browsing
- Real-time messaging
- Push notifications

## 🔧 Configuration

### Environment Variables
Create `.env` file in `CCN_backend/`:
```env
NODE_ENV=development
PORT=3000
SECRET_KEY=your_secret_key
MONGO_LOCAL=mongodb://localhost:27017/ccn
MONGO_SERVER=mongodb://localhost:27017/ccn
MAIL=admin@ccn.local
PASS=admin123
```

### Database
The system uses MongoDB. Database dump files are available in `ccn-db/` directory.

## 📚 API Documentation

API documentation is available at `http://localhost:3000/doc` when the backend is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational/research purposes.

## 🆘 Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend is running and CORS is configured
2. **Database connection**: Check if MongoDB is running
3. **Port conflicts**: Ensure ports 3000, 8080, and 8081 are available
4. **Flutter version**: Ensure Flutter 3.24+ is installed

### Getting Help
- Check the logs in each service
- Verify all prerequisites are installed
- Ensure all services are running on correct ports

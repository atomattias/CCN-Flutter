# CCN Face Anonymization Integration Guide

This guide explains how to integrate the face anonymization service with the CCN (Clinical Communication Network) system.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │   CCN Backend    │    │ Face Anonym.    │
│   Mobile App    │    │   (Node.js)      │    │ Service (Python)│
│                 │    │   Port: 3000     │    │   Port: 8000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Start the Face Anonymization Service

```bash
cd CCN_FaceAnonymization
./start.sh
```

The service will be available at `http://localhost:8000`

### 2. Start the CCN Backend

```bash
cd CCN_backend
npm install  # Install new dependencies (axios, form-data)
npm run devStart
```

### 3. Test the Integration

```bash
cd CCN_FaceAnonymization
python test_service.py
```

## 📡 API Endpoints

### Face Anonymization Service

- **Health Check**: `GET http://localhost:8000/health`
- **Anonymize Image**: `POST http://localhost:8000/anonymize`
- **Batch Anonymize**: `POST http://localhost:8000/batch-anonymize`
- **API Docs**: `http://localhost:8000/docs`

### CCN Backend (Updated)

- **Upload File (with anonymization)**: `POST /api/files/sendfile`
- **Upload Image (with anonymization)**: `POST /api/files/upload-image`

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file in the CCN backend:

```bash
# Face Anonymization Service
FACE_ANONYMIZATION_SERVICE_URL=http://localhost:8000
ANONYMIZATION_ENABLED=true
```

### Mobile App Configuration

The mobile app will need to be updated to include anonymization options in the image upload flow.

## 📱 Mobile App Integration

### New Upload Endpoint

Use the new `/api/files/upload-image` endpoint for images:

```typescript
const uploadImageWithAnonymization = async (
  imageUri: string,
  channelId: string,
  options: {
    anonymize?: boolean;
    method?: 'blur' | 'pixelate' | 'solid';
    quality?: 'low' | 'medium' | 'high';
  }
) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  } as any);
  formData.append('channelID', channelId);
  formData.append('anonymize', options.anonymize?.toString() || 'true');
  formData.append('anonymizationMethod', options.method || 'pixelate');
  formData.append('anonymizationQuality', options.quality || 'medium');

  const response = await fetch(`${API_BASE_URL}/api/files/upload-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

### User Interface Updates

Add anonymization controls to the image upload screen:

```typescript
// Anonymization toggle (default: ON)
const [anonymize, setAnonymize] = useState(true);

// Anonymization method selector
const [method, setMethod] = useState<'pixelate' | 'blur' | 'solid'>('pixelate');

// Quality selector
const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
```

## 🔒 Security & Privacy

### Default Settings
- **Anonymization**: Enabled by default
- **Method**: Pixelate (best balance of privacy and medical context)
- **Quality**: Medium (good anonymization without losing too much detail)

### Privacy Protection
- Images are processed in memory (not stored)
- Original filenames are preserved in metadata
- Anonymization status is tracked in the database

## 📊 Database Schema Updates

The `File` model now includes anonymization metadata:

```typescript
{
  // ... existing fields
  metadata: {
    originalFileName: String,
    anonymized: Boolean,
    anonymizationMethod: String,
    anonymizationQuality: String,
  }
}
```

## 🧪 Testing

### 1. Test Face Anonymization Service

```bash
cd CCN_FaceAnonymization
python test_service.py
```

### 2. Test Backend Integration

```bash
# Test with curl
curl -X POST http://localhost:3000/api/files/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_image.jpg" \
  -F "channelID=CHANNEL_ID" \
  -F "anonymize=true" \
  -F "anonymizationMethod=pixelate" \
  -F "anonymizationQuality=medium"
```

### 3. Test Mobile App

1. Open the mobile app
2. Navigate to a channel
3. Upload an image with anonymization enabled
4. Verify the image is anonymized

## 🚨 Troubleshooting

### Common Issues

1. **Face Anonymization Service Not Starting**
   - Check if port 8000 is available
   - Verify Python dependencies are installed
   - Check Docker installation if using Docker

2. **Backend Integration Fails**
   - Verify the service URL in environment variables
   - Check if the face anonymization service is running
   - Verify new dependencies are installed

3. **Images Not Being Anonymized**
   - Check if anonymization is enabled in the request
   - Verify the file is an image (jpg, png, etc.)
   - Check backend logs for error messages

### Logs

- **Face Anonymization Service**: Check console output
- **CCN Backend**: Check console output for anonymization logs
- **Mobile App**: Check network requests in developer tools

## 🔄 Deployment

### Production Deployment

1. **Face Anonymization Service**:
   ```bash
   docker build -t ccn-face-anonymization .
   docker run -d -p 8000:8000 --name ccn-face-anonymization ccn-face-anonymization
   ```

2. **CCN Backend**:
   - Update `FACE_ANONYMIZATION_SERVICE_URL` to production URL
   - Deploy as usual

3. **Mobile App**:
   - Update API endpoints to production URLs
   - Deploy as usual

### Scaling Considerations

- **Face Anonymization Service**: Can be scaled horizontally
- **Load Balancing**: Use a load balancer for multiple instances
- **Caching**: Consider caching anonymized images for repeated requests

## 📈 Performance

### Expected Performance
- **Processing Time**: 2-5 seconds per image
- **Memory Usage**: ~500MB per service instance
- **Concurrent Requests**: Supports multiple concurrent requests

### Optimization Tips
- Use lower quality settings for faster processing
- Implement image resizing before anonymization
- Consider async processing for large batches

## 🆘 Support

For issues and questions:
1. Check the logs for error details
2. Verify all services are running
3. Test with the provided test scripts
4. Contact the development team

## 📝 Next Steps

1. **Mobile App Updates**: Implement the UI changes for anonymization controls
2. **Testing**: Comprehensive testing with real medical images
3. **Performance Optimization**: Fine-tune for production use
4. **Monitoring**: Add monitoring and alerting for the anonymization service
5. **Documentation**: Update user documentation with anonymization features






















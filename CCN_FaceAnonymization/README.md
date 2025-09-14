ii# CCN Face Anonymization Service

A FastAPI-based microservice for anonymizing faces in medical images to protect patient privacy. This service uses MediaPipe and OpenCV to detect and anonymize faces with high accuracy.

## 🎯 Features

- **Advanced Face Detection**: Uses MediaPipe Face Detection and Face Mesh for precise landmark detection
- **Multiple Anonymization Methods**: Blur, pixelate, or solid color anonymization
- **Quality Settings**: Low, medium, and high quality options for each method
- **Side View Support**: Detects and anonymizes faces in side views including ears
- **Batch Processing**: Support for processing multiple images at once
- **RESTful API**: Clean FastAPI-based REST API
- **Docker Support**: Easy deployment with Docker
- **Health Checks**: Built-in health monitoring

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Build the Docker image
docker build -t ccn-face-anonymization .

# Run the service
docker run -p 8000:8000 ccn-face-anonymization
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 📚 API Documentation

Once the service is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

#### `POST /anonymize`
Anonymize a single image.

**Parameters:**
- `file`: Image file (multipart/form-data)
- `method`: Anonymization method (`blur`, `pixelate`, `solid`) - default: `pixelate`
- `quality`: Quality level (`low`, `medium`, `high`) - default: `medium`

**Response:** Anonymized image as JPEG

#### `POST /batch-anonymize`
Anonymize multiple images in batch.

**Parameters:**
- `files`: List of image files (multipart/form-data)
- `method`: Anonymization method - default: `pixelate`
- `quality`: Quality level - default: `medium`

**Response:** ZIP file containing anonymized images

#### `GET /health`
Health check endpoint.

**Response:** Service health status

## 🔧 Configuration

The service can be configured using environment variables:

```bash
# Server settings
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Face detection settings
MIN_DETECTION_CONFIDENCE=0.5
MIN_TRACKING_CONFIDENCE=0.5
MAX_NUM_FACES=5

# Image processing settings
MAX_IMAGE_SIZE=2000
MIN_IMAGE_SIZE=200

# Default anonymization settings
DEFAULT_METHOD=pixelate
DEFAULT_QUALITY=medium
```

## 🎨 Anonymization Methods

### 1. Pixelate (Default)
- **Low Quality**: 8px pixel size
- **Medium Quality**: 12px pixel size  
- **High Quality**: 16px pixel size

### 2. Blur
- **Low Quality**: 15px kernel, σ=5
- **Medium Quality**: 25px kernel, σ=8
- **High Quality**: 35px kernel, σ=12

### 3. Solid
- **All Qualities**: Black solid color

## 🔍 Face Detection Features

- **Front View**: Anonymizes eyes, eyebrows, and orbital bones
- **Side View**: Detects face orientation and anonymizes visible ear
- **Multiple Faces**: Supports up to 5 faces per image
- **Adaptive Processing**: Automatically adjusts for image size and face size
- **Landmark Detection**: Uses 468 facial landmarks for precise detection

## 🏥 Medical Use Cases

This service is specifically designed for medical applications:

- **Patient Privacy**: Protects patient identity in medical images
- **HIPAA Compliance**: Helps meet healthcare privacy requirements
- **Clinical Communication**: Safe sharing of medical images between practitioners
- **Research**: Anonymized images for medical research and case studies

## 🔒 Security Considerations

- **No Data Storage**: Images are processed in memory and not stored
- **CORS Configuration**: Configure allowed origins for production
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Authentication**: Add authentication middleware for production deployment

## 🚀 Integration with CCN Backend

To integrate with the CCN backend:

1. **Start the service**: `docker run -p 8000:8000 ccn-face-anonymization`
2. **Update backend**: Add face anonymization endpoint to CCN backend
3. **Update mobile app**: Modify image upload to use anonymization

Example integration:

```typescript
// Backend integration
const anonymizeImage = async (imageBuffer: Buffer) => {
  const formData = new FormData();
  formData.append('file', new Blob([imageBuffer]), 'image.jpg');
  
  const response = await fetch('http://localhost:8000/anonymize', {
    method: 'POST',
    body: formData,
  });
  
  return response.arrayBuffer();
};
```

## 📊 Performance

- **Processing Time**: 2-5 seconds per image (depending on size and complexity)
- **Memory Usage**: ~500MB for MediaPipe models
- **Concurrent Requests**: Supports multiple concurrent requests
- **Image Size**: Handles images up to 2000px (automatically resized)

## 🐛 Troubleshooting

### Common Issues

1. **MediaPipe initialization fails**
   - Ensure all dependencies are installed
   - Check system requirements

2. **No faces detected**
   - Verify image quality and face visibility
   - Check detection confidence thresholds

3. **Performance issues**
   - Reduce image size before processing
   - Use lower quality settings

### Logs

The service provides detailed logging:
- **INFO**: General operation logs
- **ERROR**: Error conditions and exceptions
- **DEBUG**: Detailed processing information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the CCN (Clinical Communication Network) system.

## 🆘 Support

For issues and questions:
1. Check the logs for error details
2. Verify image format and size
3. Test with the health check endpoint
4. Contact the development team

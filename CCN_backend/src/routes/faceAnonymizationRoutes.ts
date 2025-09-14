import { Router, Request, Response } from 'express';
import { faceAnonymizationService } from '../services/faceAnonymizationService';

const router = Router();

/**
 * POST /api/face-anonymization/anonymize
 * Anonymize faces in an image
 */
router.post('/anonymize', async (req: Request, res: Response) => {
  try {
    console.log('=== Face Anonymization Request ===');
    console.log('Headers:', req.headers);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Image type:', typeof req.body.image);
    console.log('Image length:', req.body.image?.length);
    console.log('Method:', req.body.method);
    console.log('Quality:', req.body.quality);
    console.log('================================');
    
    const { image, method, quality } = req.body;

    if (!image || typeof image !== 'string') {
      console.log('ERROR: Invalid image data');
      return res.status(400).json({
        success: false,
        error: 'Image is required and must be a base64 string'
      });
    }

    console.log('Calling face anonymization service...');
    const result = await faceAnonymizationService.anonymizeFaces({
      image,
      method: method || 'blur',
      quality: quality || 'high'
    });

    console.log('Face anonymization successful, returning result');
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Face anonymization API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Face anonymization failed'
    });
  }
});

/**
 * POST /api/face-anonymization/process-with-choice
 * Process image with user choice for face anonymization
 */
router.post('/process-with-choice', async (req: Request, res: Response) => {
  try {
    const { image, method, quality } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Image is required and must be a base64 string'
      });
    }

    const result = await faceAnonymizationService.processImageWithChoice(image, {
      method: method || 'blur',
      quality: quality || 'high'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Face anonymization with choice API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Face anonymization failed'
    });
  }
});

/**
 * GET /api/face-anonymization/health
 * Check if the face anonymization service is healthy
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await faceAnonymizationService.checkHealth();
    
    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Face anonymization health check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

export default router;

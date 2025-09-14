import { Router, Request, Response } from 'express';
import { textDeidentificationService } from '../services/textDeidentificationService';

const router = Router();

/**
 * POST /api/text-deidentification/deidentify
 * De-identify text by removing PHI
 */
router.post('/deidentify', async (req: Request, res: Response) => {
  try {
    const { text, method, sensitivity, preserve_context, custom_patterns } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
    }

    const result = await textDeidentificationService.deidentifyText({
      text,
      method: method || 'comprehensive',
      sensitivity: sensitivity || 'high',
      preserve_context: preserve_context !== false,
      custom_patterns: custom_patterns || []
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Text de-identification API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Text de-identification failed'
    });
  }
});

/**
 * POST /api/text-deidentification/detect
 * Detect PHI in text without removing it
 */
router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { text, method, sensitivity } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
    }

    const result = await textDeidentificationService.detectPHI({
      text,
      method: method || 'comprehensive',
      sensitivity: sensitivity || 'high'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('PHI detection API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'PHI detection failed'
    });
  }
});

/**
 * GET /api/text-deidentification/health
 * Check if the text de-identification service is healthy
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await textDeidentificationService.checkHealth();
    
    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

export default router;

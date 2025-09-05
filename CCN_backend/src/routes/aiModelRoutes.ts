import { Router } from 'express';
import aiModelController from '../controllers/aiModelController';
import middleware from '../utils/middlewares';

const router = Router();

// Apply authentication middleware to all AI model routes
router.use(middleware.auth);

/**
 * @route POST /api/ai/analyze
 * @desc Analyze clinical question with AI
 * @access Private (Authenticated clinicians)
 */
router.post('/analyze', aiModelController.analyzeClinicalQuestion);

/**
 * @route GET /api/ai/analysis/:questionId
 * @desc Get AI analysis for a specific clinical question
 * @access Private (Authenticated clinicians)
 */
router.get('/analysis/:questionId', aiModelController.analyzeClinicalQuestion);

/**
 * @route POST /api/ai/train
 * @desc Train the AI model with new data
 * @access Private (Admin/Researchers only)
 */
router.post('/train', aiModelController.trainAIModel);

/**
 * @route GET /api/ai/info
 * @desc Get AI model information and capabilities
 * @access Private (Authenticated users)
 */
router.get('/info', aiModelController.getAIModelInfo);

/**
 * @route GET /api/ai/metrics
 * @desc Get AI model performance metrics
 * @access Private (Admin/Researchers only)
 */
router.get('/metrics', aiModelController.getAIMetrics);

export default router;



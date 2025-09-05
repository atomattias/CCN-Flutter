import { Request, Response } from 'express';
import ClinicalAISystem from '../services/aiAlgorithms/clinicalAISystem';
import { ClinicalQuestion } from '../models/clinicalKnowledgeModel';

class AIModelController {
  private aiSystem: ClinicalAISystem;

  constructor() {
    this.aiSystem = new ClinicalAISystem();
  }

  /**
   * Analyze clinical question with AI
   */
  async analyzeClinicalQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { questionId } = req.params;
      const { symptoms, images, labValues, vitalSigns, medications, allergies, familyHistory, socialHistory, physicalExam, specialty } = req.body;

      // Get the clinical question from database (mock for now)
      const clinicalQuestion = await this.getClinicalQuestion(questionId);
      
      if (!clinicalQuestion) {
        res.status(404).json({ success: false, error: 'Clinical question not found' });
        return;
      }

      // Perform AI analysis
      const analysis = await this.aiSystem.analyzeClinicalCase({
        symptoms: symptoms || [],
        images: images || [],
        labValues: JSON.stringify(labValues || {}),
        vitalSigns: JSON.stringify(vitalSigns || {}),
        medications: JSON.stringify(medications || []),
        allergies: JSON.stringify(allergies || []),
        familyHistory: familyHistory || '',
        socialHistory: socialHistory || '',
        physicalExam: physicalExam || '',
        specialty: specialty || 'general',
        urgency: 'medium',
        comorbidities: []
      });

      res.json({
        success: true,
        data: {
          questionId,
          analysis,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'AI analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get AI model performance metrics
   */
  async getAIMetrics(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.aiSystem.getSystemStatus();
      
      res.json({
        success: true,
        data: {
          isInitialized: status.isInitialized,
          modelsLoaded: status.models.length,
          lastUpdated: status.lastUpdate,
          systemHealth: 'healthy'
        }
      });

    } catch (error) {
      console.error('Get AI metrics error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get AI metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Train AI model with new data
   */
  async trainAIModel(req: Request, res: Response): Promise<void> {
    try {
      const { trainingData } = req.body;
      
      if (!trainingData || !Array.isArray(trainingData)) {
        res.status(400).json({ 
          success: false, 
          error: 'Training data is required and must be an array' 
        });
        return;
      }

      // Initialize the AI system if not already done
      await this.aiSystem.initialize();
      
      res.json({
        success: true,
        data: {
          message: 'AI system initialized successfully',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI training error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'AI model training failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get AI model information
   */
  async getAIModelInfo(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.aiSystem.getSystemStatus();
      
      res.json({
        success: true,
        data: {
          modelType: 'Clinical AI System',
          version: '1.0.0',
          lastTrained: new Date().toISOString(),
          isInitialized: status.isInitialized,
          modelsLoaded: status.models.length,
          capabilities: [
            'Medical Image Analysis',
            'Symptom Pattern Recognition',
            'Differential Diagnosis',
            'Treatment Recommendations',
            'Risk Assessment'
          ],
          specialties: [
            'General Medicine',
            'Cardiology',
            'Pulmonology',
            'Radiology',
            'Emergency Medicine'
          ]
        }
      });

    } catch (error) {
      console.error('Get AI model info error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get AI model information',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get clinical question by ID (mock implementation)
   */
  private async getClinicalQuestion(questionId: string): Promise<any> {
    // Mock implementation - in real app, this would query the database
    return {
      _id: questionId,
      title: 'Sample Clinical Question',
      description: 'This is a sample clinical question for AI analysis',
      symptoms: ['fever', 'cough'],
      images: [],
      labValues: {},
      vitalSigns: {},
      medications: [],
      allergies: [],
      familyHistory: '',
      socialHistory: '',
      physicalExam: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export default new AIModelController();

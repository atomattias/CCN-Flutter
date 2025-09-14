import { Request, Response } from 'express';
import { ClinicalQuestionModel, ClinicalResponseModel } from '../models/clinicalKnowledgeModel';
import { textDeidentificationService } from '../services/textDeidentificationService';
import { faceAnonymizationService } from '../services/faceAnonymizationService';

class ClinicalKnowledgeController {
  /**
   * Create a new clinical question
   */
  async createClinicalQuestionModel(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        patientSymptoms,
        patientHistory,
        diagnosticTests,
        suspectedConditions,
        urgency,
        specialty,
        department,
        tags,
        isAnonymous,
        structuredData,
        clinicalImages,
        deidentificationStatus,
        authorId,
        authorName,
        authorSpecialty,
        authorHospital
      } = req.body;

      // Validate required fields
      if (!title || !description || !patientSymptoms || !specialty || !department) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, patientSymptoms, specialty, department'
        });
        return;
      }

      // Process text de-identification if enabled
      let processedTexts = {
        title,
        description,
        patientSymptoms,
        patientHistory: patientHistory || '',
      };

      let phiDetected: any[] = [];
      let deidentificationMetadata: any = null;

      if (deidentificationStatus === 'completed') {
        try {
          // Process each text field for PHI detection and de-identification
          const textFields = {
            title,
            description,
            patientSymptoms,
            patientHistory: patientHistory || '',
          };

          // Detect PHI in all text fields
          for (const [fieldName, text] of Object.entries(textFields)) {
            if (text && text.trim()) {
              try {
                const detectionResult = await textDeidentificationService.detectPHI({
                  text,
                  method: 'comprehensive',
                  sensitivity: 'high',
                });

                if (detectionResult.phi_detected && detectionResult.phi_detected.length > 0) {
                  phiDetected.push(...detectionResult.phi_detected.map(phi => ({
                    ...phi,
                    field: fieldName
                  })));

                  // De-identify the text
                  const deidentifiedResult = await textDeidentificationService.deidentifyText({
                    text,
                    method: 'comprehensive',
                    sensitivity: 'high',
                    preserve_context: true,
                  });

                  processedTexts[fieldName as keyof typeof processedTexts] = deidentifiedResult.deidentified_text;
                }
              } catch (error) {
                console.error(`Text de-identification error for field ${fieldName}:`, error);
                // Continue with original text if de-identification fails
              }
            }
          }

          // Set de-identification metadata
          deidentificationMetadata = {
            processedAt: new Date(),
            method: 'comprehensive',
            confidence: phiDetected.length > 0 ? 0.9 : 1.0,
            phiCount: phiDetected.length,
            serviceVersion: '1.0.0',
            processingTime: Date.now(),
          };
        } catch (error) {
          console.error('Text de-identification error:', error);
          // Continue with original texts if de-identification fails
        }
      }

      // Process image anonymization if images are provided
      let processedImages = clinicalImages || [];
      if (clinicalImages && clinicalImages.length > 0) {
        try {
          // Process each image for face anonymization
          processedImages = await Promise.all(
            clinicalImages.map(async (image: any) => {
              if (image.anonymizationStatus === 'completed' && image.anonymizedUri) {
                return {
                  ...image,
                  anonymizationStatus: 'completed',
                  anonymizationTimestamp: new Date(),
                };
              }
              return image;
            })
          );
        } catch (error) {
          console.error('Image anonymization error:', error);
          // Continue with original images if anonymization fails
        }
      }

      // Create the clinical question
      const clinicalQuestion = new ClinicalQuestionModel({
        title: processedTexts.title,
        description: processedTexts.description,
        patientSymptoms: processedTexts.patientSymptoms,
        patientHistory: processedTexts.patientHistory,
        diagnosticTests: diagnosticTests || [],
        suspectedConditions: suspectedConditions || [],
        urgency: urgency || 'medium',
        specialty,
        department,
        tags: tags || [],
        isAnonymous: isAnonymous || false,
        isEncrypted: true,
        authorId,
        authorName,
        authorSpecialty,
        authorHospital,
        structuredData: structuredData || {},
        clinicalImages: processedImages,
        deidentificationStatus: deidentificationStatus || 'pending',
        originalText: {
          title,
          description,
          patientSymptoms,
          patientHistory: patientHistory || '',
        },
        deidentifiedText: {
          title: processedTexts.title,
          description: processedTexts.description,
          patientSymptoms: processedTexts.patientSymptoms,
          patientHistory: processedTexts.patientHistory,
        },
        phiDetected,
        deidentificationMetadata,
        status: 'open',
        viewCount: 0,
        responseCount: 0,
        upvotes: 0,
        downvotes: 0,
      });

      await clinicalQuestion.save();

      res.status(201).json({
        success: true,
        data: {
          question: clinicalQuestion,
          message: 'Clinical question created successfully'
        }
      });

    } catch (error) {
      console.error('Create clinical question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create clinical question'
      });
    }
  }

  /**
   * Get all clinical questions
   */
  async getClinicalQuestionModels(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, specialty, urgency, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};
      if (specialty) filter.specialty = specialty;
      if (urgency) filter.urgency = urgency;
      if (status) filter.status = status;

      const questions = await ClinicalQuestionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('authorId', 'name email specialty hospital')
        .populate('peerResponses');

      const total = await ClinicalQuestionModel.countDocuments(filter);

      res.json({
        success: true,
        data: {
          questions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get clinical questions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get clinical questions'
      });
    }
  }

  /**
   * Get a specific clinical question
   */
  async getClinicalQuestionModel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const question = await ClinicalQuestionModel.findById(id)
        .populate('authorId', 'name email specialty hospital')
        .populate('peerResponses')
        .populate('votes.userId', 'name email');

      if (!question) {
        res.status(404).json({
          success: false,
          error: 'Clinical question not found'
        });
        return;
      }

      // Increment view count
      question.viewCount += 1;
      await question.save();

      res.json({
        success: true,
        data: { question }
      });

    } catch (error) {
      console.error('Get clinical question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get clinical question'
      });
    }
  }

  /**
   * Update a clinical question
   */
  async updateClinicalQuestionModel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.authorId;
      delete updates.createdAt;
      delete updates.viewCount;
      delete updates.responseCount;
      delete updates.upvotes;
      delete updates.downvotes;

      const question = await ClinicalQuestionModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!question) {
        res.status(404).json({
          success: false,
          error: 'Clinical question not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { question }
      });

    } catch (error) {
      console.error('Update clinical question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update clinical question'
      });
    }
  }

  /**
   * Delete a clinical question
   */
  async deleteClinicalQuestionModel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const question = await ClinicalQuestionModel.findByIdAndDelete(id);

      if (!question) {
        res.status(404).json({
          success: false,
          error: 'Clinical question not found'
        });
        return;
      }

      // Also delete associated responses
      await ClinicalResponseModel.deleteMany({ questionId: id });

      res.json({
        success: true,
        message: 'Clinical question deleted successfully'
      });

    } catch (error) {
      console.error('Delete clinical question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete clinical question'
      });
    }
  }

  /**
   * Create a clinical response
   */
  async createClinicalResponseModel(req: Request, res: Response): Promise<void> {
    try {
      const {
        questionId,
        content,
        diagnosis,
        treatmentPlan,
        evidence,
        confidence,
        authorId,
        authorName,
        authorSpecialty,
        authorHospital,
        isAnonymous
      } = req.body;

      // Validate required fields
      if (!questionId || !content || !diagnosis || !treatmentPlan) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: questionId, content, diagnosis, treatmentPlan'
        });
        return;
      }

      // Check if question exists
      const question = await ClinicalQuestionModel.findById(questionId);
      if (!question) {
        res.status(404).json({
          success: false,
          error: 'Clinical question not found'
        });
        return;
      }

      // Create the response
      const response = new ClinicalResponseModel({
        questionId,
        content,
        diagnosis,
        treatmentPlan,
        evidence: evidence || [],
        confidence: confidence || 0.5,
        authorId,
        authorName,
        authorSpecialty,
        authorHospital,
        isAnonymous: isAnonymous || false,
        isEncrypted: true,
        isAccepted: false,
        upvotes: 0,
        downvotes: 0,
      });

      await response.save();

      // Add response to question
      if (!question.peerResponses) {
        question.peerResponses = [];
      }
      question.peerResponses.push(response._id as any);
      question.responseCount += 1;
      await question.save();

      res.status(201).json({
        success: true,
        data: {
          response,
          message: 'Clinical response created successfully'
        }
      });

    } catch (error) {
      console.error('Create clinical response error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create clinical response'
      });
    }
  }

  /**
   * Get responses for a clinical question
   */
  async getClinicalResponseModels(req: Request, res: Response): Promise<void> {
    try {
      const { questionId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const responses = await ClinicalResponseModel.find({ questionId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('authorId', 'name email specialty hospital');

      const total = await ClinicalResponseModel.countDocuments({ questionId });

      res.json({
        success: true,
        data: {
          responses,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get clinical responses error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get clinical responses'
      });
    }
  }

  /**
   * Vote on a clinical question or response
   */
  async voteOnClinicalContent(req: Request, res: Response): Promise<void> {
    try {
      const { type, id } = req.params; // type: 'question' or 'response'
      const { userId, voteType } = req.body; // voteType: 'upvote' or 'downvote'

      if (!['question', 'response'].includes(type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid vote type. Must be "question" or "response"'
        });
        return;
      }

      if (!['upvote', 'downvote'].includes(voteType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid vote type. Must be "upvote" or "downvote"'
        });
        return;
      }

      let content;
      if (type === 'question') {
        content = await ClinicalQuestionModel.findById(id);
      } else {
        content = await ClinicalResponseModel.findById(id);
      }

      if (!content) {
        res.status(404).json({
          success: false,
          error: `${type} not found`
        });
        return;
      }

      // Simple voting system - just increment/decrement counters
      if (voteType === 'upvote') {
        content.upvotes += 1;
      } else {
        content.downvotes += 1;
      }

      await content.save();

      res.json({
        success: true,
        data: {
          upvotes: content.upvotes,
          downvotes: content.downvotes,
          userVote: voteType
        }
      });

    } catch (error) {
      console.error('Vote on clinical content error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to vote on clinical content'
      });
    }
  }

  /**
   * Search clinical questions
   */
  async searchClinicalQuestionModels(req: Request, res: Response): Promise<void> {
    try {
      const { q, specialty, urgency, tags, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = {};

      // Text search
      if (q) {
        filter.$text = { $search: q as string };
      }

      // Filter by specialty
      if (specialty) {
        filter.specialty = specialty;
      }

      // Filter by urgency
      if (urgency) {
        filter.urgency = urgency;
      }

      // Filter by tags
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        filter.tags = { $in: tagArray };
      }

      const questions = await ClinicalQuestionModel.find(filter)
        .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('authorId', 'name email specialty hospital');

      const total = await ClinicalQuestionModel.countDocuments(filter);

      res.json({
        success: true,
        data: {
          questions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Search clinical questions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search clinical questions'
      });
    }
  }
}

export default new ClinicalKnowledgeController();

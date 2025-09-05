import mongoose, { Document, Schema } from 'mongoose';

// Clinical Image Interface
export interface ClinicalImage {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  description?: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// AI Analysis Interface
export interface AIAnalysis {
  primaryDiagnosis: string;
  differentialDiagnosis: string[];
  confidence: number;
  reasoning: string;
  evidence: {
    symptoms: string[];
    labValues: string[];
    imageFindings: string[];
    riskFactors: string[];
  };
  redFlags: string[];
  treatmentRecommendations: string[];
  followUpActions: string[];
  limitations: string[];
  explainabilityScore: number;
  reasoningChain: string[];
  evidenceSources: string[];
  analyzedAt: string;
  modelVersion: string;
}

// Clinical Question Interface
export interface ClinicalQuestion extends Document {
  title: string;
  description: string;
  patientSymptoms: string;
  patientHistory?: string;
  diagnosticTests: string[];
  suspectedConditions: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  specialty: string;
  department: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorSpecialty: string;
  authorHospital: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  isAnonymous: boolean;
  isEncrypted: boolean;
  viewCount: number;
  responseCount: number;
  upvotes: number;
  downvotes: number;
  
  // Enhanced clinical data
  labValues?: string;
  vitalSigns?: string;
  medications?: string;
  allergies?: string;
  familyHistory?: string;
  socialHistory?: string;
  physicalExam?: string;
  clinicalImages?: ClinicalImage[];
  
  // AI Analysis
  aiAnalysis?: AIAnalysis;
  
  // Peer Responses
  peerResponses?: mongoose.Types.ObjectId[];
  
  // Voting
  votes?: {
    userId: mongoose.Types.ObjectId;
    voteType: 'upvote' | 'downvote';
    timestamp: Date;
  }[];
}

// Clinical Response Interface
export interface ClinicalResponse extends Document {
  questionId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorSpecialty: string;
  authorHospital: string;
  content: string;
  diagnosis: string;
  treatmentPlan: string;
  evidence: string[];
  confidence: number;
  isAccepted: boolean;
  acceptedBy?: mongoose.Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  isAnonymous: boolean;
  isEncrypted: boolean;
}

// Clinical Vote Interface
export interface ClinicalVote extends Document {
  userId: mongoose.Types.ObjectId;
  questionId?: mongoose.Types.ObjectId;
  responseId?: mongoose.Types.ObjectId;
  voteType: 'upvote' | 'downvote';
  reason?: string;
  timestamp: Date;
}

// Clinical Search Query Interface
export interface ClinicalSearchQuery {
  query: string;
  specialty?: string;
  department?: string;
  urgency?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasImages?: boolean;
  hasAIAnalysis?: boolean;
}

// Clinical Metrics Interface
export interface ClinicalMetrics {
  totalQuestions: number;
  totalResponses: number;
  averageResponseTime: number;
  topSpecialties: Array<{
    specialty: string;
    count: number;
  }>;
  urgencyDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  aiAnalysisStats: {
    totalAnalyses: number;
    averageConfidence: number;
    accuracyRate: number;
  };
}

// Clinical Question Schema
const ClinicalQuestionSchema = new Schema<ClinicalQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  patientSymptoms: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  patientHistory: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  diagnosticTests: [{
    type: String,
    trim: true,
  }],
  suspectedConditions: [{
    type: String,
    trim: true,
  }],
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  authorSpecialty: {
    type: String,
    required: true,
    trim: true,
  },
  authorHospital: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['open', 'answered', 'resolved', 'closed'],
    default: 'open',
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isEncrypted: {
    type: Boolean,
    default: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  responseCount: {
    type: Number,
    default: 0,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  
  // Enhanced clinical data
  labValues: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  vitalSigns: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  medications: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  allergies: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  familyHistory: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  socialHistory: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  physicalExam: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  clinicalImages: [{
    id: String,
    name: String,
    uri: String,
    type: String,
    size: Number,
    description: String,
    uploadedAt: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  }],
  
  // AI Analysis
  aiAnalysis: {
    primaryDiagnosis: String,
    differentialDiagnosis: [String],
    confidence: Number,
    reasoning: String,
    evidence: {
      symptoms: [String],
      labValues: [String],
      imageFindings: [String],
      riskFactors: [String],
    },
    redFlags: [String],
    treatmentRecommendations: [String],
    followUpActions: [String],
    limitations: [String],
    explainabilityScore: Number,
    reasoningChain: [String],
    evidenceSources: [String],
    analyzedAt: String,
    modelVersion: String,
  },
  
  // Peer Responses
  peerResponses: [{
    type: Schema.Types.ObjectId,
    ref: 'ClinicalResponse',
  }],
  
  // Voting
  votes: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Clinical Response Schema
const ClinicalResponseSchema = new Schema<ClinicalResponse>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'ClinicalQuestion',
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  authorSpecialty: {
    type: String,
    required: true,
    trim: true,
  },
  authorHospital: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  treatmentPlan: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  evidence: [{
    type: String,
    trim: true,
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  acceptedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  acceptedAt: Date,
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  isEncrypted: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Clinical Vote Schema
const ClinicalVoteSchema = new Schema<ClinicalVote>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'ClinicalQuestion',
  },
  responseId: {
    type: Schema.Types.ObjectId,
    ref: 'ClinicalResponse',
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
ClinicalQuestionSchema.index({ title: 'text', description: 'text', patientSymptoms: 'text' });
ClinicalQuestionSchema.index({ specialty: 1, urgency: 1 });
ClinicalQuestionSchema.index({ authorId: 1, createdAt: -1 });
ClinicalQuestionSchema.index({ tags: 1 });
ClinicalQuestionSchema.index({ status: 1, createdAt: -1 });

ClinicalResponseSchema.index({ questionId: 1, createdAt: -1 });
ClinicalResponseSchema.index({ authorId: 1, createdAt: -1 });
ClinicalResponseSchema.index({ isAccepted: 1 });

ClinicalVoteSchema.index({ userId: 1, questionId: 1 }, { unique: true });
ClinicalVoteSchema.index({ userId: 1, responseId: 1 }, { unique: true });

// Create models
export const ClinicalQuestionModel = mongoose.model<ClinicalQuestion>('ClinicalQuestion', ClinicalQuestionSchema);
export const ClinicalResponseModel = mongoose.model<ClinicalResponse>('ClinicalResponse', ClinicalResponseSchema);
export const ClinicalVoteModel = mongoose.model<ClinicalVote>('ClinicalVote', ClinicalVoteSchema);

export default {
  ClinicalQuestion: ClinicalQuestionModel,
  ClinicalResponse: ClinicalResponseModel,
  ClinicalVote: ClinicalVoteModel,
};






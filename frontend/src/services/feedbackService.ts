import { api } from '@/lib/api';

// Types for feedback-related data
export interface FeedbackOptions {
  includeHeader?: boolean;
  includeScore?: boolean;
  includeStrengths?: boolean;
  includeWeaknesses?: boolean;
  includeSuggestions?: boolean;
  includeCodeQualityMetrics?: boolean;
  includeFooter?: boolean;
  customHeader?: string;
  customFooter?: string;
}

export interface FeedbackResponse {
  id: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  codeQualityMetrics?: {
    maintainability: number;
    reliability: number;
    security: number;
    performance: number;
  };
  codeQualityDetails?: {
    staticAnalysis: string[];
    bestPractices: string[];
    performanceIssues: string[];
    securityVulnerabilities: string[];
  };
}

export interface InterviewFeedback {
  overallScore: number;
  feedback: string;
  recommendation: string;
  categoryScores: {
    [category: string]: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  submissions: FeedbackResponse[];
}

/**
 * Service for managing feedback generation
 */
export class FeedbackService {
  /**
   * Generate feedback for a specific response
   * @param responseId Response ID
   * @returns Feedback data
   */
  static async generateFeedbackForResponse(responseId: string): Promise<FeedbackResponse> {
    try {
      const { data } = await api.post(`feedback/responses/${responseId}`);
      return data.data;
    } catch (error) {
      console.error('Generate feedback for response error:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive feedback for an entire interview
   * @param interviewId Interview ID
   * @returns Interview feedback data
   */
  static async generateInterviewFeedback(interviewId: string): Promise<InterviewFeedback> {
    try {
      const { data } = await api.post(`feedback/interviews/${interviewId}`);
      return data.data;
    } catch (error) {
      console.error('Generate interview feedback error:', error);
      throw error;
    }
  }

  /**
   * Generate custom feedback for a response with customizable template
   * @param responseId Response ID
   * @param options Customization options for the feedback
   * @returns Customized feedback data
   */
  static async generateCustomFeedback(
    responseId: string,
    options: FeedbackOptions
  ): Promise<{ feedback: string }> {
    try {
      const { data } = await api.post(`feedback/responses/${responseId}/custom`, options);
      return data.data;
    } catch (error) {
      console.error('Generate custom feedback error:', error);
      throw error;
    }
  }
}

export default FeedbackService;
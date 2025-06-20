import {api} from '@/lib/api';

// Types for interview-related data
export interface Interview {
  id: string;
  title: string;
  description: string;
  scheduledDate: string | Date; // Changed from startTime/endTime to match backend
  duration: number; // Duration in minutes
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; // Updated to match backend enum
  questions: Question[];
  candidateId?: string;
  recruiterId?: string; // Changed from interviewerId to match backend
  createdAt: string;
  updatedAt: string;
  // Removed accessToken as it's generated separately by the backend
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'multiple-choice' | 'written';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  points: number;
  codeTemplate?: string;
  expectedOutput?: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  tags: string[];
}

export interface Submission {
  id: string;
  interviewId: string;
  questionId?: string;           // Backend property
  interviewQuestionId?: string;  // Frontend property
  candidateId?: string;
  answer?: string;              // Frontend property
  content?: string;             // Backend property
  language?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  executionTime?: number;
  executionResult?: {
    output: string;
    error?: string;
    passed: boolean;
    testResults?: {
      passed: boolean;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      error?: string;
    }[];
  };
  feedback?: string;
  aiAnalysis?: {
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
  };
  plagiarismReport?: {
    score: number;
    matches: {
      source: string;
      similarity: number;
      matchedText: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface InterviewResult {
  interview: Interview;
  submissions: Submission[];
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  feedback: string;
  recommendations: string[];
}

/**
 * Service for managing interviews
 */
export class InterviewService {
  /**
   * Get all interviews with filtering and pagination
   */
  static async getInterviews(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      candidateId?: string;
      search?: string;
    }
  ): Promise<{
    interviews: Interview[];
    page: number;
    limit: number;
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.candidateId && { candidateId: filters.candidateId }),
        ...(filters?.search && { search: filters.search }),
      });

      const { data } = await api.get(`interviews?${queryParams}`);
      return data;
    } catch (error) {
      console.error('Get interviews error:', error);
      throw error;
    }
  }

  /**
   * Get interview by ID
   */
  static async getInterview(id: string): Promise<Interview> {
    try {
      const { data } = await api.get(`interviews/${id}`);
      return data.data;
    } catch (error) {
      console.error('Get interview error:', error);
      throw error;
    }
  }

  /**
   * Create a new interview
   */
  static async createInterview(interviewData: Partial<Interview>): Promise<Interview> {
    try {
      const { data } = await api.post('interviews', interviewData);
      return data.data;
    } catch (error) {
      console.error('Create interview error:', error);
      throw error;
    }
  }

  /**
   * Update interview
   */
  static async updateInterview(id: string, updateData: Partial<Interview>): Promise<Interview> {
    try {
      const { data } = await api.patch(`interviews/${id}`, updateData);
      return data.data;
    } catch (error) {
      console.error('Update interview error:', error);
      throw error;
    }
  }

  /**
   * Delete an interview
   */
  static async deleteInterview(interviewId: string): Promise<{ message: string }> {
    try {
      const { data } = await api.delete(`interviews/${interviewId}`);
      return data;
    } catch (error) {
      console.error('Delete interview error:', error);
      throw error;
    }
  }

  /**
   * Join an interview
   */
  static async joinInterview(interviewId: string): Promise<{
    interview: Interview;
    token: string; // Twilio token for video
  }> {
    try {
      const { data } = await api.post(`interviews/${interviewId}/join`);
      return data.data;
    } catch (error) {
      console.error('Join interview error:', error);
      throw error;
    }
  }

  /**
   * Submit answer for a question
   */
  static async submitAnswer(
    interviewId: string,
    questionId: string,
    answerData: {
      answer: string;
      language?: string;
    }
  ): Promise<Submission> {
    try {
      const { data } = await api.post(
        `interviews/${interviewId}/questions/${questionId}/submit`,
        answerData
      );
      return data.data;
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  }

  /**
   * Get submission by ID
   */
  static async getSubmission(submissionId: string): Promise<Submission> {
    try {
      const { data } = await api.get(`submissions/${submissionId}`);
      return data.data;
    } catch (error) {
      console.error('Get submission error:', error);
      throw error;
    }
  }

  /**
   * Get all submissions for an interview
   */
  static async getInterviewSubmissions(interviewId: string): Promise<Submission[]> {
    try {
      const { data } = await api.get(`interviews/${interviewId}/submissions`);
      
      // Map backend response format to frontend format
      const submissions = data.data.map((submission: any) => ({
        ...submission,
        // Ensure both property names are available
        interviewQuestionId: submission.interviewQuestionId || submission.questionId,
        questionId: submission.questionId || submission.interviewQuestionId,
        answer: submission.answer || submission.content,
        content: submission.content || submission.answer
      }));
      
      return submissions;
    } catch (error) {
      console.error('Get interview submissions error:', error);
      throw error;
    }
  }

  /**
   * Get interview result
   */
  static async getInterviewResult(interviewId: string): Promise<InterviewResult> {
    try {
      const { data } = await api.get(`interviews/${interviewId}/result`);
      return data.data;
    } catch (error) {
      console.error('Get interview result error:', error);
      throw error;
    }
  }

  /**
   * Generate PDF report for an interview
   */
  static async generatePdfReport(interviewId: string): Promise<{ url: string }> {
    try {
      const { data } = await api.get(`interviews/${interviewId}/pdf`);
      return data.data;
    } catch (error) {
      console.error('Generate PDF report error:', error);
      throw error;
    }
  }

  /**
   * Generate and send an interview invitation to a candidate
   * @param interviewId Interview ID
   * @param candidateId Candidate ID
   * @returns Success status and access token information
   */
  static async sendInterviewInvitation(interviewId: string, candidateId: string): Promise<{
    success: boolean;
    message: string;
    accessToken: string;
    accessTokenExpires: string;
  }> {
    try {
      const { data } = await api.post(`candidate-access/${interviewId}/send-invitation`, {
        candidateId
      });
      return data.data;
    } catch (error) {
      console.error('Send interview invitation error:', error);
      throw error;
    }
  }

  /**
   * Add questions to an interview
   * @param interviewId Interview ID
   * @param questions Array of question objects with questionId, order, and customInstructions
   * @returns Updated interview object
   */
  static async addQuestionsToInterview(
    interviewId: string,
    questions: Array<{
      questionId: string;
      order?: number;
      customInstructions?: string;
    }>
  ): Promise<Interview> {
    try {
      const { data } = await api.post(`interviews/${interviewId}/questions`, {
        questions,
      });
      return data.data;
    } catch (error) {
      console.error('Add questions to interview error:', error);
      throw error;
    }
  }

  /**
   * Analyze a submission with AI
   * @param submissionId Submission ID to analyze
   * @returns Updated submission with AI analysis
   */
  static async analyzeSubmission(submissionId: string): Promise<Submission> {
    try {
      const { data } = await api.post(`submissions/${submissionId}/analyze`);
      return data.data;
    } catch (error) {
      console.error('Analyze submission error:', error);
      throw error;
    }
  }

  /**
   * Remove a question from an interview
   * @param interviewId Interview ID
   * @param questionId Question ID
   * @returns Success message
   */
  static async removeQuestionFromInterview(
    interviewId: string,
    questionId: string
  ): Promise<{ message: string }> {
    try {
      const { data } = await api.delete(`interviews/${interviewId}/questions/${questionId}`);
      return data;
    } catch (error) {
      console.error('Remove question from interview error:', error);
      throw error;
    }
  }

  /**
   * Detect plagiarism in a submission
   * @param submissionId Submission ID to check for plagiarism
   * @returns Plagiarism report with score and matches
   */
  static async detectPlagiarism(submissionId: string): Promise<{
    score: number;
    matches: {
      source: string;
      similarity: number;
      matchedText: string;
      sourceType: string;
      candidateId?: string;
      interviewId?: string;
    }[];
  }> {
    try {
      const { data } = await api.post(`plagiarism/detect/${submissionId}`);
      return data.data;
    } catch (error) {
      console.error('Detect plagiarism error:', error);
      throw error;
    }
  }

  /**
   * Get plagiarism report for a submission
   * @param submissionId Submission ID
   * @returns Plagiarism report with score and matches
   */
  static async getPlagiarismReport(submissionId: string): Promise<{
    score: number;
    matches: {
      source: string;
      similarity: number;
      matchedText: string;
      sourceType: string;
      candidateId?: string;
      interviewId?: string;
    }[];
  }> {
    try {
      const { data } = await api.get(`plagiarism/report/${submissionId}`);
      return data.data;
    } catch (error) {
      console.error('Get plagiarism report error:', error);
      throw error;
    }
  }
}

export default InterviewService;
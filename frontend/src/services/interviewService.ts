import { api } from "../lib/api";

// Types for interview-related data
export interface Interview {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  questions: Question[];
  candidateId?: string;
  interviewerId?: string;
  createdAt: string;
  updatedAt: string;
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
  questionId: string;
  candidateId: string;
  answer: string;
  language?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
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
    }[];
  };
  aiAnalysis?: {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
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
  id: string;
  interviewId: string;
  candidateId: string;
  overallScore: number;
  feedback: string;
  submissionIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Interview service using axios for API calls
export class InterviewService {
  /**
   * Get all interviews (paginated)
   */
  static async getInterviews(page = 1, limit = 10): Promise<{
    interviews: Interview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get('interviews', {
        params: { page, limit },
      });
      return data.data;
    } catch (error) {
      console.error('Get interviews error:', error);
      throw error;
    }
  }

  /**
   * Get interview by ID
   */
  static async getInterview(interviewId: string): Promise<Interview> {
    try {
      const { data } = await api.get(`interviews/${interviewId}`);
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
   * Update an interview
   */
  static async updateInterview(
    interviewId: string,
    interviewData: Partial<Interview>
  ): Promise<Interview> {
    try {
      const { data } = await api.put(`interviews/${interviewId}`, interviewData);
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
      return data.data;
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
      const { data } = await api.post(`interviews/${interviewId}/pdf`);
      return data.data;
    } catch (error) {
      console.error('Generate PDF report error:', error);
      throw error;
    }
  }
}

export default InterviewService;
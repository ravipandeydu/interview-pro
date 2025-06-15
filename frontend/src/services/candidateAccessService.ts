import api from '../lib/api';

const BASE_URL = '/candidate-access';

export interface InterviewResponse {
  id: string;
  responseText: string;
  interviewQuestionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: {
    id: string;
    text: string;
    category: string;
    difficulty: string;
  };
  order: number;
}

export interface CandidateInterview {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
  questions: InterviewQuestion[];
  candidateStartedAt?: string;
  candidateCompletedAt?: string;
}

const candidateAccessService = {
  /**
   * Get interview details using an access token
   * @param token The access token for the interview
   * @returns The interview details
   */
  getInterviewByToken: async (token: string): Promise<CandidateInterview> => {
    const response = await api.get(`${BASE_URL}/interview/${token}`);
    return response.data.data;
  },

  /**
   * Start an interview
   * @param token The access token for the interview
   * @returns Success status
   */
  startInterview: async (token: string) => {
    const response = await api.post(`${BASE_URL}/interview/${token}/start`);
    return response.data;
  },

  /**
   * Submit a response to an interview question
   * @param token The access token for the interview
   * @param interviewQuestionId The ID of the interview question
   * @param responseText The candidate's response text
   * @param language Optional programming language for coding questions
   * @returns The created/updated response
   */
  submitResponse: async (token: string, interviewQuestionId: string, responseText: string, language?: string): Promise<InterviewResponse> => {
    const response = await api.post(`${BASE_URL}/interview/${token}/questions/${interviewQuestionId}/response`, {
      content: responseText,
      language
    });
    return response.data.data;
  },

  /**
   * Complete an interview
   * @param token The access token for the interview
   * @returns Success status
   */
  completeInterview: async (token: string) => {
    const response = await api.post(`${BASE_URL}/interview/${token}/complete`);
    return response.data;
  },
};

export default candidateAccessService;
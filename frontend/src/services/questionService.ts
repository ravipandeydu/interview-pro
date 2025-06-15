import { api } from '@/lib/api';

// Types for question-related data
export interface Question {
  id: string;
  content: string;
  category: 'TECHNICAL' | 'BEHAVIORAL' | 'SITUATIONAL' | 'EXPERIENCE' | 'CULTURAL_FIT' | 'PROBLEM_SOLVING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  expectedAnswer?: string;
  tags: string[];
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface QuestionPagination {
  questions: Question[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Service for managing questions
 */
export class QuestionService {
  /**
   * Get all questions with filtering and pagination
   */
  static async getQuestions(
    page = 1,
    limit = 10,
    filters?: {
      category?: string;
      difficulty?: string;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<QuestionPagination> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
      });

      const { data } = await api.get(`questions?${queryParams}`);
      return data;
    } catch (error) {
      console.error('Get questions error:', error);
      throw error;
    }
  }

  /**
   * Get question by ID
   */
  static async getQuestion(id: string): Promise<Question> {
    try {
      const { data } = await api.get(`questions/${id}`);
      return data.data;
    } catch (error) {
      console.error('Get question error:', error);
      throw error;
    }
  }

  /**
   * Create a new question
   */
  static async createQuestion(questionData: Partial<Question>): Promise<Question> {
    try {
      const { data } = await api.post('questions', questionData);
      return data.data;
    } catch (error) {
      console.error('Create question error:', error);
      throw error;
    }
  }

  /**
   * Update a question
   */
  static async updateQuestion(params: { id: string; [key: string]: any }): Promise<Question> {
    try {
      const { id, ...questionData } = params;
      console.log(id, questionData, "iddds");
      const { data } = await api.patch(`questions/${id}`, questionData);
      return data.data;
    } catch (error) {
      console.error('Update question error:', error);
      throw error;
    }
  }

  /**
   * Delete a question
   */
  static async deleteQuestion(id: string): Promise<{ message: string }> {
    try {
      const { data } = await api.delete(`questions/${id}`);
      return data;
    } catch (error) {
      console.error('Delete question error:', error);
      throw error;
    }
  }
}

export default QuestionService;
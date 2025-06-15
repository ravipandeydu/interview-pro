import { api } from "../lib/api";

// Types for candidate-related data
export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  experienceYears?: number;
  currentPosition?: string;
  currentCompany?: string;
  educationLevel?: string;
  educationField?: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'INTERVIEW_SCHEDULED' | 'IN_PROCESS' | 'OFFER_SENT' | 'HIRED' | 'REJECTED' | 'ON_HOLD';
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CandidateFormData {
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  experienceYears?: number;
  currentPosition?: string;
  currentCompany?: string;
  educationLevel?: string;
  educationField?: string;
  notes?: string;
  status?: 'NEW' | 'CONTACTED' | 'INTERVIEW_SCHEDULED' | 'IN_PROCESS' | 'OFFER_SENT' | 'HIRED' | 'REJECTED' | 'ON_HOLD';
}

export interface CandidateResponse {
  status: string;
  message: string;
  data: Candidate | Candidate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Candidate service using axios for API calls
export class CandidateService {
  /**
   * Get all candidates (paginated)
   */
  static async getCandidates(page = 1, limit = 10, status?: string, search?: string): Promise<{
    candidates: Candidate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get<CandidateResponse>('candidates', {
        params: { page, limit, status, search },
      });
      return {
        candidates: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error('Get candidates error:', error);
      throw error;
    }
  }

  /**
   * Get candidate by ID
   */
  static async getCandidate(candidateId: string): Promise<Candidate> {
    try {
      const { data } = await api.get<CandidateResponse>(`candidates/${candidateId}`);
      return data.data as Candidate;
    } catch (error) {
      console.error('Get candidate error:', error);
      throw error;
    }
  }

  /**
   * Create a new candidate
   */
  static async createCandidate(candidateData: CandidateFormData): Promise<Candidate> {
    try {
      const { data } = await api.post<CandidateResponse>('candidates', candidateData);
      return data.data as Candidate;
    } catch (error) {
      console.error('Create candidate error:', error);
      throw error;
    }
  }

  /**
   * Update a candidate
   */
  static async updateCandidate(
    candidateId: string,
    candidateData: Partial<CandidateFormData>
  ): Promise<Candidate> {
    try {
      const { data } = await api.patch<CandidateResponse>(`candidates/${candidateId}`, candidateData);
      return data.data as Candidate;
    } catch (error) {
      console.error('Update candidate error:', error);
      throw error;
    }
  }

  /**
   * Delete a candidate
   */
  static async deleteCandidate(candidateId: string): Promise<{ message: string }> {
    try {
      const { data } = await api.delete(`candidates/${candidateId}`);
      return data;
    } catch (error) {
      console.error('Delete candidate error:', error);
      throw error;
    }
  }

  /**
   * Upload candidate resume
   */
  static async uploadResume(candidateId: string, file: File): Promise<{ resumeUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const { data } = await api.post<{ resumeUrl: string }>(
        `candidates/${candidateId}/resume`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error) {
      console.error('Upload resume error:', error);
      throw error;
    }
  }
}

export default CandidateService;
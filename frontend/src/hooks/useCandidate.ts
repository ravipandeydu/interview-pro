'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CandidateService, type Candidate, type CandidateFormData } from '../services/candidateService';

// Query keys for React Query
export const candidateKeys = {
  all: ['candidate'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; status?: string; search?: string }) =>
    [...candidateKeys.lists(), filters] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
};

/**
 * Custom hook for candidate operations using React Query
 */
export function useCandidate() {
  const queryClient = useQueryClient();

  /**
   * Get all candidates with pagination and filtering
   */
  const getCandidates = (page = 1, limit = 10, status?: string, search?: string) => {
    return useQuery({
      queryKey: candidateKeys.list({ page, limit, status, search }),
      queryFn: () => CandidateService.getCandidates(page, limit, status, search),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  /**
   * Get candidate by ID
   */
  const getCandidate = (candidateId: string) => {
    return useQuery({
      queryKey: candidateKeys.detail(candidateId),
      queryFn: () => CandidateService.getCandidate(candidateId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!candidateId,
    });
  };

  /**
   * Create candidate mutation
   */
  const createCandidate = () => {
    return useMutation({
      mutationFn: (candidateData: CandidateFormData) =>
        CandidateService.createCandidate(candidateData),
      onSuccess: () => {
        // Invalidate and refetch candidates list
        queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      },
    });
  };

  /**
   * Update candidate mutation
   */
  const updateCandidate = (candidateId: string) => {
    return useMutation({
      mutationFn: (candidateData: Partial<CandidateFormData>) =>
        CandidateService.updateCandidate(candidateId, candidateData),
      onSuccess: (updatedCandidate) => {
        // Update the candidate in the cache
        queryClient.setQueryData(candidateKeys.detail(candidateId), updatedCandidate);
        // Invalidate and refetch candidates list
        queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      },
    });
  };

  /**
   * Delete candidate mutation
   */
  const deleteCandidate = () => {
    return useMutation({
      mutationFn: (candidateId: string) => CandidateService.deleteCandidate(candidateId),
      onSuccess: (_data, candidateId) => {
        // Remove the candidate from the cache
        queryClient.removeQueries({ queryKey: candidateKeys.detail(candidateId) });
        // Invalidate and refetch candidates list
        queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      },
    });
  };

  /**
   * Upload resume mutation
   */
  const uploadResume = (candidateId: string) => {
    return useMutation({
      mutationFn: (file: File) => CandidateService.uploadResume(candidateId, file),
      onSuccess: () => {
        // Invalidate and refetch candidate details
        queryClient.invalidateQueries({ queryKey: candidateKeys.detail(candidateId) });
      },
    });
  };

  return {
    getCandidates,
    getCandidate,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    uploadResume,
  };
}
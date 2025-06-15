import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FeedbackService, FeedbackOptions, FeedbackResponse, InterviewFeedback } from '../services/feedbackService';
import { interviewKeys } from './useInterview';

// Query keys for React Query
export const feedbackKeys = {
  all: ['feedback'] as const,
  responses: () => [...feedbackKeys.all, 'responses'] as const,
  response: (responseId: string) => [...feedbackKeys.responses(), responseId] as const,
  interviews: () => [...feedbackKeys.all, 'interviews'] as const,
  interview: (interviewId: string) => [...feedbackKeys.interviews(), interviewId] as const,
};

/**
 * Hook for feedback operations
 */
export function useFeedbackOperations() {
  const queryClient = useQueryClient();

  // Generate feedback for a response mutation
  const generateResponseFeedbackMutation = useMutation({
    mutationFn: FeedbackService.generateFeedbackForResponse,
    onSuccess: (feedback, responseId) => {
      // Update the feedback in the cache
      queryClient.setQueryData(feedbackKeys.response(responseId), feedback);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error) => {
      console.error('Generate response feedback failed:', error);
    },
  });

  // Generate feedback for an interview mutation
  const generateInterviewFeedbackMutation = useMutation({
    mutationFn: FeedbackService.generateInterviewFeedback,
    onSuccess: (feedback, interviewId) => {
      // Update the feedback in the cache
      queryClient.setQueryData(feedbackKeys.interview(interviewId), feedback);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: interviewKeys.result(interviewId) });
    },
    onError: (error) => {
      console.error('Generate interview feedback failed:', error);
    },
  });

  // Generate custom feedback for a response mutation
  const generateCustomFeedbackMutation = useMutation({
    mutationFn: ({ responseId, options }: { responseId: string; options: FeedbackOptions }) =>
      FeedbackService.generateCustomFeedback(responseId, options),
    onError: (error) => {
      console.error('Generate custom feedback failed:', error);
    },
  });

  return {
    // Generate response feedback
    generateResponseFeedback: generateResponseFeedbackMutation.mutate,
    generateResponseFeedbackAsync: generateResponseFeedbackMutation.mutateAsync,
    isGeneratingResponseFeedback: generateResponseFeedbackMutation.isPending,
    generateResponseFeedbackError: generateResponseFeedbackMutation.error,

    // Generate interview feedback
    generateInterviewFeedback: generateInterviewFeedbackMutation.mutate,
    generateInterviewFeedbackAsync: generateInterviewFeedbackMutation.mutateAsync,
    isGeneratingInterviewFeedback: generateInterviewFeedbackMutation.isPending,
    generateInterviewFeedbackError: generateInterviewFeedbackMutation.error,

    // Generate custom feedback
    generateCustomFeedback: generateCustomFeedbackMutation.mutate,
    generateCustomFeedbackAsync: generateCustomFeedbackMutation.mutateAsync,
    isGeneratingCustomFeedback: generateCustomFeedbackMutation.isPending,
    generateCustomFeedbackError: generateCustomFeedbackMutation.error,
  };
}

/**
 * Hook for fetching response feedback
 */
export function useResponseFeedback(responseId: string) {
  return useQuery({
    queryKey: feedbackKeys.response(responseId),
    queryFn: () => FeedbackService.generateFeedbackForResponse(responseId),
    enabled: !!responseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching interview feedback
 */
export function useInterviewFeedback(interviewId: string) {
  return useQuery({
    queryKey: feedbackKeys.interview(interviewId),
    queryFn: () => FeedbackService.generateInterviewFeedback(interviewId),
    enabled: !!interviewId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export default useFeedbackOperations;
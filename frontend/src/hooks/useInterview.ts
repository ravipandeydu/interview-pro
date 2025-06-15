import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InterviewService, Interview, Submission, InterviewResult } from '../services/interviewService';

// Query keys for React Query
export const interviewKeys = {
  all: ['interview'] as const,
  lists: () => [...interviewKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...interviewKeys.lists(), { ...filters }] as const,
  details: () => [...interviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const,
  submissions: (interviewId: string) => [...interviewKeys.detail(interviewId), 'submissions'] as const,
  submission: (submissionId: string) => [...interviewKeys.all, 'submission', submissionId] as const,
  result: (interviewId: string) => [...interviewKeys.detail(interviewId), 'result'] as const,
  plagiarismReport: (submissionId: string) => [...interviewKeys.submission(submissionId), 'plagiarism'] as const,
};

/**
 * Hook for fetching interviews list
 */
export function useInterviews(page = 1, limit = 10, filters?: { status?: string; candidateId?: string; search?: string }) {
  return useQuery({
    queryKey: interviewKeys.list({ page, limit, ...filters }),
    queryFn: () => InterviewService.getInterviews(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching a single interview
 */
export function useInterview(interviewId: string) {
  return useQuery({
    queryKey: interviewKeys.detail(interviewId),
    queryFn: () => InterviewService.getInterview(interviewId),
    enabled: !!interviewId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for interview operations
 */
export function useInterviewOperations() {
  const queryClient = useQueryClient();

  // Create interview mutation
  const createInterviewMutation = useMutation({
    mutationFn: InterviewService.createInterview,
    onSuccess: (newInterview) => {
      // Invalidate interviews list
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
      // Add the new interview to the cache
      queryClient.setQueryData(interviewKeys.detail(newInterview.id), newInterview);
    },
    onError: (error) => {
      console.error('Create interview failed:', error);
    },
  });

  // Update interview mutation
  const updateInterviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Interview> }) =>
      InterviewService.updateInterview(id, data),
    onSuccess: (updatedInterview) => {
      // Update the interview in the cache
      queryClient.setQueryData(interviewKeys.detail(updatedInterview.id), updatedInterview);
      // Invalidate interviews list
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
    onError: (error) => {
      console.error('Update interview failed:', error);
    },
  });

  // Delete interview mutation
  const deleteInterviewMutation = useMutation({
    mutationFn: InterviewService.deleteInterview,
    onSuccess: (_, interviewId) => {
      // Remove the interview from the cache
      queryClient.removeQueries({ queryKey: interviewKeys.detail(interviewId) });
      // Invalidate interviews list
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
    onError: (error) => {
      console.error('Delete interview failed:', error);
    },
  });

  // Join interview mutation
  const joinInterviewMutation = useMutation({
    mutationFn: InterviewService.joinInterview,
    onSuccess: (data, interviewId) => {
      // Update the interview in the cache
      queryClient.setQueryData(interviewKeys.detail(interviewId), data.interview);
    },
    onError: (error) => {
      console.error('Join interview failed:', error);
    },
  });

  // Add questions to interview mutation
  const addQuestionsToInterviewMutation = useMutation({
    mutationFn: ({ interviewId, questions }: { 
      interviewId: string; 
      questions: Array<{
        questionId: string;
        order?: number;
        customInstructions?: string;
      }>;
    }) => InterviewService.addQuestionsToInterview(interviewId, questions),
    onSuccess: (updatedInterview) => {
      // Update the interview in the cache
      queryClient.setQueryData(interviewKeys.detail(updatedInterview.id), updatedInterview);
    },
    onError: (error) => {
      console.error('Add questions to interview failed:', error);
    },
  });

  // Remove question from interview mutation
  const removeQuestionFromInterviewMutation = useMutation({
    mutationFn: ({ interviewId, questionId }: { interviewId: string; questionId: string }) =>
      InterviewService.removeQuestionFromInterview(interviewId, questionId),
    onSuccess: (_, { interviewId }) => {
      // Invalidate the interview to refetch with updated questions
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(interviewId) });
    },
    onError: (error) => {
      console.error('Remove question from interview failed:', error);
    },
  });

  return {
    // Create interview
    createInterview: createInterviewMutation.mutate,
    createInterviewAsync: createInterviewMutation.mutateAsync,
    isCreatingInterview: createInterviewMutation.isPending,
    createInterviewError: createInterviewMutation.error,

    // Update interview
    updateInterview: updateInterviewMutation.mutate,
    updateInterviewAsync: updateInterviewMutation.mutateAsync,
    isUpdatingInterview: updateInterviewMutation.isPending,
    updateInterviewError: updateInterviewMutation.error,

    // Delete interview
    deleteInterview: deleteInterviewMutation.mutate,
    deleteInterviewAsync: deleteInterviewMutation.mutateAsync,
    isDeletingInterview: deleteInterviewMutation.isPending,
    deleteInterviewError: deleteInterviewMutation.error,

    // Join interview
    joinInterview: joinInterviewMutation.mutate,
    joinInterviewAsync: joinInterviewMutation.mutateAsync,
    isJoiningInterview: joinInterviewMutation.isPending,
    joinInterviewError: joinInterviewMutation.error,

    // Add questions to interview
    addQuestionsToInterview: addQuestionsToInterviewMutation.mutate,
    addQuestionsToInterviewAsync: addQuestionsToInterviewMutation.mutateAsync,
    isAddingQuestionsToInterview: addQuestionsToInterviewMutation.isPending,
    addQuestionsToInterviewError: addQuestionsToInterviewMutation.error,

    // Remove question from interview
    removeQuestionFromInterview: removeQuestionFromInterviewMutation.mutate,
    removeQuestionFromInterviewAsync: removeQuestionFromInterviewMutation.mutateAsync,
    isRemovingQuestionFromInterview: removeQuestionFromInterviewMutation.isPending,
    removeQuestionFromInterviewError: removeQuestionFromInterviewMutation.error,
  };
}

/**
 * Hook for submission operations
 */
export function useSubmissionOperations() {
  const queryClient = useQueryClient();

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: ({
      interviewId,
      questionId,
      answerData,
    }: {
      interviewId: string;
      questionId: string;
      answerData: { answer: string; language?: string };
    }) => InterviewService.submitAnswer(interviewId, questionId, answerData),
    onSuccess: (submission, { interviewId }) => {
      // Invalidate submissions for this interview
      queryClient.invalidateQueries({ queryKey: interviewKeys.submissions(interviewId) });
      // Add the new submission to the cache
      queryClient.setQueryData(interviewKeys.submission(submission.id), submission);
    },
    onError: (error) => {
      console.error('Submit answer failed:', error);
    },
  });

  // Generate PDF report mutation
  const generatePdfReportMutation = useMutation({
    mutationFn: InterviewService.generatePdfReport,
    onError: (error) => {
      console.error('Generate PDF report failed:', error);
    },
  });

  // Analyze submission mutation
  const analyzeSubmissionMutation = useMutation({
    mutationFn: InterviewService.analyzeSubmission,
    onSuccess: (submission) => {
      // Update the submission in the cache
      queryClient.setQueryData(interviewKeys.submission(submission.id), submission);
      // Invalidate submissions for this interview
      queryClient.invalidateQueries({ queryKey: interviewKeys.submissions(submission.interviewId) });
    },
    onError: (error) => {
      console.error('Analyze submission failed:', error);
    },
  });

  // Detect plagiarism mutation
  const detectPlagiarismMutation = useMutation({
    mutationFn: InterviewService.detectPlagiarism,
    onSuccess: (plagiarismReport, submissionId) => {
      // Update the plagiarism report in the cache
      queryClient.setQueryData(interviewKeys.plagiarismReport(submissionId), plagiarismReport);
      // Invalidate the submission to refetch with updated plagiarism report
      queryClient.invalidateQueries({ queryKey: interviewKeys.submission(submissionId) });
    },
    onError: (error) => {
      console.error('Detect plagiarism failed:', error);
    },
  });

  return {
    // Submit answer
    submitAnswer: submitAnswerMutation.mutate,
    submitAnswerAsync: submitAnswerMutation.mutateAsync,
    isSubmittingAnswer: submitAnswerMutation.isPending,
    submitAnswerError: submitAnswerMutation.error,

    // Generate PDF report
    generatePdfReport: generatePdfReportMutation.mutate,
    generatePdfReportAsync: generatePdfReportMutation.mutateAsync,
    isGeneratingPdfReport: generatePdfReportMutation.isPending,
    generatePdfReportError: generatePdfReportMutation.error,

    // Analyze submission
    analyzeSubmission: analyzeSubmissionMutation.mutate,
    analyzeSubmissionAsync: analyzeSubmissionMutation.mutateAsync,
    isAnalyzingSubmission: analyzeSubmissionMutation.isPending,
    analyzeSubmissionError: analyzeSubmissionMutation.error,

    // Detect plagiarism
    detectPlagiarism: detectPlagiarismMutation.mutate,
    detectPlagiarismAsync: detectPlagiarismMutation.mutateAsync,
    isDetectingPlagiarism: detectPlagiarismMutation.isPending,
    detectPlagiarismError: detectPlagiarismMutation.error,
  };
}

/**
 * Hook for fetching interview submissions
 */
export function useInterviewSubmissions(interviewId: string) {
  return useQuery({
    queryKey: interviewKeys.submissions(interviewId),
    queryFn: () => InterviewService.getInterviewSubmissions(interviewId),
    enabled: !!interviewId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching a single submission
 */
export function useSubmission(submissionId: string) {
  return useQuery({
    queryKey: interviewKeys.submission(submissionId),
    queryFn: () => InterviewService.getSubmission(submissionId),
    enabled: !!submissionId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching interview result
 */
export function useInterviewResult(interviewId: string) {
  return useQuery({
    queryKey: interviewKeys.result(interviewId),
    queryFn: () => InterviewService.getInterviewResult(interviewId),
    enabled: !!interviewId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching plagiarism report for a submission
 */
export function usePlagiarismReport(submissionId: string) {
  return useQuery({
    queryKey: interviewKeys.plagiarismReport(submissionId),
    queryFn: () => InterviewService.getPlagiarismReport(submissionId),
    enabled: !!submissionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export default useInterviewOperations;
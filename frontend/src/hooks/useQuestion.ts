import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionService } from '@/services/questionService';

interface QuestionFilters {
  search?: string;
  type?: string;
  difficulty?: string;
  category?: string;
}

interface QuestionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  difficulty?: string;
  category?: string;
}

export const useQuestions = (params: QuestionQueryParams = {}) => {
  const { page = 1, limit = 10, ...filters } = params;
  
  return useQuery({
    queryKey: ['questions', page, limit, filters],
    queryFn: () => QuestionService.getQuestions(page, limit, filters),
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => QuestionService.getQuestion(id),
    enabled: !!id,
  });
};

export const useQuestionOperations = () => {
  const queryClient = useQueryClient();
  
  const createQuestion = useMutation({
    mutationFn: QuestionService.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
  
  const updateQuestion = useMutation({
    mutationFn: QuestionService.updateQuestion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', data.id] });
    },
  });
  
  const deleteQuestion = useMutation({
    mutationFn: QuestionService.deleteQuestion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', variables] });
    },
  });
  
  return {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    isCreating: createQuestion.isPending,
    isUpdating: updateQuestion.isPending,
    isDeleting: deleteQuestion.isPending,
  };
};
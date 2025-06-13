'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '../services/chatService';
import { useChat as useChatStore } from '../store/useStore';
import type { ChatMessageFormData } from '../lib/zod-schemas';

// Query keys for React Query
export const chatKeys = {
  all: ['chat'] as const,
  history: (page?: number) => [...chatKeys.all, 'history', page] as const,
  analytics: (period?: string) => [...chatKeys.all, 'analytics', period] as const,
};

/**
 * Custom hook for chat operations using React Query + Zustand
 */
export function useChat() {
  const queryClient = useQueryClient();
  const { messages, isTyping, addMessage, setTyping, clearMessages } = useChatStore();
  const [streamingMessage, setStreamingMessage] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);

  // Chat history query
  const historyQuery = useQuery({
    queryKey: chatKeys.history(1),
    queryFn: () => ChatService.getChatHistory(1, 50),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ChatService.chatWithDatabase,
    onMutate: () => {
      setTyping(true);
    },
    onSuccess: (response) => {
      addMessage(response);
      setTyping(false);
      // Invalidate history to include new message
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
    },
    onError: (error) => {
      setTyping(false);
      console.error('Send message failed:', error);
    },
  });

  // Streaming chat function
  const sendStreamingMessage = React.useCallback(async (question: string) => {
    try {
      setIsStreaming(true);
      setStreamingMessage('');
      setTyping(true);

      let fullResponse = '';
      
      await ChatService.streamChat(question, (chunk) => {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      });

      // Create final message object
      const finalMessage = {
        id: Date.now().toString(),
        question,
        answer: fullResponse,
        timestamp: new Date().toISOString(),
      };

      addMessage(finalMessage);
      setStreamingMessage('');
      setIsStreaming(false);
      setTyping(false);
      
      // Invalidate history
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
    } catch (error) {
      console.error('Streaming chat failed:', error);
      setIsStreaming(false);
      setTyping(false);
      setStreamingMessage('');
    }
  }, [addMessage, setTyping, queryClient]);

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: ChatService.deleteChatMessage,
    onSuccess: (_, messageId) => {
      // Remove message from local store
      // Note: You might want to add a removeMessage function to your store
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
    },
    onError: (error) => {
      console.error('Delete message failed:', error);
    },
  });

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: ChatService.clearChatHistory,
    onSuccess: () => {
      clearMessages();
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
    },
    onError: (error) => {
      console.error('Clear history failed:', error);
    },
  });

  // Rate message mutation
  const rateMessageMutation = useMutation({
    mutationFn: ({ messageId, rating, feedback }: { 
      messageId: string; 
      rating: 1 | 2 | 3 | 4 | 5; 
      feedback?: string; 
    }) => ChatService.rateChatResponse(messageId, rating, feedback),
    onError: (error) => {
      console.error('Rate message failed:', error);
    },
  });

  // Export chat data mutation
  const exportDataMutation = useMutation({
    mutationFn: ChatService.exportChatData,
    onSuccess: (blob, format) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error('Export data failed:', error);
    },
  });

  // Initialize messages from history on mount
  React.useEffect(() => {
    if (historyQuery.data?.messages && messages.length === 0) {
      // You might want to add a setMessages function to your store
      // For now, we'll add them one by one
      historyQuery.data.messages.forEach(addMessage);
    }
  }, [historyQuery.data, messages.length, addMessage]);

  return {
    // State
    messages,
    isTyping,
    streamingMessage,
    isStreaming,
    
    // History query
    chatHistory: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
    historyError: historyQuery.error,
    refetchHistory: historyQuery.refetch,

    // Send message (regular)
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessageError: sendMessageMutation.error,

    // Send message (streaming)
    sendStreamingMessage,

    // Delete message
    deleteMessage: deleteMessageMutation.mutate,
    deleteMessageAsync: deleteMessageMutation.mutateAsync,
    isDeletingMessage: deleteMessageMutation.isPending,
    deleteMessageError: deleteMessageMutation.error,

    // Clear history
    clearHistory: clearHistoryMutation.mutate,
    clearHistoryAsync: clearHistoryMutation.mutateAsync,
    isClearingHistory: clearHistoryMutation.isPending,
    clearHistoryError: clearHistoryMutation.error,

    // Rate message
    rateMessage: rateMessageMutation.mutate,
    rateMessageAsync: rateMessageMutation.mutateAsync,
    isRatingMessage: rateMessageMutation.isPending,
    rateMessageError: rateMessageMutation.error,

    // Export data
    exportData: exportDataMutation.mutate,
    exportDataAsync: exportDataMutation.mutateAsync,
    isExportingData: exportDataMutation.isPending,
    exportDataError: exportDataMutation.error,

    // Local actions
    clearLocalMessages: clearMessages,
  };
}

/**
 * Hook for chat analytics
 */
export function useChatAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: chatKeys.analytics(period),
    queryFn: () => ChatService.getChatAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for getting summaries
 */
export function useSummaries() {
  const queryClient = useQueryClient();

  // Get daily summary
  const dailySummaryQuery = useQuery({
    queryKey: ['summaries', 'daily'],
    queryFn: () => ChatService.getSummary('daily'),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Get all summaries
  const allSummariesQuery = useQuery({
    queryKey: ['summaries', 'all'],
    queryFn: () => ChatService.getAllSummaries(1, 20),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Generate custom summary mutation
  const generateCustomSummaryMutation = useMutation({
    mutationFn: ChatService.generateCustomSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
    onError: (error) => {
      console.error('Generate custom summary failed:', error);
    },
  });

  // Delete summary mutation
  const deleteSummaryMutation = useMutation({
    mutationFn: ChatService.deleteSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
    onError: (error) => {
      console.error('Delete summary failed:', error);
    },
  });

  return {
    // Daily summary
    dailySummary: dailySummaryQuery.data,
    isLoadingDailySummary: dailySummaryQuery.isLoading,
    dailySummaryError: dailySummaryQuery.error,

    // All summaries
    allSummaries: allSummariesQuery.data,
    isLoadingAllSummaries: allSummariesQuery.isLoading,
    allSummariesError: allSummariesQuery.error,

    // Generate custom summary
    generateCustomSummary: generateCustomSummaryMutation.mutate,
    generateCustomSummaryAsync: generateCustomSummaryMutation.mutateAsync,
    isGeneratingCustomSummary: generateCustomSummaryMutation.isPending,
    generateCustomSummaryError: generateCustomSummaryMutation.error,

    // Delete summary
    deleteSummary: deleteSummaryMutation.mutate,
    deleteSummaryAsync: deleteSummaryMutation.mutateAsync,
    isDeletingSummary: deleteSummaryMutation.isPending,
    deleteSummaryError: deleteSummaryMutation.error,

    // Refetch functions
    refetchDailySummary: dailySummaryQuery.refetch,
    refetchAllSummaries: allSummariesQuery.refetch,
  };
}

export default useChat;
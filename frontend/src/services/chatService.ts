import { api } from "../lib/api";
import type { ChatResponse, Summary } from "../lib/zod-schemas";

// Chat service using axios for server-side calls
export class ChatService {
  /**
   * Send a question to the AI chat system
   */
  static async chatWithDatabase(question: string): Promise<ChatResponse> {
    try {
      const { data } = await api.post<ChatResponse>("ai/chat", {
        question,
      });
      return data;
    } catch (error) {
      console.error("Chat with database error:", error);
      throw error;
    }
  }

  /**
   * Stream chat response (for real-time streaming)
   */
  static async streamChat(
    question: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await api.post(
        "chat/stream",
        { question },
        {
          responseType: "stream",
          headers: {
            Accept: "text/event-stream",
          },
        }
      );

      // Handle streaming response
      const reader = response.data.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream chat error:", error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  static async getChatHistory(
    page = 1,
    limit = 20
  ): Promise<{
    messages: ChatResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get("chat/history", {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      console.error("Get chat history error:", error);
      throw error;
    }
  }

  /**
   * Delete chat message
   */
  static async deleteChatMessage(
    messageId: string
  ): Promise<{ message: string }> {
    try {
      const { data } = await api.delete<{ message: string }>(
        `chat/${messageId}`
      );
      return data;
    } catch (error) {
      console.error("Delete chat message error:", error);
      throw error;
    }
  }

  /**
   * Clear all chat history
   */
  static async clearChatHistory(): Promise<{ message: string }> {
    try {
      const { data } = await api.delete<{ message: string }>(
        "chat/history"
      );
      return data;
    } catch (error) {
      console.error("Clear chat history error:", error);
      throw error;
    }
  }

  /**
   * Get AI-generated summary
   */
  static async getSummary(
    type: "daily" | "weekly" | "monthly" = "daily"
  ): Promise<Summary> {
    try {
      const { data } = await api.get<Summary>("summary", {
        params: { type },
      });
      return data;
    } catch (error) {
      console.error("Get summary error:", error);
      throw error;
    }
  }

  /**
   * Generate custom summary
   */
  static async generateCustomSummary(params: {
    startDate: string;
    endDate: string;
    topics?: string[];
    format?: "brief" | "detailed" | "bullet-points";
  }): Promise<Summary> {
    try {
      const { data } = await api.post<Summary>("summary/custom", params);
      return data;
    } catch (error) {
      console.error("Generate custom summary error:", error);
      throw error;
    }
  }

  /**
   * Get all summaries
   */
  static async getAllSummaries(
    page = 1,
    limit = 20
  ): Promise<{
    summaries: Summary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get("summary/all", {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      console.error("Get all summaries error:", error);
      throw error;
    }
  }

  /**
   * Delete summary
   */
  static async deleteSummary(summaryId: string): Promise<{ message: string }> {
    try {
      const { data } = await api.delete<{ message: string }>(
        `summary/${summaryId}`
      );
      return data;
    } catch (error) {
      console.error("Delete summary error:", error);
      throw error;
    }
  }

  /**
   * Export chat data
   */
  static async exportChatData(
    format: "json" | "csv" | "pdf" = "json"
  ): Promise<Blob> {
    try {
      const { data } = await api.get("chat/export", {
        params: { format },
        responseType: "blob",
      });
      return data;
    } catch (error) {
      console.error("Export chat data error:", error);
      throw error;
    }
  }

  /**
   * Get chat analytics
   */
  static async getChatAnalytics(
    period: "week" | "month" | "year" = "month"
  ): Promise<{
    totalMessages: number;
    averageResponseTime: number;
    topTopics: Array<{ topic: string; count: number }>;
    dailyActivity: Array<{ date: string; count: number }>;
    sentimentAnalysis: {
      positive: number;
      neutral: number;
      negative: number;
    };
  }> {
    try {
      const { data } = await api.get("chat/analytics", {
        params: { period },
      });
      return data;
    } catch (error) {
      console.error("Get chat analytics error:", error);
      throw error;
    }
  }

  /**
   * Rate chat response
   */
  static async rateChatResponse(
    messageId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    feedback?: string
  ): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>(
        `chat/${messageId}/rate`,
        {
          rating,
          feedback,
        }
      );
      return data;
    } catch (error) {
      console.error("Rate chat response error:", error);
      throw error;
    }
  }
}

export default ChatService;

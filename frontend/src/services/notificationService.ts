/**
 * Notification Service
 *
 * Provides API methods for managing notifications
 * Works alongside Socket.IO for real-time notifications
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { api } from '../lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read: boolean;
  link?: string;
  userId?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
  };
  message: string;
}

export interface NotificationCountResponse {
  success: boolean;
  data: {
    count: number;
  };
  message: string;
}

export class NotificationService {
  /**
   * Get all notifications for the current user
   */
  static async getNotifications(): Promise<NotificationResponse> {
    try {
      const { data } = await api.get<NotificationResponse>('/api/v1/notifications');
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for the current user
   */
  static async getUnreadCount(): Promise<NotificationCountResponse> {
    try {
      const { data } = await api.get<NotificationCountResponse>('/api/v1/notifications/unread/count');
      return data;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await api.patch<{ success: boolean; message: string }>(
        `/api/v1/notifications/${notificationId}/read`
      );
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await api.patch<{ success: boolean; message: string }>(
        '/api/v1/notifications/read-all'
      );
      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await api.delete<{ success: boolean; message: string }>(
        `/api/v1/notifications/${notificationId}`
      );
      return data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  static async deleteAllNotifications(): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await api.delete<{ success: boolean; message: string }>(
        '/api/v1/notifications'
      );
      return data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
}
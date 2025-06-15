/**
 * Notification Context
 *
 * Provides a centralized way to manage notifications across the application
 * Integrates with Socket.IO for real-time notifications and API for persistence
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
// import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { NotificationService, Notification } from '../services/notificationService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  refetchNotifications: () => void;
  getFilteredNotifications: (filter: 'all' | 'unread' | 'read') => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Query keys for React Query
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Create a ref to store the markAsRead function
  const markAsReadRef = React.useRef<(id: string) => void>(() => {});
  
  // Define handleNewNotification with useCallback to prevent recreation on each render
  const handleNewNotification = useCallback((notification: Notification) => {
    // Add to notifications list
    setNotifications((prev) => [notification, ...prev]);

    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

    // Show toast notification with action buttons
    toast(notification.title, {
      description: notification.message,
      duration: 8000,
      action: notification.link ? {
        label: "View",
        onClick: () => {
          // Use the ref to access the current markAsRead function
          markAsReadRef.current(notification.id);
          window.location.href = notification.link as string;
        },
      } : undefined,
      onDismiss: () => {
        // Optionally mark as read when dismissed
        // markAsReadRef.current(notification.id);
      },
    });
  }, [queryClient]);
  
  // Initialize the markAsReadRef with a no-op function
  useEffect(() => {
    // This ensures the ref has a valid function before any events are processed
    markAsReadRef.current = (id: string) => {
      console.log('markAsRead not yet initialized, will mark notification as read later:', id);
    };
  }, []);
  
  // Use a ref for events object to maintain stable reference
  const socketEvents = useMemo(() => ({
    'notification:new': handleNewNotification,
  }), [handleNewNotification]);
  
  // Socket connection with event handlers
  // We pass the memoized socketEvents object to ensure stable reference
  // const { isConnected } = useSocket(useMemo(() => ({
  //   autoConnect: true,
  //   events: socketEvents,
  // }), [socketEvents]));

  // Query for fetching notifications
  const { 
    data: notificationsData, 
    isLoading, 
    isError, 
    error,
    refetch: refetchNotifications 
  } = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: NotificationService.getNotifications,
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    select: (data) => data.data.notifications,
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Query for unread count
  const { 
    data: unreadCountData,
    refetch: refetchUnreadCount 
  } = useQuery({
    queryKey: notificationKeys.count(),
    queryFn: NotificationService.getUnreadCount,
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    select: (data) => data.data.count,
    retry: 2,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  // Update notifications when data changes
  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  // handleNewNotification is now defined above with useCallback

  // Mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: NotificationService.markAsRead,
    onMutate: async (notificationId) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );

      // Return context for potential rollback
      return { previousNotifications: [...notifications] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        setNotifications(context.previousNotifications);
      }
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onMutate: async () => {
      // Optimistic update
      const previousNotifications = [...notifications];
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      return { previousNotifications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications marked as read');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        setNotifications(context.previousNotifications);
      }
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    },
  });

  // Delete a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: NotificationService.deleteNotification,
    onMutate: async (notificationId) => {
      // Optimistic update
      const previousNotifications = [...notifications];
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      return { previousNotifications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        setNotifications(context.previousNotifications);
      }
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    },
  });

  // Delete all notifications
  const clearNotificationsMutation = useMutation({
    mutationFn: NotificationService.deleteAllNotifications,
    onMutate: async () => {
      // Optimistic update
      const previousNotifications = [...notifications];
      setNotifications([]);
      return { previousNotifications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications cleared');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        setNotifications(context.previousNotifications);
      }
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    },
  });

  const markAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);
  
  // Update the ref with the current markAsRead function
  // This needs to run after markAsRead is defined but before any events might use it
  useEffect(() => {
    markAsReadRef.current = markAsRead;
    // This effect should only run when markAsRead changes
    // Not on every render
  }, [markAsRead]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback((id: string) => {
    deleteNotificationMutation.mutate(id);
  }, [deleteNotificationMutation]);

  const clearNotifications = useCallback(() => {
    clearNotificationsMutation.mutate();
  }, [clearNotificationsMutation]);

  // Function to get filtered notifications
  const getFilteredNotifications = useCallback((filter: 'all' | 'unread' | 'read') => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notification => !notification.read);
      case 'read':
        return notifications.filter(notification => notification.read);
      case 'all':
      default:
        return notifications;
    }
  }, [notifications]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    notifications,
    unreadCount: unreadCountData || 0,
    isLoading,
    isError,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    refetchNotifications,
    getFilteredNotifications,
  }), [
    notifications, 
    unreadCountData, 
    isLoading, 
    isError, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearNotifications,
    refetchNotifications,
    getFilteredNotifications
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
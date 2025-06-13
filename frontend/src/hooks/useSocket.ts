/**
 * Socket Hook
 *
 * React hook for using the Socket.IO client service in components
 * Provides methods for connecting, disconnecting, and handling socket events
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface ConnectionStatus {
  connected: boolean;
  lastConnected: Date | null;
  reconnectAttempts: number;
  error: Error | null;
}

interface UseSocketOptions {
  autoConnect?: boolean;
  events?: Record<string, (data: any) => void>;
  onConnectionChange?: (status: ConnectionStatus) => void;
  showToasts?: boolean;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { 
    autoConnect = true, 
    events = {}, 
    onConnectionChange,
    showToasts = true 
  } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastConnected: null,
    reconnectAttempts: 0,
    error: null
  });
  
  const { isAuthenticated } = useAuth();
  const eventsRef = useRef(events);
  
  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Connection status listener
  const handleConnectionStatusChange = useCallback((status: ConnectionStatus) => {
    setIsConnected(status.connected);
    setConnectionStatus(status);
    
    // Call external handler if provided
    if (onConnectionChange) {
      onConnectionChange(status);
    }
    
    // Show connection status toasts
    if (showToasts) {
      if (status.connected && status.reconnectAttempts > 0) {
        toast.success('Reconnected to server');
      } else if (!status.connected && status.error && status.lastConnected) {
        // Only show disconnection toast if we were previously connected
        toast.error('Disconnected from server', {
          description: status.error.message,
          action: {
            label: 'Reconnect',
            onClick: () => connect(),
          },
        });
      }
    }
  }, [onConnectionChange, showToasts]);

  /**
   * Connect to the socket server
   */
  const connect = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn('Cannot connect socket: User not authenticated');
      return false;
    }

    setIsConnecting(true);
    const connected = await socketService.connect();
    setIsConnecting(false);
    return connected;
  }, [isAuthenticated]);

  /**
   * Disconnect from the socket server
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  /**
   * Manually trigger a reconnection
   */
  const reconnect = useCallback(async () => {
    setIsConnecting(true);
    const result = await socketService.reconnect();
    setIsConnecting(false);
    return result;
  }, []);

  /**
   * Register an event listener
   */
  const on = useCallback((event: string, callback: (data: any) => void) => {
    socketService.on(event, callback);
  }, []);

  /**
   * Remove an event listener
   */
  const off = useCallback((event: string, callback?: (data: any) => void) => {
    socketService.off(event, callback);
  }, []);

  /**
   * Emit an event to the server
   */
  const emit = useCallback((event: string, data: any): boolean => {
    const result = socketService.emit(event, data);
    if (!result && showToasts) {
      toast.error('Failed to send message', {
        description: 'Please check your connection',
        action: {
          label: 'Reconnect',
          onClick: () => reconnect(),
        },
      });
    }
    return result;
  }, [reconnect, showToasts]);

  /**
   * Join a room
   */
  const joinRoom = useCallback((roomId: string): boolean => {
    return socketService.joinRoom(roomId);
  }, []);

  /**
   * Leave a room
   */
  const leaveRoom = useCallback((roomId: string): boolean => {
    return socketService.leaveRoom(roomId);
  }, []);

  /**
   * Join an interview room
   */
  const joinInterview = useCallback((interviewId: string): boolean => {
    return socketService.joinInterview(interviewId);
  }, []);

  /**
   * Leave an interview room
   */
  const leaveInterview = useCallback((interviewId: string): boolean => {
    return socketService.leaveInterview(interviewId);
  }, []);

  /**
   * Send code update during interview
   */
  const sendCodeUpdate = useCallback(
    (interviewId: string, code: string, language: string): boolean => {
      return socketService.sendCodeUpdate(interviewId, code, language);
    },
    []
  );

  /**
   * Send chat message
   */
  const sendChatMessage = useCallback(
    (interviewId: string, message: string): boolean => {
      return socketService.sendChatMessage(interviewId, message);
    },
    []
  );

  /**
   * Update candidate status
   */
  const updateCandidateStatus = useCallback(
    (candidateId: string, status: string): boolean => {
      return socketService.updateCandidateStatus(candidateId, status);
    },
    []
  );

  // Register connection status listener
  useEffect(() => {
    socketService.onConnectionStatusChange(handleConnectionStatusChange);
    
    return () => {
      socketService.offConnectionStatusChange(handleConnectionStatusChange);
    };
  }, [handleConnectionStatusChange]);

  // Auto-connect when authenticated
  useEffect(() => {
    if (autoConnect && isAuthenticated && !isConnected && !isConnecting) {
      connect();
    }
    
    return () => {
      // Clean up on unmount
      if (isConnected) {
        disconnect();
      }
    };
  }, [autoConnect, isAuthenticated, isConnected, isConnecting, connect, disconnect]);

  // Register event listeners from options
  useEffect(() => {
    // Register all event listeners
    Object.entries(eventsRef.current).forEach(([event, callback]) => {
      socketService.on(event, callback);
    });

    // Clean up event listeners on unmount
    return () => {
      Object.entries(eventsRef.current).forEach(([event, callback]) => {
        socketService.off(event, callback);
      });
    };
  }, [eventsRef]); // Depend on eventsRef to update when it changes

  return {
    isConnected,
    isConnecting,
    connectionStatus,
    connect,
    disconnect,
    reconnect,
    on,
    off,
    emit,
    joinRoom,
    leaveRoom,
    joinInterview,
    leaveInterview,
    sendCodeUpdate,
    sendChatMessage,
    updateCandidateStatus,
  };
};
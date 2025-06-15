/**
 * Socket.IO Client Service
 *
 * This service manages the Socket.IO client connection to the backend
 * for real-time features like notifications, chat, and interview collaboration.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { tokenManager } from '../lib/api';

type EventCallback = (data: any) => void;

interface ConnectionStatus {
  connected: boolean;
  lastConnected: Date | null;
  reconnectAttempts: number;
  error: Error | null;
}

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private connectionStatus: ConnectionStatus = {
    connected: false,
    lastConnected: null,
    reconnectAttempts: 0,
    error: null
  };
  private connectionStatusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  /**
   * Initialize the Socket.IO connection
   * @returns {Promise<boolean>} Connection success status
   */
  async connect(): Promise<boolean> {
    try {
      if (this.socket && this.connected) {
        console.log('Socket already connected');
        return true;
      }

      // Get the JWT token using tokenManager
      const token = tokenManager.getToken();
      console.log('[SocketService] Token retrieval attempt:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        const error = new Error('No authentication token found');
        console.error('[SocketService] Authentication error:', error);
        toast.error('Authentication error: Please log in again');
        this.updateConnectionStatus({
          connected: false,
          error
        });
        return false;
      }

      // Determine the backend URL
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log(`[SocketService] Connecting to socket server at ${backendUrl}...`);

      // Initialize Socket.IO connection with auth token
      this.socket = io(backendUrl + '/', { // Explicitly use the default namespace
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000, // Connection timeout in ms
        transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
      });

      // Set up event listeners
      this.setupEventListeners();

      // Wait for connection
      return new Promise((resolve) => {
        if (!this.socket) {
          resolve(false);
          return;
        }

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          console.error('Socket connection timeout');
          this.updateConnectionStatus({
            connected: false,
            error: new Error('Connection timeout')
          });
          resolve(false);
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          console.log('Socket connected successfully');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.updateConnectionStatus({
            connected: true,
            lastConnected: new Date(),
            reconnectAttempts: 0,
            error: null
          });
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(connectionTimeout);
          console.error('Socket connection error:', error);
          console.error(`[SocketService] Error name: ${error.name}, message: ${error.message}`);
          console.error(`[SocketService] Error details:`, error.data);
          this.connected = false;
          this.updateConnectionStatus({
            connected: false,
            error
          });
          resolve(false);
        });
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.updateConnectionStatus({
        connected: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
      return false;
    }
  }

  /**
   * Disconnect the Socket.IO connection
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.updateConnectionStatus({
        connected: false,
        error: null
      });
      console.log('Socket disconnected');
    }

    // Clear any reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Set up default event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Handle reconnection
    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt;
      console.log(`Socket reconnection attempt ${attempt}/${this.maxReconnectAttempts}`);
      this.updateConnectionStatus({
        reconnectAttempts: attempt
      });
    });

    this.socket.on('reconnect', () => {
      console.log('Socket reconnected successfully');
      this.connected = true;
      this.updateConnectionStatus({
        connected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: null
      });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after maximum attempts');
      toast.error('Connection lost. Please refresh the page to reconnect.', {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
        duration: 0, // Don't auto-dismiss
      });
      this.updateConnectionStatus({
        connected: false,
        error: new Error('Reconnection failed')
      });
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.connected = false;
      this.updateConnectionStatus({
        connected: false,
        error: new Error(`Disconnected: ${reason}`)
      });

      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        toast.error('You have been disconnected from the server.', {
          action: {
            label: 'Reconnect',
            onClick: () => this.reconnect(),
          },
        });
      } else if (reason === 'transport close' || reason === 'ping timeout') {
        // Connection was closed, attempt to reconnect manually if auto-reconnect fails
        this.scheduleManualReconnect();
      }
    });

    // Handle errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.updateConnectionStatus({
        error
      });
    });

    // Handle notifications
    this.socket.on('notification:new', (notification) => {
      console.log('New notification received:', notification);
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });

      // Trigger any registered notification listeners
      this.triggerListeners('notification', notification);
    });
  }

  /**
   * Schedule a manual reconnection attempt if auto-reconnect fails
   */
  private scheduleManualReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      if (!this.connected && this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Attempting manual reconnection...');
        this.connect();
      }
    }, 10000); // Wait 10 seconds before trying manual reconnect
  }

  /**
   * Manually trigger a reconnection attempt
   */
  async reconnect(): Promise<boolean> {
    this.disconnect();
    return this.connect();
  }

  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event: string, callback: EventCallback): void {
    if (!this.socket) {
      console.warn('Socket not initialized. Connect first before adding listeners.');
      return;
    }

    // Register with Socket.IO
    this.socket.on(event, callback as any);

    // Also keep track for our custom event system
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event: string, callback?: EventCallback): void {
    if (!this.socket) return;

    if (callback) {
      // Remove specific callback
      this.socket.off(event, callback as any);

      // Update our custom event system
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.listeners.set(event, callbacks);
      }
    } else {
      // Remove all callbacks for this event
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @returns {boolean} Success status
   */
  emit(event: string, data: any): boolean {
    if (!this.socket || !this.connected) {
      console.warn('Socket not connected. Cannot emit event:', event);
      return false;
    }

    try {
      this.socket.emit(event, data);
      return true;
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
      return false;
    }
  }

  /**
   * Join a room
   * @param {string} roomId - Room ID
   * @returns {boolean} Success status
   */
  joinRoom(roomId: string): boolean {
    return this.emit('join', roomId);
  }

  /**
   * Leave a room
   * @param {string} roomId - Room ID
   * @returns {boolean} Success status
   */
  leaveRoom(roomId: string): boolean {
    return this.emit('leave', roomId);
  }

  /**
   * Join an interview room
   * @param {string} interviewId - Interview ID
   * @returns {boolean} Success status
   */
  joinInterview(interviewId: string): boolean {
    return this.emit('interview:join', interviewId);
  }

  /**
   * Leave an interview room
   * @param {string} interviewId - Interview ID
   * @returns {boolean} Success status
   */
  leaveInterview(interviewId: string): boolean {
    return this.emit('interview:leave', interviewId);
  }

  /**
   * Send code update during interview
   * @param {string} interviewId - Interview ID
   * @param {string} code - Code content
   * @param {string} language - Programming language
   * @returns {boolean} Success status
   */
  sendCodeUpdate(interviewId: string, code: string, language: string): boolean {
    return this.emit('interview:codeUpdate', { interviewId, code, language });
  }

  /**
   * Send chat message
   * @param {string} interviewId - Interview ID
   * @param {string} message - Message content
   * @returns {boolean} Success status
   */
  sendChatMessage(interviewId: string, message: string): boolean {
    return this.emit('chat:sendMessage', { interviewId, message });
  }

  /**
   * Update candidate status
   * @param {string} candidateId - Candidate ID
   * @param {string} status - New status
   * @returns {boolean} Success status
   */
  updateCandidateStatus(candidateId: string, status: string): boolean {
    return this.emit('candidate:statusUpdate', { candidateId, status });
  }

  /**
   * Get the socket instance
   * @returns {Socket|null} Socket instance or null if not connected
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   * @returns {boolean} Connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get detailed connection status
   * @returns {ConnectionStatus} Connection status object
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Register a connection status listener
   * @param {Function} listener - Listener function
   */
  onConnectionStatusChange(listener: (status: ConnectionStatus) => void): void {
    this.connectionStatusListeners.add(listener);
    // Immediately call with current status
    listener({ ...this.connectionStatus });
  }

  /**
   * Remove a connection status listener
   * @param {Function} listener - Listener function
   */
  offConnectionStatusChange(listener: (status: ConnectionStatus) => void): void {
    this.connectionStatusListeners.delete(listener);
  }

  /**
   * Update connection status and notify listeners
   * @param {Partial<ConnectionStatus>} update - Status update
   */
  private updateConnectionStatus(update: Partial<ConnectionStatus>): void {
    this.connectionStatus = {
      ...this.connectionStatus,
      ...update
    };

    // Notify all listeners
    this.connectionStatusListeners.forEach(listener => {
      try {
        listener({ ...this.connectionStatus });
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  /**
   * Trigger registered listeners for an event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  private triggerListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
import { useEffect, useState, useCallback } from 'react';
import socketService from '@/services/socketService';

export function useSocketService() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Set up connection status listeners
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    
    // Set initial connection state
    setIsConnected(socketService.isConnected());
    
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);
  
  const connect = useCallback(async () => {
    if (!socketService.isConnected()) {
      await socketService.connect();
    }
    return socketService.isConnected();
  }, []);
  
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);
  
  const emit = useCallback((event: string, data?: any) => {
    if (socketService.isConnected()) {
      socketService.emit(event, data);
      return true;
    }
    return false;
  }, []);
  
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketService.on(event, callback);
  }, []);
  
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketService.off(event, callback);
  }, []);
  
  return {
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useSocketService } from './useSocketService';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { editor as monacoEditor } from 'monaco-editor';
import { tokenManager } from '@/lib/api';
import { useAuth } from './useAuth';

interface UseCollaborativeCodeOptions {
  interviewId: string;
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  autoSaveInterval?: number; // in milliseconds
}

interface CodeEditor {
  id: string;
  name: string;
  role?: string;
  cursorPosition?: { lineNumber: number; column: number };
  lastActive?: Date;
}

export function useCollaborativeCode({
  interviewId,
  initialCode = '',
  initialLanguage = 'javascript',
  onCodeChange,
  onLanguageChange,
  autoSaveInterval = 5000,
}: UseCollaborativeCodeOptions) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEditors, setActiveEditors] = useState<CodeEditor[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // References for Y.js document and provider
  const ydoc = useRef<Y.Doc>(new Y.Doc());
  const provider = useRef<WebsocketProvider | null>(null);
  const ytext = useRef<Y.Text>(ydoc.current.getText('monaco'));
  
  const socketService = useSocketService();
  const { user } = useAuth();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle code change
  const updateCode = useCallback((newCode: string) => {
    setCode(newCode);
    
    if (onCodeChange) {
      onCodeChange(newCode);
    }
    
    // Emit code update to other users via Socket.IO
    if (socketService.isConnected()) {
      socketService.emit('interview:codeUpdate', {
        interviewId,
        code: newCode,
        language,
      });
    }
    
    // Setup auto-save
    if (autoSaveInterval > 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        saveCode(newCode, language);
      }, autoSaveInterval);
    }
  }, [interviewId, language, onCodeChange, socketService, autoSaveInterval]);
  
  // Handle language change
  const updateLanguage = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
    
    // Emit language update to other users
    if (socketService.isConnected()) {
      socketService.emit('interview:codeUpdate', {
        interviewId,
        code,
        language: newLanguage,
      });
    }
  }, [interviewId, code, onLanguageChange, socketService]);
  
  // Save code to database
  const saveCode = useCallback(async (codeToSave: string, languageToSave: string) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Emit save event to server
      socketService.emit('interview:codeSave', {
        interviewId,
        code: codeToSave,
        language: languageToSave,
      });
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save code:', error);
      setError('Failed to save code');
      toast.error('Failed to save code');
    } finally {
      setIsSaving(false);
    }
  }, [interviewId, isSaving, socketService]);
  
  // Initialize Y.js WebSocket provider and connect to socket
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 3; // Limit retries to prevent infinite loops
    
    const connectToCodeRoom = async () => {
      try {
        // If we've already retried too many times, don't try again
        if (retryCount >= maxRetries) {
          console.warn(`Failed to connect after ${maxRetries} attempts, giving up`);
          setIsLoading(false);
          setError(`Failed to connect after ${maxRetries} attempts. Please try again later.`);
          return;
        }
        
        retryCount++;
        setIsLoading(true);
        setError(null);
        
        // Ensure socket is connected
        if (!socketService.isConnected()) {
          await socketService.connect();
        }
        
        // Join the interview room
        socketService.emit('interview:join', interviewId);
        
        // Setup event listeners for Socket.IO
        socketService.on('interview:codeUpdated', handleCodeUpdate);
        socketService.on('interview:userJoined', handleUserJoined);
        socketService.on('interview:userLeft', handleUserLeft);
        
        // Initialize Y.js WebSocket provider if user is available
        if (user || interviewId) { // Modified to allow candidate access with interviewId
          // Create WebSocket provider
          // Connect directly to the backend WebSocket server
          // The backend server is running on port 8080 and expects paths starting with /yjs
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
          const backendHost = new URL(backendUrl).hostname;
          const backendPort = new URL(backendUrl).port || '8080';
          // Add token as a query parameter as expected by the backend
          const token = user ? tokenManager.getToken() : interviewId;
          const wsUrl = `ws://${backendHost}:${backendPort}/yjs?token=${encodeURIComponent(token)}`;
          console.log('Connecting to WebSocket URL:', wsUrl);
          const roomName = `code-${interviewId}`;
          
          try {
            console.log(`Attempting to connect to WebSocket at ${wsUrl} for room ${roomName}`);
            const wsProvider = new WebsocketProvider(
              wsUrl,
              roomName,
              ydoc.current,
              { 
                connect: true
                // Token is now sent as a query parameter in the URL
              }
            );
            
            // Add error event listener to the provider
            wsProvider.on('connection-error', (error) => {
              console.error('WebSocket connection error:', error);
              setError('WebSocket connection error');
              setIsLoading(false);
            });
            
            provider.current = wsProvider;
          } catch (wsError) {
            console.error('Failed to initialize WebSocket provider:', wsError);
            setError('Failed to initialize collaborative editing');
            setIsLoading(false);
            return; // Exit early to prevent further processing
          }
          
          // Set user awareness
          if (wsProvider && wsProvider.awareness) {
            wsProvider.awareness.setLocalStateField('user', {
              name: user?.name || 'Candidate',
              color: '#' + Math.floor(Math.random() * 16777215).toString(16),
              id: user?.id || 'candidate',
              role: user?.role || 'CANDIDATE',
            });
          }
          
          // Update active editors based on awareness
          const updateActiveEditors = () => {
            const states = wsProvider.awareness.getStates();
            const editors: CodeEditor[] = [];
            
            states.forEach((state, clientId) => {
              if (state.user && clientId !== wsProvider.awareness.clientID) {
                editors.push({
                  id: state.user.id || `client-${clientId}`,
                  name: state.user.name || 'Anonymous',
                  role: state.user.role,
                  cursorPosition: state.cursor,
                  lastActive: new Date(),
                });
              }
            });
            
            setActiveEditors(editors);
          };
          
          // Listen for awareness changes
          wsProvider.awareness.on('change', updateActiveEditors);
          
          // Initial update
          updateActiveEditors();
        }
        
        // Setup auto-save timer
        if (autoSaveInterval > 0) {
          autoSaveTimer = setInterval(() => {
            saveCode(code, language);
          }, autoSaveInterval);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to connect to code room:', error);
        setError('Failed to connect to collaborative editing session');
        toast.error('Failed to connect to collaborative editing session');
        setIsLoading(false);
      }
    };
    
    connectToCodeRoom();
    
    return () => {
      // Clean up event listeners and leave room
      socketService.off('interview:codeUpdated', handleCodeUpdate);
      socketService.off('interview:userJoined', handleUserJoined);
      socketService.off('interview:userLeft', handleUserLeft);
      
      socketService.emit('interview:leave', interviewId);
      
      // Clean up Y.js provider
      if (provider.current) {
        const wsProvider = provider.current;
        if (wsProvider.awareness) {
          wsProvider.awareness.off('change', () => {});
        }
        wsProvider.disconnect();
      }
      
      // Clear auto-save timer
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [interviewId, socketService, user, autoSaveInterval, code, language]);
  
  // Handle code update from other users
  const handleCodeUpdate = useCallback((data: any) => {
    // Only update if the code is from another user
    if (data.userId !== user?.id) {
      if (data.code && data.code !== code) {
        setCode(data.code);
        if (onCodeChange) {
          onCodeChange(data.code);
        }
      }
      
      if (data.language && data.language !== language) {
        setLanguage(data.language);
        if (onLanguageChange) {
          onLanguageChange(data.language);
        }
      }
      
      // Update the last active timestamp for this user
      setActiveEditors(prev => prev.map(editor => {
        if (editor.id === data.userId) {
          return { ...editor, lastActive: new Date() };
        }
        return editor;
      }));
    }
  }, [code, language, onCodeChange, onLanguageChange, user]);
  
  // Handle user joined event
  const handleUserJoined = useCallback((data: any) => {
    setActiveEditors(prev => {
      // Check if user already exists
      if (prev.some(editor => editor.id === data.userId)) {
        return prev;
      }
      
      // Add new user
      return [...prev, {
        id: data.userId,
        name: data.userName,
        role: data.role,
        lastActive: new Date(),
      }];
    });
    
    toast.info(`${data.userName} joined the coding session`);
  }, []);
  
  // Handle user left event
  const handleUserLeft = useCallback((data: any) => {
    setActiveEditors(prev => prev.filter(editor => editor.id !== data.userId));
    toast.info(`A user left the coding session`);
  }, []);
  
  // Update cursor position
  const updateCursorPosition = useCallback((position: monacoEditor.IPosition) => {
    if (provider.current && provider.current.awareness) {
      provider.current.awareness.setLocalStateField('cursor', {
        lineNumber: position.lineNumber,
        column: position.column,
      });
    }
  }, []);
  
  return {
    code,
    language,
    updateCode,
    updateLanguage,
    saveCode,
    isSaving,
    isLoading,
    activeEditors,
    lastSaved,
    error,
    updateCursorPosition,
    ytext: ytext.current,
  };
}
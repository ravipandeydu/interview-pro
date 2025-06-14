import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSocketService } from './useSocketService';

interface UseCollaborativeNoteOptions {
  noteId: string;
  initialTitle?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
  onSave?: (title: string, content: string) => void;
  autoSaveInterval?: number; // in milliseconds
}

interface NoteEditor {
  id: string;
  name: string;
  role?: string;
  lastActive?: Date;
}

export function useCollaborativeNote({
  noteId,
  initialTitle = '',
  initialContent = '',
  onContentChange,
  onTitleChange,
  onSave,
  autoSaveInterval = 5000,
}: UseCollaborativeNoteOptions) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEditors, setActiveEditors] = useState<NoteEditor[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const socketService = useSocketService();
  
  // Handle title change
  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
    
    if (onTitleChange) {
      onTitleChange(newTitle);
    }
    
    // Emit title update to other users
    if (socketService.isConnected()) {
      socketService.emit('note:update', {
        noteId,
        content,
        title: newTitle,
      });
    }
  }, [noteId, content, onTitleChange, socketService]);
  
  // Handle content change
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    
    if (onContentChange) {
      onContentChange(newContent);
    }
    
    // Emit content update to other users
    if (socketService.isConnected()) {
      socketService.emit('note:update', {
        noteId,
        content: newContent,
        title,
      });
    }
  }, [noteId, title, onContentChange, socketService]);
  
  // Save note to database
  const saveNote = useCallback(async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Emit save event to server
      socketService.emit('note:save', {
        noteId,
        content,
        title,
      });
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(title, content);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
      setError('Failed to save note');
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [noteId, title, content, isSaving, onSave, socketService]);
  
  // Connect to socket and join note room
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout | null = null;
    
    const connectToNoteRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure socket is connected
        if (!socketService.isConnected()) {
          await socketService.connect();
        }
        
        // Join the note room
        socketService.emit('note:join', noteId);
        
        // Setup event listeners
        socketService.on('note:current', handleCurrentNote);
        socketService.on('note:userJoined', handleUserJoined);
        socketService.on('note:userLeft', handleUserLeft);
        socketService.on('note:contentUpdate', handleContentUpdate);
        socketService.on('note:saved', handleNoteSaved);
        
        // Setup auto-save timer
        if (autoSaveInterval > 0) {
          autoSaveTimer = setInterval(() => {
            saveNote();
          }, autoSaveInterval);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to connect to note room:', error);
        setError('Failed to connect to collaborative editing session');
        toast.error('Failed to connect to collaborative editing session');
        setIsLoading(false);
      }
    };
    
    connectToNoteRoom();
    
    return () => {
      // Clean up event listeners and leave room
      socketService.off('note:current', handleCurrentNote);
      socketService.off('note:userJoined', handleUserJoined);
      socketService.off('note:userLeft', handleUserLeft);
      socketService.off('note:contentUpdate', handleContentUpdate);
      socketService.off('note:saved', handleNoteSaved);
      
      socketService.emit('note:leave', noteId);
      
      // Clear auto-save timer
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [noteId, socketService, autoSaveInterval]);
  
  // Handle receiving current note data when joining
  const handleCurrentNote = useCallback((data: any) => {
    if (data.content) {
      setContent(data.content);
      if (onContentChange) {
        onContentChange(data.content);
      }
    }
    
    if (data.title) {
      setTitle(data.title);
      if (onTitleChange) {
        onTitleChange(data.title);
      }
    }
    
    setLastSaved(data.lastUpdated ? new Date(data.lastUpdated) : null);
    
    // Update active editors count
    toast.info(`${data.editors} ${data.editors === 1 ? 'person' : 'people'} currently editing this note`);
  }, [onContentChange, onTitleChange]);
  
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
        name: data.name,
        role: data.role,
        lastActive: new Date(),
      }];
    });
    
    toast.info(`${data.name} joined the editing session`);
  }, []);
  
  // Handle user left event
  const handleUserLeft = useCallback((data: any) => {
    setActiveEditors(prev => prev.filter(editor => editor.id !== data.userId));
    toast.info(`${data.name} left the editing session`);
  }, []);
  
  // Handle content update from other users
  const handleContentUpdate = useCallback((data: any) => {
    if (data.content && data.content !== content) {
      // Only update if the content is different
      setContent(data.content);
      if (onContentChange) {
        onContentChange(data.content);
      }
    }
    
    if (data.title && data.title !== title) {
      setTitle(data.title);
      if (onTitleChange) {
        onTitleChange(data.title);
      }
    }
    
    // Update the last active timestamp for this user
    setActiveEditors(prev => prev.map(editor => {
      if (editor.id === data.updatedBy.id) {
        return { ...editor, lastActive: new Date() };
      }
      return editor;
    }));
  }, [content, title, onContentChange, onTitleChange]);
  
  // Handle note saved event
  const handleNoteSaved = useCallback((data: any) => {
    setLastSaved(new Date(data.timestamp));
    toast.success(`Note saved by ${data.savedBy.name}`);
  }, []);
  
  return {
    title,
    content,
    updateTitle,
    updateContent,
    saveNote,
    isSaving,
    isLoading,
    activeEditors,
    lastSaved,
    error,
  };
}
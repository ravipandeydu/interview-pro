'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSocketService } from '@/hooks/useSocketService';
import { useAuth } from '@/hooks/useAuth';
import { tokenManager } from '@/lib/api';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Save,
  Users,
} from 'lucide-react';

interface CollaborativeNoteEditorProps {
  noteId: string;
  initialTitle?: string;
  initialContent?: string;
  readOnly?: boolean;
  onSave?: (title: string, content: string) => void;
}

interface Editor {
  id: string;
  name: string;
  role?: string;
  cursorPosition?: { x: number; y: number };
  lastActive?: Date;
}

export function CollaborativeNoteEditor({
  noteId,
  initialTitle = '',
  initialContent = '',
  readOnly = false,
  onSave,
}: CollaborativeNoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditors, setActiveEditors] = useState<Editor[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketService = useSocketService();
  const { user } = useAuth();
  
  // Create a Y.js document
  const ydoc = useRef<Y.Doc>(new Y.Doc());
  // Create a WebSocket provider
  const provider = useRef<WebsocketProvider | null>(null);
  
  // Setup TipTap editor with Y.js collaboration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable history as Collaboration has its own
        history: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your notes here...',
      }),
      // Add Y.js collaboration extension
      Collaboration.configure({
        document: ydoc.current,
        field: 'content',
      }),
      // Add collaboration cursor extension to show other users' cursors
      // Only add CollaborationCursor when provider is available
      ...(user ? [
        CollaborationCursor.configure({
          // We'll set the provider after it's initialized
          user: {
            name: user.name,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
            id: user.id,
          },
        }),
      ] : []),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      
      // Emit content update to other users
      if (socketService.isConnected()) {
        socketService.emit('note:update', {
          noteId,
          content: newContent,
          title,
        });
      }
      
      // Setup auto-save
      if (autoSaveEnabled) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        
        autoSaveTimerRef.current = setTimeout(() => {
          saveNote(newContent, title);
        }, 5000); // Auto-save after 5 seconds of inactivity
      }
    },
  });
  
  // Initialize Y.js WebSocket provider
  useEffect(() => {
    // Only initialize if we have a user and noteId
    if (user && noteId) {
      // Create WebSocket provider
      const wsProvider = new WebsocketProvider(
        `ws://${window.location.hostname}:${window.location.port || 3000}`, // Use same host as frontend
        `note-${noteId}`, // Document name/room
        ydoc.current,
        { 
          connect: true,
          params: { token: tokenManager.getToken() } // Send auth token
        }
      );
      
      provider.current = wsProvider;
      
      // Set user awareness
      if (wsProvider && wsProvider.awareness) {
        wsProvider.awareness.setLocalStateField('user', {
          name: user.name,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
          id: user.id,
        });
      }
      
      // Update the provider for the collaboration cursor extension if it exists
      if (editor && editor.extensionManager.extensions.find(ext => ext.name === 'collaborationCursor')) {
        editor.extensionManager.extensions.find(ext => ext.name === 'collaborationCursor').options.provider = wsProvider;
      }
      
      // Update active editors based on awareness
      const updateActiveEditors = () => {
        const states = wsProvider.awareness.getStates();
        const editors: Editor[] = [];
        
        states.forEach((state, clientId) => {
          if (state.user && clientId !== wsProvider.awareness.clientID) {
            editors.push({
              id: state.user.id || `client-${clientId}`,
              name: state.user.name || 'Anonymous',
              role: state.user.role,
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
      
      return () => {
        wsProvider.awareness.off('change', updateActiveEditors);
        wsProvider.disconnect();
      };
    }
  }, [noteId, user, editor]); // Added editor to dependencies
  
  // Connect to socket and join note room
  useEffect(() => {
    const connectToNoteRoom = async () => {
      try {
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
        socketService.on('note:cursorUpdate', handleCursorUpdate);
        socketService.on('note:saved', handleNoteSaved);
        
        return () => {
          // Clean up event listeners and leave room
          socketService.off('note:current', handleCurrentNote);
          socketService.off('note:userJoined', handleUserJoined);
          socketService.off('note:userLeft', handleUserLeft);
          socketService.off('note:contentUpdate', handleContentUpdate);
          socketService.off('note:cursorUpdate', handleCursorUpdate);
          socketService.off('note:saved', handleNoteSaved);
          
          socketService.emit('note:leave', noteId);
          
          // Clear auto-save timer
          if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
          }
        };
      } catch (error) {
        console.error('Failed to connect to note room:', error);
        toast.error('Failed to connect to collaborative editing session');
      }
    };
    
    const cleanup = connectToNoteRoom();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [noteId, socketService]);
  
  // Handle receiving current note data when joining
  const handleCurrentNote = useCallback((data: any) => {
    // Only set content if we're not using Y.js or if the editor isn't initialized yet
    if (!provider.current && editor && data.content && data.content !== editor.getHTML()) {
      editor.commands.setContent(data.content);
    }
    
    setTitle(data.title || '');
    
    // Only set content state if not using Y.js
    if (!provider.current) {
      setContent(data.content || '');
    }
    
    setLastSaved(data.lastUpdated ? new Date(data.lastUpdated) : null);
    
    // Update active editors count
    toast.info(`${data.editors} ${data.editors === 1 ? 'person' : 'people'} currently editing this note`);
  }, [editor]);
  
  // Handle user joined event
  const handleUserJoined = useCallback((data: any) => {
    // Only add users not tracked by Y.js awareness
    if (provider.current) {
      const states = provider.current.awareness.getStates();
      const isTrackedByYjs = Array.from(states.values()).some(
        (state: any) => state.user && state.user.id === data.userId
      );
      
      if (isTrackedByYjs) {
        return;
      }
    }
    
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
    // Skip content updates if using Y.js as it handles them automatically
    if (provider.current) {
      // Only update title as Y.js handles content
      if (data.title) {
        setTitle(data.title);
      }
      return;
    }
    
    // Legacy socket.io content update handling
    if (editor && data.content && data.content !== editor.getHTML()) {
      // Only update if the content is different
      editor.commands.setContent(data.content);
    }
    
    if (data.title) {
      setTitle(data.title);
    }
    
    // Update the last active timestamp for this user
    setActiveEditors(prev => prev.map(editor => {
      if (editor.id === data.updatedBy.id) {
        return { ...editor, lastActive: new Date() };
      }
      return editor;
    }));
  }, [editor]);
  
  // Handle cursor update from other users
  const handleCursorUpdate = useCallback((data: any) => {
    // Skip cursor updates if using Y.js as it handles them automatically
    if (provider.current) {
      return;
    }
    
    // Legacy socket.io cursor update handling
    setActiveEditors(prev => prev.map(editor => {
      if (editor.id === data.userId) {
        return { 
          ...editor, 
          cursorPosition: data.position,
          lastActive: new Date(),
        };
      }
      return editor;
    }));
  }, []);
  
  // Handle note saved event
  const handleNoteSaved = useCallback((data: any) => {
    setLastSaved(new Date(data.timestamp));
    toast.success(`Note saved by ${data.savedBy.name}`);
  }, []);
  
  // Save note to database
  const saveNote = async (noteContent: string, noteTitle: string) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Get content from Y.js document if available
      let contentToSave = noteContent;
      if (provider.current && editor) {
        contentToSave = editor.getHTML();
      }
      
      // Emit save event to server
      socketService.emit('note:save', {
        noteId,
        content: contentToSave,
        title: noteTitle,
      });
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(noteTitle, contentToSave);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle manual save button click
  const handleSave = () => {
    saveNote(content, title);
  };
  
  // Add link handler
  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };
  
  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Emit title update to other users
    if (socketService.isConnected()) {
      socketService.emit('note:update', {
        noteId,
        content,
        title: newTitle,
      });
    }
  };

  if (!editor) {
    return <div className="p-4 text-center">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="text-xl font-semibold"
          disabled={readOnly}
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">{activeEditors.length}</span>
          </div>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={readOnly || isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      
      {activeEditors.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeEditors.map(editor => (
            <Badge key={editor.id} variant="outline">
              {editor.name}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="border rounded-md">
        <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Toggle bold"
            disabled={readOnly}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Toggle italic"
            disabled={readOnly}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Toggle underline"
            disabled={readOnly}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            aria-label="Toggle heading 1"
            disabled={readOnly}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Toggle heading 2"
            disabled={readOnly}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            aria-label="Toggle heading 3"
            disabled={readOnly}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Toggle bullet list"
            disabled={readOnly}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            aria-label="Toggle ordered list"
            disabled={readOnly}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            aria-label="Toggle code"
            disabled={readOnly}
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Toggle blockquote"
            disabled={readOnly}
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            className="h-8 px-2"
            disabled={readOnly}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <div className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo() || readOnly}
              className="h-8 px-2"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo() || readOnly}
              className="h-8 px-2"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
        />
      </div>
    </div>
  );
}
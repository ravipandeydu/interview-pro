'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
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

interface EditorInfo {
  id: string;
  name: string;
}

export function CollaborativeNoteEditor({
  noteId,
  initialTitle = '',
  initialContent = '',
  readOnly = false,
  onSave,
}: CollaborativeNoteEditorProps) {
  const { user } = useAuth();
  const socketService = useSocketService();

  // Local state
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeEditors, setActiveEditors] = useState<EditorInfo[]>([]);
  const [autoSaveEnabled] = useState(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1) Create Yjs document once
  const ydoc = useMemo(() => new Y.Doc(), []);

  // 2) Create WebsocketProvider once (only when user & noteId known)
  const wsProvider = useMemo(() => {
    if (!user || !noteId) return null;
    // Connect directly to the backend WebSocket server
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const backendHost = new URL(backendUrl).hostname;
    const backendPort = new URL(backendUrl).port || '8080';
    // Add token as a query parameter as expected by the backend
    const token = tokenManager.getToken();
    const url = `ws://${backendHost}:${backendPort}/yjs?token=${encodeURIComponent(token)}`;
    return new WebsocketProvider(url, `note-${noteId}`, ydoc, {
      connect: true
      // Token is now sent as a query parameter in the URL
    });
  }, [noteId, user, ydoc]);

  // 3) Initialize TipTap editor with Collaboration & Cursor
  const editor = useEditor({
    editable: !readOnly,
    content,
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Placeholder.configure({ placeholder: 'Start typing your notes here...' }),
      Collaboration.configure({ document: ydoc, field: 'content' }),
      wsProvider && user
        ? CollaborationCursor.configure({
            provider: wsProvider,
            user: {
              id: user.id,
              name: user.name,
              color: '#' + Math.floor(Math.random() * 0xffffff).toString(16),
            },
          })
        : null,
    ].filter(Boolean),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);

      // Debounced auto-save
      if (autoSaveEnabled) {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => saveNote(html, title), 5000);
      }

      // Fallback socket update for title/content
      if (socketService.socket?.connected) {
        socketService.emit('note:update', { noteId, content: html, title });
      }
    },
  });

  // 4) Yjs awareness → active editors list
  useEffect(() => {
    if (!wsProvider || !user) return;

    wsProvider.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.name,
      color: '#' + Math.floor(Math.random() * 0xffffff).toString(16),
    });

    const updateEditors = () => {
      const states = wsProvider.awareness.getStates();
      const others: EditorInfo[] = [];
      states.forEach((state: any) => {
        if (state.user && state.user.id !== user.id) {
          others.push({ id: state.user.id, name: state.user.name });
        }
      });
      setActiveEditors(others);
    };

    wsProvider.awareness.on('change', updateEditors);
    updateEditors();

    return () => {
      wsProvider.awareness.off('change', updateEditors);
      wsProvider.disconnect();
    };
  }, [wsProvider, user]);

  // 5) Socket.IO join room & event handlers
  useEffect(() => {
    let cleanupSocket: (() => void) | null = null;

    const setup = async () => {
      try {
        if (!socketService.socket?.connected) {
          await socketService.connect();
        }
        socketService.emit('note:join', noteId);

        socketService.on('note:current', handleCurrentNote);
        socketService.on('note:userJoined', handleUserJoined);
        socketService.on('note:userLeft', handleUserLeft);
        socketService.on('note:contentUpdate', handleContentUpdate);
        socketService.on('note:cursorUpdate', handleCursorUpdate);
        socketService.on('note:saved', handleNoteSaved);

        cleanupSocket = () => {
          socketService.emit('note:leave', noteId);
          socketService.off('note:current', handleCurrentNote);
          socketService.off('note:userJoined', handleUserJoined);
          socketService.off('note:userLeft', handleUserLeft);
          socketService.off('note:contentUpdate', handleContentUpdate);
          socketService.off('note:cursorUpdate', handleCursorUpdate);
          socketService.off('note:saved', handleNoteSaved);
          if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
      } catch (err) {
        console.error('Socket setup failed', err);
        toast.error('Failed to connect to collaborative session');
      }
    };

    setup();

    return () => {
      if (cleanupSocket) cleanupSocket();
    };
  }, [noteId, socketService, editor, title]);

  // Handlers
  const handleCurrentNote = useCallback((data: any) => {
    if (editor && data.content && data.content !== editor.getHTML()) {
      editor.commands.setContent(data.content);
    }
    setTitle(data.title || '');
    setContent(data.content || '');
    setLastSaved(data.lastUpdated ? new Date(data.lastUpdated) : null);
    toast.info(`${data.editors} ${data.editors === 1 ? 'person' : 'people'} editing`);
  }, [editor]);

  const handleUserJoined = useCallback((data: any) => {
    setActiveEditors(prev =>
      prev.some(e => e.id === data.userId)
        ? prev
        : [...prev, { id: data.userId, name: data.name }]
    );
    toast.info(`${data.name} joined`);
  }, []);

  const handleUserLeft = useCallback((data: any) => {
    setActiveEditors(prev => prev.filter(e => e.id !== data.userId));
    toast.info(`${data.name} left`);
  }, []);

  const handleContentUpdate = useCallback((data: any) => {
    if (!wsProvider && editor && data.content !== editor.getHTML()) {
      editor.commands.setContent(data.content);
    }
    if (data.title) setTitle(data.title);
  }, [editor, wsProvider]);

  const handleCursorUpdate = useCallback((_data: any) => {
    /* ignored—Yjs cursors handle themselves */
  }, []);

  const handleNoteSaved = useCallback((data: any) => {
    setLastSaved(new Date(data.timestamp));
    toast.success(`Saved by ${data.savedBy.name}`);
  }, []);

  // Save logic
  const saveNote = async (noteContent: string, noteTitle: string) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const html = wsProvider && editor ? editor.getHTML() : noteContent;
      socketService.emit('note:save', { noteId, content: html, title: noteTitle });
      onSave?.(noteTitle, html);
      setLastSaved(new Date());
    } catch {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => saveNote(content, title);

  // Link tool
  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('URL', prev);
    if (url === null) return;
    if (url === '') return editor.chain().focus().extendMarkRange('link').unsetLink().run();
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Title change
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setTitle(t);
    if (socketService.socket?.connected) {
      socketService.emit('note:update', { noteId, content, title: t });
    }
  };

  if (!editor) {
    return <div className="p-4 text-center">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Input
          value={title}
          onChange={onTitleChange}
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
            onClick={handleSaveClick}
            disabled={readOnly || isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Active editors badges */}
      {activeEditors.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeEditors.map(e => (
            <Badge key={e.id} variant="outline">
              {e.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Toolbar + Editor */}
      <div className="border rounded-md">
        <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            disabled={readOnly}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            disabled={readOnly}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
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
            disabled={readOnly}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
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
            disabled={readOnly}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            disabled={readOnly}
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
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

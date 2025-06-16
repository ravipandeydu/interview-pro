'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useEffect, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
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
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  onSave?: (content: string) => Promise<void>;
  autoSaveInterval?: number | null; // in milliseconds, null means no auto-save
  noteId?: string; // Optional noteId for reference
  fetchUpdates?: boolean; // Whether to fetch updates periodically
  fetchInterval?: number; // Interval for fetching updates in milliseconds
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Write your answer here...',
  editable = true,
  onSave,
  autoSaveInterval = null, // Default to no auto-save
  noteId,
  fetchUpdates = false, // Default to not fetching updates
  fetchInterval = 5000, // Default to 5 seconds
}: TipTapEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Setup auto-save only if interval is provided and greater than 0
      if (autoSaveInterval && autoSaveInterval > 0 && onSave) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        
        autoSaveTimerRef.current = setTimeout(() => {
          saveContent(html);
        }, autoSaveInterval);
      }
    },
    autofocus: true,
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);
  
  // Setup periodic content fetching if enabled
  useEffect(() => {
    if (!fetchUpdates || !noteId || !editor) return;
    
    // Function to fetch the latest content
    const fetchLatestContent = async () => {
      try {
        const response = await axios.get(`/api/notes/${noteId}`);
        const latestNote = response.data;
        
        // Only update if the content is different from current editor content
        if (latestNote.content && latestNote.content !== editor.getHTML()) {
          editor.commands.setContent(latestNote.content);
          toast.info('Content updated from server');
        }
        
        // Update last saved timestamp if available
        if (latestNote.updatedAt) {
          setLastSaved(new Date(latestNote.updatedAt));
        }
      } catch (error) {
        console.error('Failed to fetch latest content:', error);
        // Don't show error toast to avoid annoying the user with repeated errors
      }
    };
    
    // Set up interval to fetch content
    fetchTimerRef.current = setInterval(fetchLatestContent, fetchInterval);
    
    return () => {
      // Clean up interval on unmount
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
      }
    };
  }, [fetchUpdates, noteId, fetchInterval, editor]);

  // Focus the editor when it's initialized
  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        editor.commands.focus();
      }, 0);
    }
  }, [editor]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Handle click on editor container to focus
  const handleContainerClick = useCallback(() => {
    if (editor && editable) {
      editor.commands.focus();
    }
  }, [editor, editable]);

  // Save content
  const saveContent = async (contentToSave: string) => {
    if (isSaving || !onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(contentToSave);
      setLastSaved(new Date());
      
      // No toast to avoid too many notifications during auto-save
    } catch (error) {
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle manual save
  const handleSaveClick = () => {
    if (editor && onSave) {
      saveContent(editor.getHTML());
      toast.success('Content saved successfully');
    }
  };

  if (!editor) {
    return null;
  }

  // Add link handler
  const setLink = () => {
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

  return (
    <div className="border rounded-md" onClick={handleContainerClick}>
      <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Toggle underline"
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
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Toggle bullet list"
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
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          aria-label="Toggle code"
        >
          <Code className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Toggle blockquote"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <Button
          variant="ghost"
          size="sm"
          onClick={setLink}
          className="h-8 px-2"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex gap-1">
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="h-8 px-2"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 px-2"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 px-2"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
        />
        {lastSaved && (
          <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
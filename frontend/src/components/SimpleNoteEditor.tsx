'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { TipTapEditor } from '@/components/TipTapEditor';
import { toast } from 'sonner';

interface SimpleNoteEditorProps {
  noteId: string;
  initialTitle?: string;
  initialContent?: string;
  readOnly?: boolean;
  onSave?: (title: string, content: string) => void;
}

export function SimpleNoteEditor({
  noteId,
  initialTitle = '',
  initialContent = '',
  readOnly = false,
  onSave,
}: SimpleNoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  
  // Update state when props change
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent, noteId]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  // Handle save
  const handleSave = async (contentToSave: string) => {
    if (onSave) {
      await onSave(title, contentToSave);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title input */}
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title"
        className="text-xl font-semibold"
        disabled={readOnly}
        onBlur={() => {
          if (onSave) {
            onSave(title, content);
            toast.success('Title saved');
          }
        }}
      />
      
      {/* TipTap editor with auto-save and HTTP-based updates */}
      <TipTapEditor
        content={content}
        onChange={handleContentChange}
        editable={!readOnly}
        onSave={handleSave}
        autoSaveInterval={5000} // Auto-save every 5 seconds for notes
        placeholder="Start typing your notes here..."
        noteId={noteId} // Pass noteId for content fetching
        fetchUpdates={true} // Enable HTTP-based updates
        fetchInterval={10000} // Check for updates every 10 seconds
      />
    </div>
  );
}
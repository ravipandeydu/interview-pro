'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor, EditorProps, OnMount } from '@monaco-editor/react';
import { editor as monacoEditor } from 'monaco-editor';
import { useCollaborativeCode } from '@/hooks/useCollaborativeCode';
import { useUserPreferences } from '@/hooks/useUser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CollaborativeCodeEditorProps {
  interviewId: string;
  initialCode?: string;
  initialLanguage?: string;
  height?: string;
  readOnly?: boolean;
  placeholder?: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  isCandidate?: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
];

export function CollaborativeCodeEditor({
  interviewId,
  initialCode = '',
  initialLanguage = 'javascript',
  height = '400px',
  readOnly = false,
  placeholder = '// Write your code here...',
  onCodeChange,
  onLanguageChange,
  isCandidate = false,
}: CollaborativeCodeEditorProps) {
  // Only use preferences hook if not in candidate mode
  const { data: preferences } = !isCandidate ? useUserPreferences() : { data: undefined };
  const [theme, setTheme] = useState<string>('vs-dark');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [showActiveEditors, setShowActiveEditors] = useState(false);
  
  // Use collaborative code hook
  const {
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
    ytext,
  } = useCollaborativeCode({
    interviewId,
    initialCode,
    initialLanguage,
    onCodeChange,
    onLanguageChange,
  });
  
  // Set editor theme based on user preferences or default
  useEffect(() => {
    if (preferences?.display?.codeEditorTheme) {
      setTheme(preferences.display.codeEditorTheme);
    }
  }, [preferences]);
  
  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Setup cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      updateCursorPosition(e.position);
    });
    
    // Setup Y.js binding with Monaco editor
    if (ytext) {
      // Create a Monaco model that syncs with Y.js
      const model = monaco.editor.createModel(
        code || placeholder,
        language,
      );
      
      // Bind the Y.js text to the Monaco model
      const binding = new monaco.editor.MonacoYTextBinding({
        ytext,
        model,
        awareness: provider.current?.awareness,
        undoManager: new Y.UndoManager(ytext),
      });
      
      // Set the model to the editor
      editor.setModel(model);
      
      return () => {
        binding.destroy();
        model.dispose();
      };
    }
  };
  
  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    updateCode(newCode);
  };
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    updateLanguage(value);
  };
  
  // Handle manual save
  const handleSave = () => {
    saveCode(code, language);
    toast.success('Code saved successfully');
  };
  
  // Editor options
  const editorOptions: EditorProps['options'] = {
    readOnly,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    automaticLayout: true,
    lineNumbers: 'on',
    glyphMargin: true,
    folding: true,
    lineDecorationsWidth: 10,
    renderLineHighlight: 'all',
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (error) {
    return (
      <div className="border rounded-md p-4 bg-destructive/10 text-destructive">
        <p>Error: {error}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select
            value={language}
            onValueChange={handleLanguageChange}
            disabled={readOnly}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActiveEditors(!showActiveEditors)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  {activeEditors.length}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Active editors</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Last saved: {formatTime(lastSaved)}
            </span>
          )}
        </div>
      </div>
      
      {showActiveEditors && activeEditors.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
          {activeEditors.map((editor) => (
            <Badge key={editor.id} variant="outline" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {editor.name}
              {editor.role && <span className="text-xs text-muted-foreground">({editor.role})</span>}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden">
        <Editor
          height={height}
          language={language}
          value={code || placeholder}
          theme={theme}
          options={editorOptions}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          loading={<div className="p-4 text-center">Loading editor...</div>}
        />
        <div className="bg-muted px-3 py-1 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium">Language:</span>
            <span>{LANGUAGE_OPTIONS.find(opt => opt.value === language)?.label || language}</span>
          </div>
          {!readOnly && (
            <div className="text-muted-foreground">
              {isEditorReady ? 'Editor ready' : 'Loading...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollaborativeCodeEditor;
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Editor, EditorProps, OnMount } from '@monaco-editor/react';
import { editor as monacoEditor } from 'monaco-editor';
import { useUserPreferences } from '@/hooks/useUser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import axios from 'axios';

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
  fetchUpdates?: boolean;
  fetchInterval?: number; // in milliseconds
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
  fetchUpdates = false,
  fetchInterval = 5000, // Default to 5 seconds
}: CollaborativeCodeEditorProps) {
  // Only use preferences hook if not in candidate mode
  const { data: preferences } = !isCandidate ? useUserPreferences() : { data: undefined };
  const [theme, setTheme] = useState<string>('vs-dark');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [showActiveEditors, setShowActiveEditors] = useState(false);
  
  // State management for code editor
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEditors, setActiveEditors] = useState<Array<{id: string; name: string; role?: string}>>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for timers
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}/code`);
        const data = response.data;
        
        if (data.code) setCode(data.code);
        if (data.language) setLanguage(data.language);
        if (data.updatedAt) setLastSaved(new Date(data.updatedAt));
        if (data.activeUsers) setActiveEditors(data.activeUsers);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch initial code data:', error);
        setError('Failed to load code data');
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [interviewId]);
  
  // Auto-save feature
  useEffect(() => {
    if (readOnly) return;
    
    const autoSaveInterval = 30000; // 30 seconds
    
    const autoSave = async () => {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}/code`, {
          code,
          language
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };
    
    autoSaveTimerRef.current = setInterval(autoSave, autoSaveInterval);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [interviewId, code, language, readOnly]);
  
  // Set editor theme based on user preferences or default
  useEffect(() => {
    if (preferences?.editorTheme) {
      setTheme(preferences.editorTheme);
    }
  }, [preferences]);
  
  // Periodic fetching of code updates
  useEffect(() => {
    if (!fetchUpdates || !interviewId) return;
    
    const fetchCodeUpdates = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}/code`);
        const data = response.data;
        
        // Only update if the content has changed and we didn't just save it ourselves
        if (data.code && data.code !== code) {
          setCode(data.code);
          if (onCodeChange) onCodeChange(data.code);
        }
        
        if (data.language && data.language !== language) {
          setLanguage(data.language);
          if (onLanguageChange) onLanguageChange(data.language);
        }
        
        if (data.updatedAt) {
          setLastSaved(new Date(data.updatedAt));
        }
        
        if (data.activeUsers) {
          setActiveEditors(data.activeUsers);
        }
      } catch (error) {
        console.error('Failed to fetch code updates:', error);
      }
    };
    
    // Set up interval for fetching updates
    fetchTimerRef.current = setInterval(fetchCodeUpdates, fetchInterval);
    
    // Initial fetch
    fetchCodeUpdates();
    
    return () => {
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
      }
    };
  }, [interviewId, fetchUpdates, fetchInterval, code, language, onCodeChange, onLanguageChange]);
  
  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  };
  
  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (onLanguageChange) onLanguageChange(value);
  };
  
  // Handle manual save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}/code`, {
        code,
        language
      });
      setLastSaved(new Date());
      toast.success('Code saved successfully');
    } catch (error) {
      console.error('Failed to save code:', error);
      toast.error('Failed to save code');
    } finally {
      setIsSaving(false);
    }
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
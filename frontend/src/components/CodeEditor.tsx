'use client';

import { useEffect, useState } from 'react';
import { Editor, EditorProps } from '@monaco-editor/react';
import { useUserPreferences } from '@/hooks/useUser';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  placeholder?: string;
  isCandidate?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
  placeholder = '// Write your code here...',
  isCandidate = false,
}: CodeEditorProps) {
  // Only use preferences hook if not in candidate mode
  const { data: preferences } = !isCandidate ? useUserPreferences() : { data: undefined };
  const [theme, setTheme] = useState<string>('vs-dark');
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Set editor theme based on user preferences or default
  useEffect(() => {
    if (preferences?.display?.codeEditorTheme) {
      setTheme(preferences.display.codeEditorTheme);
    }
  }, [preferences]);

  // Handle editor mount
  const handleEditorDidMount = () => {
    setIsEditorReady(true);
  };

  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
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

  return (
    <div className="border rounded-md overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value || placeholder}
        theme={theme}
        options={editorOptions}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={<div className="p-4 text-center">Loading editor...</div>}
      />
      <div className="bg-muted px-3 py-1 text-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium">Language:</span>
          <span>{language}</span>
        </div>
        {!readOnly && (
          <div className="text-muted-foreground">
            {isEditorReady ? 'Editor ready' : 'Loading...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeEditor;
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SimpleNoteEditor } from '@/components/SimpleNoteEditor';
import { toast } from 'sonner';
import { Clock, FileText, History } from 'lucide-react';
import { format } from 'date-fns';
import { NoteService, Note, NoteEdit } from '@/services/noteService';

export function InterviewNotes({ interviewId, accessToken }: { interviewId: string, accessToken?: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [noteHistory, setNoteHistory] = useState<NoteEdit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Fetch notes for this interview
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        let data;
        
        // Use the appropriate method based on whether we have an access token
        if (accessToken) {
          data = await NoteService.getNotesByInterviewWithToken(interviewId, accessToken);
        } else {
          data = await NoteService.getNotesByInterview(interviewId);
        }
        
        setNotes(data);
        
        // Select the first note if available
        if (data.length > 0 && !selectedNote) {
          setSelectedNote(data[0]);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [interviewId, accessToken]);
  
  // Create a new note
  const handleCreateNote = async () => {
    try {
      setIsCreating(true);
      
      let newNote;
      
      // Use the appropriate method based on whether we have an access token
      if (accessToken) {
        newNote = await NoteService.createNoteWithToken(
          {
            interviewId,
            title: 'Untitled Note',
            content: '',
          },
          accessToken
        );
      } else {
        newNote = await NoteService.createNote({
          interviewId,
          title: 'Untitled Note',
          content: '',
        });
      }
      
      setNotes(prev => [...prev, newNote]);
      setSelectedNote(newNote);
      toast.success('New note created');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Use the appropriate method based on whether we have an access token
      if (accessToken) {
        await NoteService.deleteNoteWithToken(noteId, accessToken);
      } else {
        await NoteService.deleteNote(noteId);
      }
      
      // Remove the note from the list
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      // If the deleted note was selected, select another note or set to null
      if (selectedNote?.id === noteId) {
        const remainingNotes = notes.filter(note => note.id !== noteId);
        setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
      }
      
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };
  
  // View note history
  const handleViewHistory = async (noteId: string) => {
    try {
      setHistoryLoading(true);
      let history;
      
      // Use the appropriate method based on whether we have an access token
      if (accessToken) {
        history = await NoteService.getNoteHistoryWithToken(noteId, accessToken);
      } else {
        history = await NoteService.getNoteHistory(noteId);
      }
      
      setNoteHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching note history:', error);
      toast.error('Failed to load note history');
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // Handle note save
  const handleSaveNote = async (title: string, content: string) => {
    if (!selectedNote) return;
    
    try {
      let updatedNote;
      
      // Use the appropriate method based on whether we have an access token
      if (accessToken) {
        updatedNote = await NoteService.updateNoteWithToken(
          selectedNote.id,
          {
            title,
            content,
          },
          accessToken
        );
      } else {
        updatedNote = await NoteService.updateNote(selectedNote.id, {
          title,
          content,
        });
      }
      
      // Update the note in the list
      setNotes(prev => prev.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
      
      // Update the selected note
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };
  
  if (isLoading) {
    return (
      <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">Interview Notes</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-pulse text-muted-foreground" />
            Loading notes...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
      <CardHeader className="relative z-10 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">Interview Notes</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Collaborative notes for this interview
          </CardDescription>
        </div>
        <Button 
          onClick={handleCreateNote} 
          disabled={isCreating}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          {isCreating ? (
            <>
              <span className="animate-pulse">Creating...</span>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </>
          ) : (
            'New Note'
          )}
        </Button>
      </CardHeader>
      <CardContent className="relative z-10">
        {notes.length === 0 ? (
          <div className="text-center py-10 px-6 rounded-lg backdrop-blur-sm bg-background/60 border border-indigo-500/10">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="mt-2 text-muted-foreground">No notes yet</p>
            <Button 
              onClick={handleCreateNote} 
              className="mt-4 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" 
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="animate-pulse">Creating...</span>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </>
              ) : (
                'Create your first note'
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 border-r border-indigo-500/10 pr-4">
              <h3 className="font-medium mb-3 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Notes
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {notes.map(note => (
                  <div 
                    key={note.id} 
                    className={`p-3 rounded-md cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 flex justify-between items-start transition-all duration-200 border border-transparent ${
                      selectedNote?.id === note.id ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/50 dark:border-indigo-800/50 shadow-sm' : ''
                    }`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${selectedNote?.id === note.id ? 'text-indigo-700 dark:text-indigo-400' : ''}`}>
                        {note.title || 'Untitled Note'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewHistory(note.id);
                        }}
                      >
                        <History className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-3">
              {showHistory ? (
                <div className="backdrop-blur-sm bg-background/60 rounded-lg border border-indigo-500/10 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                      <History className="h-4 w-4" />
                      Note History
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowHistory(false)}
                      className="border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400"
                    >
                      Back to Note
                    </Button>
                  </div>
                  
                  {historyLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Clock className="h-5 w-5 mr-2 animate-pulse text-indigo-600 dark:text-indigo-400" />
                      <p className="text-muted-foreground">Loading history...</p>
                    </div>
                  ) : noteHistory.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {noteHistory.map((edit) => (
                        <div key={edit.id} className="border border-indigo-200/50 dark:border-indigo-800/30 rounded-md p-4 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-indigo-700 dark:text-indigo-400">{edit.user.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(edit.createdAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/30">
                              Edit #{noteHistory.length - noteHistory.indexOf(edit)}
                            </Badge>
                          </div>
                          <Separator className="my-2 bg-indigo-100 dark:bg-indigo-800/30" />
                          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: edit.content }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-3">
                        <History className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-muted-foreground">No edit history available</p>
                    </div>
                  )}
                </div>
              ) : selectedNote ? (
                <div className="backdrop-blur-sm bg-background/60 rounded-lg border border-indigo-500/10 p-4">
                  <SimpleNoteEditor
                    key={selectedNote.id} // Add a key prop to force re-render when the note changes
                    noteId={selectedNote.id}
                    initialTitle={selectedNote.title}
                    initialContent={selectedNote.content}
                    onSave={handleSaveNote}
                  />
                </div>
              ) : (
                <div className="text-center py-16 px-6 backdrop-blur-sm bg-background/60 rounded-lg border border-indigo-500/10">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-muted-foreground">Select a note to view or edit</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
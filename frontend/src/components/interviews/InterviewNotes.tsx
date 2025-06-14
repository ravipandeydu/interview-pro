'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CollaborativeNoteEditor } from '@/components/CollaborativeNoteEditor';
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
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Loading notes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Interview Notes</CardTitle>
          <CardDescription>
            Collaborative notes for this interview
          </CardDescription>
        </div>
        <Button onClick={handleCreateNote} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'New Note'}
        </Button>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No notes yet</p>
            <Button onClick={handleCreateNote} className="mt-4" disabled={isCreating}>
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 border-r pr-4">
              <h3 className="font-medium mb-2">All Notes</h3>
              <div className="space-y-2">
                {notes.map(note => (
                  <div 
                    key={note.id} 
                    className={`p-2 rounded-md cursor-pointer hover:bg-muted flex justify-between items-start ${
                      selectedNote?.id === note.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div>
                      <p className="font-medium truncate">{note.title || 'Untitled Note'}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
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
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Note History</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowHistory(false)}
                    >
                      Back to Note
                    </Button>
                  </div>
                  
                  {historyLoading ? (
                    <p className="text-muted-foreground">Loading history...</p>
                  ) : noteHistory.length > 0 ? (
                    <div className="space-y-4">
                      {noteHistory.map((edit) => (
                        <div key={edit.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{edit.user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(edit.createdAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <Badge variant="outline">Edit #{noteHistory.length - noteHistory.indexOf(edit)}</Badge>
                          </div>
                          <Separator className="my-2" />
                          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: edit.content }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No edit history available</p>
                  )}
                </div>
              ) : selectedNote ? (
                <CollaborativeNoteEditor
                  key={selectedNote.id} // Add a key prop to force re-render when the note changes
                  noteId={selectedNote.id}
                  initialTitle={selectedNote.title}
                  initialContent={selectedNote.content}
                  onSave={handleSaveNote}
                />
              ) : (
                <div className="text-center py-10">
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
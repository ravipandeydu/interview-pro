import { api } from "../lib/api";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  edits?: NoteEdit[];
}

export interface NoteEdit {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export class NoteService {
  /**
   * Get all notes for an interview
   */
  static async getNotesByInterview(interviewId: string): Promise<Note[]> {
    try {
      const { data } = await api.get<Note[]>(`/notes/interview/${interviewId}`);
      return data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  /**
   * Get all notes for an interview using candidate access token
   */
  static async getNotesByInterviewWithToken(interviewId: string, accessToken: string): Promise<Note[]> {
    try {
      const { data } = await api.get<Note[]>(`/notes/interview/${interviewId}/candidate/${accessToken}`);
      return data;
    } catch (error) {
      console.error('Error fetching notes with access token:', error);
      throw error;
    }
  }

  /**
   * Create a new note
   */
  static async createNote(noteData: { interviewId: string; title: string; content: string }): Promise<Note> {
    try {
      const { data } = await api.post<Note>('/notes', noteData);
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Update a note
   */
  static async updateNote(noteId: string, noteData: { title: string; content: string }): Promise<Note> {
    try {
      const { data } = await api.put<Note>(`/notes/${noteId}`, noteData);
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  /**
   * Delete a note
   */
  static async deleteNote(noteId: string): Promise<void> {
    try {
      await api.delete(`/notes/${noteId}`);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  /**
   * Get note history
   */
  static async getNoteHistory(noteId: string): Promise<NoteEdit[]> {
    try {
      const { data } = await api.get<NoteEdit[]>(`/notes/${noteId}/history`);
      return data;
    } catch (error) {
      console.error('Error fetching note history:', error);
      throw error;
    }
  }

  /**
   * Get note history using candidate access token
   */
  static async getNoteHistoryWithToken(noteId: string, accessToken: string): Promise<NoteEdit[]> {
    try {
      const { data } = await api.get<NoteEdit[]>(`/notes/${noteId}/history/candidate/${accessToken}`);
      return data;
    } catch (error) {
      console.error('Error fetching note history with access token:', error);
      throw error;
    }
  }

  /**
   * Create a new note using candidate access token
   */
  static async createNoteWithToken(
    noteData: { interviewId: string; title: string; content: string },
    accessToken: string
  ): Promise<Note> {
    try {
      const { data } = await api.post<Note>(`/notes/candidate/${accessToken}`, noteData);
      return data;
    } catch (error) {
      console.error('Error creating note with access token:', error);
      throw error;
    }
  }

  /**
   * Update a note using candidate access token
   */
  static async updateNoteWithToken(
    noteId: string,
    noteData: { title: string; content: string },
    accessToken: string
  ): Promise<Note> {
    try {
      const { data } = await api.put<Note>(`/notes/${noteId}/candidate/${accessToken}`, noteData);
      return data;
    } catch (error) {
      console.error('Error updating note with access token:', error);
      throw error;
    }
  }

  /**
   * Delete a note using candidate access token
   */
  static async deleteNoteWithToken(noteId: string, accessToken: string): Promise<void> {
    try {
      await api.delete(`/notes/${noteId}/candidate/${accessToken}`);
    } catch (error) {
      console.error('Error deleting note with access token:', error);
      throw error;
    }
  }
}
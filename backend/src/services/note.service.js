/**
 * Note Service
 *
 * This module provides services for note management, including fetching,
 * creating, updating, and deleting notes.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

/**
 * Get all notes for an interview
 * @param {string} interviewId - ID of the interview
 * @returns {Promise<Array>} List of notes
 */
async function getNotesByInterview(interviewId) {
  try {
    const notes = await prisma.note.findMany({
      where: { interviewId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return notes;
  } catch (error) {
    throw new ApiError(`Error fetching notes: ${error.message}`, 500);
  }
}

/**
 * Get a note by ID
 * @param {string} noteId - ID of the note
 * @returns {Promise<Object>} Note object
 */
async function getNoteById(noteId) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        edits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!note) {
      throw new ApiError('Note not found', 404);
    }

    return note;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Error fetching note: ${error.message}`, 500);
  }
}

/**
 * Create a new note
 * @param {Object} noteData - Note data
 * @param {string} noteData.title - Note title
 * @param {string} noteData.content - Note content
 * @param {boolean} noteData.isShared - Whether the note is shared
 * @param {string} noteData.interviewId - ID of the associated interview
 * @param {string} userId - ID of the user creating the note
 * @returns {Promise<Object>} Created note
 */
async function createNote(noteData, userId) {
  try {
    // Verify the interview exists
    const interview = await prisma.interview.findUnique({
      where: { id: noteData.interviewId },
    });

    if (!interview) {
      throw new ApiError('Interview not found', 404);
    }

    const note = await prisma.note.create({
      data: {
        title: noteData.title,
        content: noteData.content,
        isShared: noteData.isShared ?? true,
        createdBy: { connect: { id: userId } },
        interview: { connect: { id: noteData.interviewId } },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create initial edit record
    await prisma.noteEdit.create({
      data: {
        content: noteData.content,
        note: { connect: { id: note.id } },
        user: { connect: { id: userId } },
      },
    });

    return note;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Error creating note: ${error.message}`, 500);
  }
}

/**
 * Update a note
 * @param {string} noteId - ID of the note to update
 * @param {Object} noteData - Updated note data
 * @param {string} noteData.title - Note title
 * @param {string} noteData.content - Note content
 * @param {boolean} noteData.isShared - Whether the note is shared
 * @param {string} userId - ID of the user updating the note
 * @returns {Promise<Object>} Updated note
 */
async function updateNote(noteId, noteData, userId) {
  try {
    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      throw new ApiError('Note not found', 404);
    }

    // Update the note
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: noteData.title !== undefined ? noteData.title : undefined,
        content: noteData.content !== undefined ? noteData.content : undefined,
        isShared: noteData.isShared !== undefined ? noteData.isShared : undefined,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create edit record if content was updated
    if (noteData.content !== undefined) {
      await prisma.noteEdit.create({
        data: {
          content: noteData.content,
          note: { connect: { id: noteId } },
          user: { connect: { id: userId } },
        },
      });
    }

    return updatedNote;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Error updating note: ${error.message}`, 500);
  }
}

/**
 * Delete a note
 * @param {string} noteId - ID of the note to delete
 * @returns {Promise<Object>} Deleted note
 */
async function deleteNote(noteId) {
  try {
    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      throw new ApiError('Note not found', 404);
    }

    // Delete all edits first (due to foreign key constraints)
    await prisma.noteEdit.deleteMany({
      where: { noteId },
    });

    // Delete the note
    const deletedNote = await prisma.note.delete({
      where: { id: noteId },
    });

    return deletedNote;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Error deleting note: ${error.message}`, 500);
  }
}

/**
 * Get note edit history
 * @param {string} noteId - ID of the note
 * @returns {Promise<Array>} List of note edits
 */
async function getNoteHistory(noteId) {
  try {
    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      throw new ApiError('Note not found', 404);
    }

    const edits = await prisma.noteEdit.findMany({
      where: { noteId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return edits;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Error fetching note history: ${error.message}`, 500);
  }
}

export default {
  getNotesByInterview,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNoteHistory,
};
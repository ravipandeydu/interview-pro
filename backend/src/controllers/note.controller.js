/**
 * Note Controller
 *
 * This module provides controllers for note-related HTTP endpoints.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import noteService from '../services/note.service.js';
import { ApiError } from '../middlewares/error.middleware.js';

/**
 * Get all notes for an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getNotesByInterview(req, res, next) {
  try {
    const { interviewId } = req.params;
    const notes = await noteService.getNotesByInterview(interviewId);
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a note by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getNoteById(req, res, next) {
  try {
    const { noteId } = req.params;
    const note = await noteService.getNoteById(noteId);
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new note
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createNote(req, res, next) {
  try {
    const { title, content, isShared, interviewId } = req.body;
    let userId;
    let noteInterviewId = interviewId;
    
    // Handle different authentication methods
    if (req.user) {
      // JWT authenticated user
      userId = req.user.id;
    } else if (req.isCandidate && req.candidate) {
      // Candidate authenticated with access token
      // For candidates, we need to use the recruiter's ID as the user ID
      // since candidates are not users in the system
      
      // Get the recruiter ID from the interview
      userId = req.interview.recruiterId;
      
      // For candidates, we use the interview ID from their token
      noteInterviewId = req.interview.id;
      
      // Ensure the interviewId in the request matches the one in the token
      if (interviewId && interviewId !== noteInterviewId) {
        throw new ApiError('You can only create notes for your own interview', 403);
      }
    } else {
      throw new ApiError('Authentication required', 401);
    }

    if (!title || !noteInterviewId) {
      throw new ApiError('Title and interviewId are required', 400);
    }
    
    // Allow empty content but ensure it's a string
    const noteContent = content || '';

    const note = await noteService.createNote(
      { title, content: noteContent, isShared, interviewId: noteInterviewId },
      userId
    );
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a note
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateNote(req, res, next) {
  try {
    const { noteId } = req.params;
    const { title, content, isShared } = req.body;
    let userId;
    
    // Handle different authentication methods
    if (req.user) {
      // JWT authenticated user
      userId = req.user.id;
    } else if (req.isCandidate && req.candidate) {
      // Candidate authenticated with access token
      // For candidates, we need to use the recruiter's ID as the user ID
      // since candidates are not users in the system
      userId = req.interview.recruiterId;
    } else {
      throw new ApiError('Authentication required', 401);
    }

    if (!title && content === undefined && isShared === undefined) {
      throw new ApiError('At least one field to update is required', 400);
    }

    const note = await noteService.updateNote(
      noteId,
      { title, content, isShared },
      userId
    );
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a note
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deleteNote(req, res, next) {
  try {
    const { noteId } = req.params;
    let userId;
    
    // Handle different authentication methods
    if (req.user) {
      // JWT authenticated user
      userId = req.user.id;
    } else if (req.isCandidate && req.candidate) {
      // Candidate authenticated with access token
      // For candidates, we need to use the recruiter's ID as the user ID
      // since candidates are not users in the system
      userId = req.interview.recruiterId;
    } else {
      throw new ApiError('Authentication required', 401);
    }

    await noteService.deleteNote(noteId, userId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

/**
 * Get note edit history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getNoteHistory(req, res, next) {
  try {
    const { noteId } = req.params;
    const history = await noteService.getNoteHistory(noteId);
    res.status(200).json(history);
  } catch (error) {
    next(error);
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
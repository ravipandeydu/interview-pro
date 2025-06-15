/**
 * Note Routes
 *
 * This module defines the routes for note-related operations.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import express from 'express';
import noteController from '../controllers/note.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { combinedAuthenticate, checkInterviewAccess } from '../middlewares/combined-auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the note
 *         title:
 *           type: string
 *           description: The title of the note
 *         content:
 *           type: string
 *           description: The content of the note
 *         isShared:
 *           type: boolean
 *           description: Whether the note is shared with others
 *         interviewId:
 *           type: string
 *           description: The ID of the associated interview
 *         createdById:
 *           type: string
 *           description: The ID of the user who created the note
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the note was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the note was last updated
 *     NoteInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - interviewId
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the note
 *         content:
 *           type: string
 *           description: The content of the note
 *         isShared:
 *           type: boolean
 *           description: Whether the note is shared with others
 *         interviewId:
 *           type: string
 *           description: The ID of the associated interview
 *     NoteUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the note
 *         content:
 *           type: string
 *           description: The content of the note
 *         isShared:
 *           type: boolean
 *           description: Whether the note is shared with others
 */

/**
 * @swagger
 * /api/notes/interview/{interviewId}:
 *   get:
 *     summary: Get all notes for an interview
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interviewId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the interview
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/interview/:interviewId',
  combinedAuthenticate,
  checkInterviewAccess,
  noteController.getNotesByInterview
);

/**
 * @swagger
 * /api/notes/interview/{interviewId}/candidate/{accessToken}:
 *   get:
 *     summary: Get all notes for an interview using candidate access token
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: interviewId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the interview
 *       - in: path
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate access token
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/interview/:interviewId/candidate/:accessToken',
  combinedAuthenticate,
  checkInterviewAccess,
  noteController.getNotesByInterview
);

/**
 * @swagger
 * /api/notes/{noteId}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *     responses:
 *       200:
 *         description: Note details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get('/:noteId', combinedAuthenticate, noteController.getNoteById);

/**
 * @swagger
 * /api/notes/{noteId}/candidate/{accessToken}:
 *   get:
 *     summary: Get a note by ID using candidate access token
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *       - in: path
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate access token
 *     responses:
 *       200:
 *         description: Note details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get('/:noteId/candidate/:accessToken', combinedAuthenticate, noteController.getNoteById);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', combinedAuthenticate, noteController.createNote);

/**
 * @swagger
 * /api/notes/candidate/{accessToken}:
 *   post:
 *     summary: Create a new note using candidate access token
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/candidate/:accessToken', combinedAuthenticate, checkInterviewAccess, noteController.createNote);

/**
 * @swagger
 * /api/notes/{noteId}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteUpdateInput'
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.put('/:noteId', combinedAuthenticate, noteController.updateNote);

/**
 * @swagger
 * /api/notes/{noteId}/candidate/{accessToken}:
 *   put:
 *     summary: Update a note using candidate access token
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *       - in: path
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteUpdateInput'
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.put('/:noteId/candidate/:accessToken', combinedAuthenticate, noteController.updateNote);

/**
 * @swagger
 * /api/notes/{noteId}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *     responses:
 *       204:
 *         description: Note deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.delete('/:noteId', combinedAuthenticate, noteController.deleteNote);

/**
 * @swagger
 * /api/notes/{noteId}/candidate/{accessToken}:
 *   delete:
 *     summary: Delete a note using candidate access token
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *       - in: path
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate access token
 *     responses:
 *       204:
 *         description: Note deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.delete('/:noteId/candidate/:accessToken', combinedAuthenticate, noteController.deleteNote);

/**
 * @swagger
 * /api/notes/{noteId}/history:
 *   get:
 *     summary: Get note edit history
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *     responses:
 *       200:
 *         description: Note edit history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get('/:noteId/history', combinedAuthenticate, noteController.getNoteHistory);

/**
 * @swagger
 * /api/notes/{noteId}/history/candidate/{accessToken}:
 *   get:
 *     summary: Get note edit history using candidate access token
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the note
 *       - in: path
 *         name: accessToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Candidate access token
 *     responses:
 *       200:
 *         description: Note edit history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get('/:noteId/history/candidate/:accessToken', combinedAuthenticate, noteController.getNoteHistory);

export default router;
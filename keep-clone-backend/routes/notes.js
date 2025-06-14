const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust path if db.js is elsewhere (it's correct)

// GET /api/notes - Get all notes
router.get('/', async (req, res, next) => {
  try {
    const notes = await db.getAllNotes();
    res.json(notes);
  } catch (err) {
    next(err); // Pass errors to the default error handler
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || title.trim() === "") { // Added trim check
      return res.status(400).json({ error: 'Title is required and cannot be empty' });
    }
    const newNote = await db.createNote({ title, content });
    res.status(201).json(newNote);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id - Get a single note by ID
router.get('/:id', async (req, res, next) => {
  try {
    const note = await db.getNoteById(req.params.id);
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - Update a note by ID
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    // Optional: Add validation if title/content can be empty for update
    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({ error: 'Title cannot be empty' });
    }
    const updatedNote = await db.updateNote(req.params.id, { title, content });
    if (updatedNote) {
      res.json(updatedNote);
    } else {
      // This might happen if the note ID doesn't exist, or if updateNote returns undefined
      // when no fields were actually changed (depending on its implementation)
      const existingNote = await db.getNoteById(req.params.id);
      if (!existingNote) {
        return res.status(404).json({ error: 'Note not found' });
      }
      // If note exists but no fields were updated, return current note or 200 with updatedNote
      res.json(updatedNote);
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id - Delete a note by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const wasDeleted = await db.deleteNote(req.params.id);
    if (wasDeleted) {
      res.status(204).send(); // No content
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (err) {
    next(err);
  }
});

// Note: The basic error handling middleware from the prompt (router.use((err, req, res, next) => ...))
// is usually placed in server.js as a global error handler.
// If it were here, it would only catch errors from routes defined *above* it in this file.
// For this subtask, I will assume it's meant for server.js as per standard practice.

module.exports = router;

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
    const { title, content, latitude, longitude, radius, geofenceEnabled } = req.body; // Destructure new fields
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: 'Title is required and cannot be empty' });
    }
    // Basic validation for optional geo fields can be added here if needed.
    const newNote = await db.createNote({
      title,
      content,
      latitude,
      longitude,
      radius,
      geofenceEnabled
    });
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
    const { title, content, latitude, longitude, radius, geofenceEnabled } = req.body;

    const fieldsToUpdate = {};
    if (req.body.hasOwnProperty('title')) {
      if (title === null || (typeof title === 'string' && title.trim() === '')) {
        // Allow unsetting title if schema permits, or enforce non-empty if required
        // For now, let's prevent empty string title during update if title is provided
        return res.status(400).json({ error: 'Title, if provided for update, cannot be empty.' });
      }
      fieldsToUpdate.title = title;
    }
    if (req.body.hasOwnProperty('content')) fieldsToUpdate.content = content; // Allow empty string for content
    if (req.body.hasOwnProperty('latitude')) fieldsToUpdate.latitude = latitude; // Allow null
    if (req.body.hasOwnProperty('longitude')) fieldsToUpdate.longitude = longitude; // Allow null
    if (req.body.hasOwnProperty('radius')) fieldsToUpdate.radius = radius; // Allow null
    if (req.body.hasOwnProperty('geofenceEnabled')) {
      if (typeof geofenceEnabled !== 'boolean') {
        return res.status(400).json({ error: 'geofenceEnabled must be a boolean (true or false).' });
      }
      fieldsToUpdate.geofenceEnabled = geofenceEnabled;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    const updatedNote = await db.updateNote(req.params.id, fieldsToUpdate);

    if (updatedNote) {
      res.json(updatedNote);
    } else {
      // This means the note with req.params.id was not found by db.updateNote
      res.status(404).json({ error: 'Note not found.' });
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

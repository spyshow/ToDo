require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const noteRoutes = require('./routes/notes'); // Import note routes

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Keep Clone Backend!');
});

// Use the notes routes for any path starting with /api/notes
app.use('/api/notes', noteRoutes);

// Global error handling middleware (add this after all routes)
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err.stack);
  // If the error has a status, use it, otherwise default to 500
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Something went wrong!',
      // Optional: include stack trace in development
      // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }
  });
});

const startServer = async () => {
  try {
    await db.initDb();
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize database or start server:", err);
    process.exit(1);
  }
};

// The .catch here is good for unhandled promise rejections from startServer itself,
// though errors within startServer (like db.initDb or app.listen issues if they were async errors not caught inside)
// are handled by its own try/catch.
startServer().catch(err => {
  console.error("Fatal error during server startup:", err);
  process.exit(1);
});

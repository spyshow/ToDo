const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Notes table initialized successfully (or already exists).');

    const triggerQuery = `
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updatedAt = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS set_timestamp ON notes;
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON notes
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `;
    await pool.query(triggerQuery);
    console.log('UpdatedAt trigger set on notes table.');

  } catch (err) {
    console.error('Error initializing database table:', err.stack);
  }
};

const getAllNotes = async () => {
  const { rows } = await pool.query('SELECT * FROM notes ORDER BY updatedAt DESC');
  return rows;
};

const getNoteById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
  return rows[0];
};

const createNote = async ({ title, content }) => {
  const { rows } = await pool.query(
    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  );
  return rows[0];
};

const updateNote = async (id, { title, content }) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(title);
  }
  if (content !== undefined) {
    fields.push(`content = $${paramCount++}`);
    values.push(content);
  }

  if (fields.length === 0) {
    return getNoteById(id); // Or throw an error: new Error("No fields to update");
  }

  const queryText = `UPDATE notes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  values.push(id);

  const { rows } = await pool.query(queryText, values);
  return rows[0];
};

const deleteNote = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM notes WHERE id = $1', [id]);
  return rowCount > 0;
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
  pool,
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};

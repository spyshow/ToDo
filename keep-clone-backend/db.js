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
      updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      latitude DOUBLE PRECISION NULL,
      longitude DOUBLE PRECISION NULL,
      radius INTEGER NULL,
      geofenceEnabled BOOLEAN DEFAULT FALSE
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

const createNote = async (noteData) => {
  const { title, content, latitude, longitude, radius } = noteData;
  // Ensure geofenceEnabled is explicitly true or false. Default to false if not provided or not a boolean.
  const geofenceEnabled = typeof noteData.geofenceEnabled === 'boolean' ? noteData.geofenceEnabled : false;

  const queryText = `
    INSERT INTO notes (title, content, latitude, longitude, radius, geofenceEnabled)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [title, content, latitude, longitude, radius, geofenceEnabled];

  const { rows } = await pool.query(queryText, values);
  return rows[0];
};

const updateNote = async (id, fieldsToUpdate) => {
  const { title, content, latitude, longitude, radius } = fieldsToUpdate;
  // geofenceEnabled is handled slightly differently as we only want to update it if it's explicitly provided as a boolean
  const geofenceEnabledInput = fieldsToUpdate.geofenceEnabled;

  const settableFields = [];
  const values = [];
  let paramCount = 1;

  if (title !== undefined) {
    settableFields.push(`title = $${paramCount++}`);
    values.push(title);
  }
  if (content !== undefined) {
    settableFields.push(`content = $${paramCount++}`);
    values.push(content);
  }
  // For nullable fields like latitude, longitude, radius, allow them to be set to null
  if (fieldsToUpdate.hasOwnProperty('latitude')) {
    settableFields.push(`latitude = $${paramCount++}`);
    values.push(latitude); // This will be null if latitude in fieldsToUpdate is null
  }
  if (fieldsToUpdate.hasOwnProperty('longitude')) {
    settableFields.push(`longitude = $${paramCount++}`);
    values.push(longitude);
  }
  if (fieldsToUpdate.hasOwnProperty('radius')) {
    settableFields.push(`radius = $${paramCount++}`);
    values.push(radius);
  }
  // Only include geofenceEnabled in the update if it was explicitly passed as a boolean
  if (typeof geofenceEnabledInput === 'boolean') {
    settableFields.push(`geofenceEnabled = $${paramCount++}`);
    values.push(geofenceEnabledInput);
  }

  if (settableFields.length === 0) {
    // No valid fields to update, return current note or indicate no change
    return getNoteById(id);
  }

  // The trigger will automatically update `updatedAt`
  const queryText = `
    UPDATE notes
    SET ${settableFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
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

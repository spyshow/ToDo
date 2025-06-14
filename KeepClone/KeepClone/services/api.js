import { showToast } from '../utils/showToast'; // Adjust path if necessary, this should be correct

// Defines the base URL for the API.
const BASE_URL = 'http://localhost:3001/api';

// Helper function for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse error response as JSON
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON or other parsing error, create a generic error structure
      errorData = { error: { message: response.statusText || 'An unknown error occurred while parsing response' } };
    }

    const errorMessage = errorData?.error?.message || response.statusText || 'API request failed';

    // Show a global toast for the error
    showToast('error', 'API Error', errorMessage);

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData; // Attach full error data if available
    throw error; // Still throw error so components can react further if needed (e.g., stop loading indicators)
  }

  if (response.status === 204) { // No Content (e.g., after a successful DELETE)
    return null;
  }
  // Check if response has content before trying to parse as JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    // If not JSON, or no content (but not 204), return null or handle as appropriate
    return null;
  }
};

export const getAllNotesApi = async () => {
  const response = await fetch(`${BASE_URL}/notes`);
  return handleResponse(response);
};

export const createNoteApi = async (noteData) => {
  const response = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  return handleResponse(response);
};

export const getNoteByIdApi = async (noteId) => {
  const response = await fetch(`${BASE_URL}/notes/${noteId}`);
  return handleResponse(response);
};

export const updateNoteApi = async (noteId, noteData) => {
  const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  return handleResponse(response);
};

export const deleteNoteApi = async (noteId) => {
  const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

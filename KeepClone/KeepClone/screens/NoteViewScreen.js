import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Button,
  ActivityIndicator, Alert, Platform
} from 'react-native';
import { getNoteByIdApi, deleteNoteApi } from '../services/api';

const NoteViewScreen = (props) => {
  const { navigation, route } = props;
  const noteId = route.params?.noteId;

  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchNoteDetails = useCallback(async () => {
    if (!noteId) {
      setError("No note ID provided for viewing.");
      // Alert.alert("Error", "No note ID provided."); // Client-side, could keep if preferred, but setError is used
      return;
    }
    console.log(`Fetching details for note ID: ${noteId}`);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedNote = await getNoteByIdApi(noteId);
      if (fetchedNote) {
        setNote(fetchedNote);
      } else {
        setError("Note not found."); // This will be displayed in UI
        // Alert.alert("Error", "Note not found."); // Removed, rely on UI error display
      }
    } catch (err) {
      console.error("Error fetching note details:", err);
      const errorMessage = err.message || 'Failed to fetch note details.';
      setError(errorMessage); // Set error for UI display
      // Alert.alert('Error', errorMessage); // Removed, global toast handles API error
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNoteDetails();
  }, [fetchNoteDetails]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: note ? note.title : (isLoading ? 'Loading...' : 'View Note'),
    });
  }, [navigation, note, isLoading]);

  const handleDeleteNote = async () => {
    if (!note || !note.id) {
      Alert.alert("Error", "Cannot delete note: Note data is missing."); // Client-side check, keep Alert
      return;
    }

    Alert.alert( // Keep confirmation Alert
      "Delete Note",
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            setIsDeleting(true);
            setError(null);
            try {
              await deleteNoteApi(note.id);
              navigation.goBack();
            } catch (err) {
              console.error("Error deleting note:", err);
              const deleteErrorMessage = err.message || 'Failed to delete note.';
              setError(deleteErrorMessage); // Set error for potential inline UI display
              // Alert.alert('Error Deleting Note', deleteErrorMessage); // Removed, global toast handles API error
              setIsDeleting(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (isLoading && !note) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={{ marginTop: 10, color: '#2c3e50' }}>Loading note...</Text>
      </View>
    );
  }

  if (error && !note) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        {noteId && <Button title="Retry" onPress={fetchNoteDetails} color="#2c3e50" />}
        <Button title="Go Back" onPress={() => navigation.goBack()} color="#7f8c8d" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.centered}>
        <Text style={styles.messageTitle}>Note not available</Text>
        <Text style={styles.messageContent}>The note data could not be loaded or does not exist.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} color="#7f8c8d" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.titleDisplay}>{note.title}</Text>
      <Text style={styles.contentDisplay}>{note.content}</Text>

      {error && !isDeleting && <Text style={styles.errorText}>{error}</Text>}
      {/* Show error if not related to ongoing delete, as delete error toast is global */}


      <View style={[styles.buttonWrapper, isDeleting && styles.buttonDisabled]}>
        <Button
          title={isDeleting ? "Deleting..." : "Delete Note"}
          onPress={handleDeleteNote}
          disabled={isDeleting}
          color={Platform.OS === 'ios' ? '#fff' : (isDeleting ? '#fab1a0' : '#c0392b')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef0f2',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eef0f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageContent: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 20,
  },
  titleDisplay: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  contentDisplay: {
    fontSize: 18,
    lineHeight: 28,
    color: '#34495e',
    marginBottom: 30,
  },
  buttonWrapper: {
    marginTop: 'auto',
    paddingTop: 20,
    backgroundColor: Platform.OS === 'android' ? '#c0392b' : '#e74c3c',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: Platform.OS === 'android' ? '#fab1a0' : '#ff7675',
  },
});

export default NoteViewScreen;

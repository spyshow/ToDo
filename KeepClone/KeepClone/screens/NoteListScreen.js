import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Button, ActivityIndicator, Alert, Platform, RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAllNotesApi, deleteNoteApi } from '../services/api';

const NoteListScreen = (props) => {
  const navigation = useNavigation();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async (isPullToRefresh = false) => {
    console.log(`Fetching notes... (Refresh: ${isPullToRefresh})`);
    if (!isPullToRefresh) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const fetchedNotes = await getAllNotesApi();
      setNotes(fetchedNotes);
    } catch (err) {
      console.error("Error fetching notes:", err);
      const errorMessage = err.message || 'Failed to fetch notes.';
      setError(errorMessage);
      // Removed Alert.alert from here; global toast will handle it.
      // The local setError will allow UI to show "Retry" button.
      // if (!isPullToRefresh) {
      //    Alert.alert('Error Fetching Notes', errorMessage);
      // }
    } finally {
      if (!isPullToRefresh) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotes(false);
    }, [fetchNotes])
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotes(true);
    setIsRefreshing(false);
  }, [fetchNotes]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'My Notes',
      headerRight: () => (
        <View style={{ marginRight: 10 }}>
          <Button
            onPress={() => navigation.navigate('CreateNote')}
            title="Create"
            color={Platform.OS === 'ios' ? '#fff' : undefined}
          />
        </View>
      ),
    });
  }, [navigation]);

  const handleDelete = async (noteId) => {
    Alert.alert( // Keep confirmation Alert
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteNoteApi(noteId);
              await fetchNotes(false); // Refresh list after delete
            } catch (err) {
              console.error("Error deleting note:", err);
              // Removed Alert.alert for API error; global toast will handle.
              // setError might be useful if there's a specific UI for delete failure,
              // but for now, fetchNotes() will handle subsequent load errors if any.
              // setError(err.message || 'Failed to delete note.');
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => navigation.navigate('NoteView', { noteId: item.id })}
    >
      <View style={styles.itemContentContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.content && (
          <Text style={styles.itemContentSnippet} numberOfLines={2}>
            {item.content}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButtonContainer}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ListEmpty = () => (
    <View style={styles.centered}>
      {isLoading && !isRefreshing ? null :
        error ? (
          <>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Button title="Retry Fetching Notes" onPress={() => fetchNotes(false)} color="#2c3e50" />
          </>
        ) : (
          <>
            <Text style={styles.emptyText}>No notes yet.</Text>
            <Text style={styles.emptySubText}>Tap 'Create' in the header or pull down to refresh.</Text>
          </>
        )
      }
    </View>
  );

  if (isLoading && notes.length === 0 && !isRefreshing && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={{marginTop: 10, color: '#2c3e50'}}>Loading notes...</Text>
      </View>
    );
  }

  if (error && notes.length === 0 && !isLoading && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={() => fetchNotes(false)} color="#2c3e50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={notes.length > 0 ? styles.listContentContainer : styles.centered}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#2c3e50", "#3498db"]}
            tintColor={"#2c3e50"}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef0f2',
  },
  listContentContainer: {
    padding: 8,
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
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContentContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemContentSnippet: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  deleteButtonContainer: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default NoteListScreen;

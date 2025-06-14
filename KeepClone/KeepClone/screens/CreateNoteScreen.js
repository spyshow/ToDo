import React, { useState, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  KeyboardAvoidingView, ScrollView, Platform,
  ActivityIndicator, Alert
} from 'react-native';
import { createNoteApi } from '../services/api';

const CreateNoteScreen = (props) => {
  const { navigation } = props;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Create New Note',
    });
  }, [navigation]);

  const handleSaveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title cannot be empty.'); // Keep client-side validation alert
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createNoteApi({ title, content });
      navigation.goBack();
    } catch (err) {
      const errorMessage = err.data?.error?.message || err.message || 'Failed to save note.';
      setError(errorMessage); // Set error for inline display
      // Removed Alert.alert for API error; global toast will handle.
      // Alert.alert('Error Saving Note', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter note title"
          placeholderTextColor="#bdc3c7"
          editable={!isLoading}
        />
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.inputContent]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter note content"
          placeholderTextColor="#bdc3c7"
          multiline
          textAlignVertical="top"
          editable={!isLoading}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={[styles.buttonWrapper, isLoading && styles.buttonDisabled]}>
          <Button
            title={isLoading ? "Saving..." : "Save Note"}
            onPress={handleSaveNote}
            disabled={isLoading}
            color={Platform.OS === 'ios' ? (isLoading ? '#aaa': '#fff') : (isLoading ? '#a5d6a7' : '#27ae60')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  label: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe4ea',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 20,
    color: '#2c3e50',
  },
  inputContent: {
    minHeight: 150,
  },
  buttonWrapper: {
    marginTop: 20,
    backgroundColor: Platform.OS === 'android' ? '#27ae60' : '#2ecc71',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: Platform.OS === 'android' ? '#a5d6a7' : '#b0fab3',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default CreateNoteScreen;

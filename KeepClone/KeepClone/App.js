import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native'; // Ensure Platform is imported

import NoteListScreen from './screens/NoteListScreen';
import NoteViewScreen from './screens/NoteViewScreen';
import CreateNoteScreen from './screens/CreateNoteScreen';

import Toast from 'react-native-toast-message'; // Import Toast

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      {/* React.Fragment to allow NavigationContainer and Toast to be siblings */}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="NoteList"
          screenOptions={{
            headerStyle: { backgroundColor: Platform.OS === 'android' ? '#2c3e50' : '#34495e' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
          }}
        >
          <Stack.Screen name="NoteList" component={NoteListScreen} />
          <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
          <Stack.Screen name="NoteView" component={NoteViewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
      {/* Toast component rendered here overlays other content */}
    </>
  );
}

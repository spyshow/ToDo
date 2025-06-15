// KeepClone/KeepClone/utils/permissions.js
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications'; // Import Notifications
import { Alert, Linking, Platform } from 'react-native';

export const requestLocationPermissions = async () => {
  // Request Foreground Permission
  let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    Alert.alert(
      'Permission Denied',
      'Foreground location access is required to add location alerts. Please enable it in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
    return false;
  }

  // Explain and Request Background Permission
  // Check if already granted to avoid re-prompting unnecessarily if logic flow allows
  let { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
  if (backgroundStatus === 'granted') {
    console.log('Background location permission already granted.');
    return true; // Already granted
  }

  // Show rationale for background permission
  const rationaleAccepted = await new Promise((resolve) => {
    Alert.alert(
      'Background Location Needed',
      'This app uses background location to alert you about notes when you enter a specified area, even when the app is closed or not in use. This is essential for the location alert feature to work reliably.',
      [
        { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
        { text: 'Continue', onPress: () => resolve(true) }
      ]
    );
  });

  if (!rationaleAccepted) {
    Alert.alert(
      'Permission Denied',
      'Background location access is required for location alerts to work when the app is not active. You can enable it later in settings if you wish to use this feature.'
    );
    return false;
  }

  // Now request background permission
  ({ status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync());
  if (backgroundStatus !== 'granted') {
    Alert.alert(
      'Permission Denied',
      'Background location access was not granted. Location alerts may not work when the app is closed. Please enable it in settings to use this feature fully.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
    return false;
  }
  console.log('Background location permission granted.');
  return true; // Both granted
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync(); // Requests permission for alert, sound, badge
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permission Denied',
      'Notification permissions are required to show alerts for location-based reminders. Please enable them in settings if you wish to receive these alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
    return false;
  }

  // On Android, set a default channel if not already set (optional but good practice)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250], // Optional
      lightColor: '#FF231F7C', // Optional
    });
    console.log('Notification channel set for Android.');
  }

  console.log('Notification permissions granted.');
  return true;
};

// KeepClone/KeepClone/utils/showToast.js
import Toast from 'react-native-toast-message';

/**
 * Shows a toast message.
 * @param {string} type - 'success', 'error', 'info'
 * @param {string} text1 - The main message (title).
 * @param {string} [text2] - The secondary message (optional).
 */
export const showToast = (type, text1, text2) => {
  Toast.show({
    type: type, // 'success', 'error', 'info'
    text1: text1,
    text2: text2,
    position: 'bottom', // Or 'top'
    visibilityTime: 4000, // Duration in ms
    autoHide: true,
    // topOffset: 30, // Adjust if using position: 'top'
    // bottomOffset: 40, // Adjust if using position: 'bottom'
  });
};

// Example usage (don't run this here, just for illustration):
// showToast('error', 'Network Error', 'Could not connect to the server.');
// showToast('success', 'Note Saved!', 'Your note has been saved successfully.');

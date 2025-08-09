// React Native Firebase Configuration
// Note: This is for React Native, not web Firebase

// If you're using React Native Firebase (@react-native-firebase/app)
// Uncomment the following lines and install the package:
// npm install @react-native-firebase/app @react-native-firebase/auth

/*
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase for React Native
const app = initializeApp(firebaseConfig);

export { app, auth };
*/

// If you're NOT using Firebase in React Native, use this minimal config:
export const firebaseConfig = {
  // Placeholder config - replace with actual values when needed
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder", 
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder",
};

// Dummy exports to prevent import errors
export const app = null;
export const analytics = null;

// Note: Remove this file entirely if you're not using Firebase
// Or properly configure it with @react-native-firebase packages
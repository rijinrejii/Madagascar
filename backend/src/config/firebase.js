import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp = null;

const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error.message);
      console.log('⚠️ Firebase features will be disabled');
    }
  }
  return firebaseApp;
};

// Initialize Firebase
initializeFirebase();

export const messaging = firebaseApp ? admin.messaging() : null;
export const auth = firebaseApp ? admin.auth() : null;

export default admin;

// src/firebase/config.ts

// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // For Firestore database
import { getAuth } from 'firebase/auth';           // For Firebase Authentication
import { getStorage } from 'firebase/storage';       // For Firebase Storage

// Your web app's Firebase configuration
// IMPORTANT: Replace these placeholders with your actual project's configuration details.
// You can find these in your Firebase project console: Project settings -> Your apps -> Firebase SDK snippet (Config)
const firebaseConfig = {
  apiKey: "AIzaSyCMa1bsO0xTL6flFwACVEGADM7H8N10EIU",
  authDomain: "doc-pro-5e412.firebaseapp.com",
  projectId: "doc-pro-5e412",
  storageBucket: "doc-pro-5e412.appspot.com",
  messagingSenderId: "626249897853",
  appId: "1:626249897853:web:dddc875cc43aa6b2c15e14",
  measurementId: "G-928M9ZLXSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
// These exports allow you to import and use `auth`, `db`, and `storage`
// in other parts of your React application (e.g., `import { auth } from './firebase/config';`).
export const db = getFirestore(app);     // For Firestore database operations
export const auth = getAuth(app);       // For Firebase Authentication (user sign-in, sign-up, profile management)
export const storage = getStorage(app); // For Firebase Storage (file uploads like profile pictures)

// Optional: If you want to use other Firebase services (e.g., Realtime Database),
// import and export them here as well.
// import { getDatabase } from 'firebase/database';
// export const rtdb = getDatabase(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Export auth for authentication
export const auth = getAuth(app);

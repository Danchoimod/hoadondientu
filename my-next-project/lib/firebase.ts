// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvyvGPdqgT7ZWFJCqQ-ErF0jOdBMYQYu8",
  authDomain: "tracuudulieu-bfa8c.firebaseapp.com",
  projectId: "tracuudulieu-bfa8c",
  storageBucket: "tracuudulieu-bfa8c.firebasestorage.app",
  messagingSenderId: "798088355384",
  appId: "1:798088355384:web:f8c159f74cb5d0e11850cd",
  measurementId: "G-KRJS161LN4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { app, db };

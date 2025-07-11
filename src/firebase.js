// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Deine Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCS7Q0h6-Pc-kB1Dqa-WlB2LdaLnl4zaY4",
  authDomain: "bau-vision25.firebaseapp.com",
  projectId: "bau-vision25",
  storageBucket: "bau-vision25.firebasestorage.app",
  messagingSenderId: "399020543777",
  appId: "1:399020543777:web:a9fa20f03007cbf0043860",
  measurementId: "G-138WN9NWSH"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Auth und Firestore exportieren
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

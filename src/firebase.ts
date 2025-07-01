import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Replace this with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyBoxtiXhBxRXCY5HcKJK11NT6r3gvGq-74",
  authDomain: "whiskly.firebaseapp.com",
  projectId: "whiskly",
  storageBucket: "whiskly.firebasestorage.app",
  messagingSenderId: "277617420467",
  appId: "1:277617420467:web:2dc1ef4d8b01b299c8e8c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore reference
export const db = getFirestore(app);

// Export Firebase app
export default db;
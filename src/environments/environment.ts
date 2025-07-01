import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
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


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
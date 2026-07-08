// ============================================
// Firebase Configuration
// ============================================
// Get these values from: console.firebase.google.com
// → Project Settings → Your Apps → Web App
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBOsUDCInb0QoI7n9AhLqtxdZcA-FhA3Y",
  authDomain: "ililbb-70fb0.firebaseapp.com",
  projectId: "ililbb-70fb0",
  storageBucket: "ililbb-70fb0.firebasestorage.app",
  messagingSenderId: "1059355688483",
  appId: "1:1059355688483:web:a71b5f3bc4fb31ee86fb96",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

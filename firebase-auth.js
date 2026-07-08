// ============================================
// Firebase Authentication Helpers
// ============================================

import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

// Sign up with email & password
export async function signUp(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Sign in with email & password
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Sign out
export async function logOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Listen to auth state changes
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// ============================================
// Cloud Firestore Helpers
// ============================================

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Create a document (auto-ID)
export async function createDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get a single document by ID
export async function getDocument(collectionName, docId) {
  try {
    const docSnap = await getDoc(doc(db, collectionName, docId));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Document not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all documents in a collection
export async function getAllDocuments(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, data: docs };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Query documents by field
export async function queryDocuments(collectionName, field, operator, value) {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, data: docs };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update a document
export async function updateDocument(collectionName, docId, data) {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete a document
export async function deleteDocument(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Real-time listener on a collection
export function subscribeToCollection(collectionName, callback) {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

// Real-time listener on a single document
export function subscribeToDocument(collectionName, docId, callback) {
  return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
}

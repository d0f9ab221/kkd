// ============================================
// Firebase Storage Helpers
// ============================================

import { storage } from './firebase-config.js';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Upload a file (simple)
export async function uploadFile(file, path) {
  try {
    const storageRef = ref(storage, path || `uploads/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL, path: snapshot.ref.fullPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Upload a file with progress tracking
export function uploadFileWithProgress(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path || `uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject({ success: false, error: error.message }),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ success: true, url: downloadURL, path: uploadTask.snapshot.ref.fullPath });
      }
    );
  });
}

// Get download URL for a file
export async function getFileURL(path) {
  try {
    const url = await getDownloadURL(ref(storage, path));
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete a file
export async function deleteFile(path) {
  try {
    await deleteObject(ref(storage, path));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// List all files in a folder
export async function listFiles(folderPath) {
  try {
    const result = await listAll(ref(storage, folderPath));
    const items = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, path: itemRef.fullPath, url };
      })
    );
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

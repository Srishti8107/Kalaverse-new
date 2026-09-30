// src/services/firebase.js
// Firebase configuration and Firestore helper functions

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────
// 🔥 IMPORTANT: Replace the values below with your own Firebase
//    project credentials from https://console.firebase.google.com
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────

/**
 * Create a new user document in Firestore.
 * @param {{ name: string, role: 'Expert'|'Learner', bio?: string, expertise?: string, contact?: { mobile?: string, email?: string } }} userData
 * @returns {Promise<string>} The new document ID
 */
export async function createUser(userData) {
  const docRef = await addDoc(collection(db, 'users'), {
    name: userData.name,
    role: userData.role,
    bio: userData.bio || '',
    expertise: userData.expertise || '',
    contact: {
      mobile: userData.contact?.mobile || '',
      email: userData.contact?.email || '',
    },
    photoUrl: userData.photoUrl || '',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Fetch a single user document by ID.
 * @param {string} userId
 * @returns {Promise<{ id: string } & Object | null>}
 */
export async function getUserById(userId) {
  const docRef = doc(db, 'users', userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Fetch all users with the role 'Expert'.
 * @returns {Promise<Array>}
 */
export async function getExperts() {
  const q = query(collection(db, 'users'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.role === 'Expert');
}

/**
 * Update a user document by ID.
 * @param {string} userId
 * @param {Object} updates
 */
export async function updateUser(userId, updates) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, updates);
}

// ─────────────────────────────────────────────────────────────
// POSTS
// ─────────────────────────────────────────────────────────────

/**
 * Create a new post in the `posts` collection.
 * @param {{ authorId: string, authorName: string, role: string, content: string, mediaUrl?: string }} postData
 * @returns {Promise<string>} The new document ID
 */
export async function createPost(postData) {
  const docRef = await addDoc(collection(db, 'posts'), {
    authorId: postData.authorId,
    authorName: postData.authorName,
    role: postData.role,
    content: postData.content,
    mediaUrl: postData.mediaUrl || '',
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Fetch all posts, ordered by timestamp descending (newest first).
 * @returns {Promise<Array>}
 */
export async function getPosts() {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

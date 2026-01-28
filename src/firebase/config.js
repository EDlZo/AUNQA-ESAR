// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase config สำหรับโปรเจค aunqa-esar
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // ต้องได้จาก Firebase Console
  authDomain: "aunqa-esar.firebaseapp.com",
  projectId: "aunqa-esar",
  storageBucket: "aunqa-esar.appspot.com",
  messagingSenderId: "123456789", // ต้องได้จาก Firebase Console
  appId: "1:123456789:web:xxxxxxxxxxxxxxxxxx" // ต้องได้จาก Firebase Console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
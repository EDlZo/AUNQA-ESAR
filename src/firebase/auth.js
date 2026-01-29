// Firebase Authentication
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config.js';
import { usersAPI } from './firestore.js';

export const authAPI = {
  // Sign in with email and password
  async signIn(email, password, role) {
    try {
      // Map role to role_id
      const roleMapping = {
        'system_admin': 1,
        'sar_manager': 2,
        'reporter': 3,
        'evaluator': 4,
        'external_evaluator': 5,
        'executive': 6,
        'qa_admin': 7
      };

      const roleId = roleMapping[role];
      if (!roleId) {
        return { success: false, error: 'บทบาทไม่ถูกต้อง' };
      }

      // Authenticate with Firestore (custom logic)
      const result = await usersAPI.authenticate(email, password, roleId);

      if (result.success) {
        // Optional: Sign in with Firebase Auth for session management
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          // If Firebase Auth fails, still return success from Firestore auth
          console.warn('Firebase Auth failed, but Firestore auth succeeded:', authError);
        }

        return { success: true, user: result.user };
      }

      return { success: false, error: 'ชื่อผู้ใช้ รหัสผ่าน หรือ Role ไม่ถูกต้อง' };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign up (create new user)
  async signUp(email, password, userData) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      if (userData.name) {
        await updateProfile(user, {
          displayName: userData.name
        });
      }

      // Create user document in Firestore
      const userDoc = {
        email: email,
        name: userData.name || '',
        role_id: userData.role_id || 3, // default to reporter
        password: password, // Note: In production, don't store plain passwords
        created_at: new Date()
      };

      // You would typically create the user document here
      // await firestoreAPI.create(COLLECTIONS.USERS, userDoc);

      return { success: true, user: { uid: user.uid, email: user.email, ...userDoc } };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};
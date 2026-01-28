// Firestore database operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config.js';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  ASSESSMENT_SESSIONS: 'assessment_sessions',
  QUALITY_COMPONENTS: 'quality_components',
  INDICATORS: 'indicators',
  EVALUATIONS: 'evaluations',
  EVALUATIONS_ACTUAL: 'evaluations_actual',
  COMMITTEE_EVALUATIONS: 'committee_evaluations'
};

// Generic CRUD operations
export const firestoreAPI = {
  // Create document
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating document:', error);
      return { success: false, error: error.message };
    }
  },

  // Read all documents
  async getAll(collectionName, conditions = []) {
    try {
      let q = collection(db, collectionName);
      
      // Apply conditions
      conditions.forEach(condition => {
        if (condition.type === 'where') {
          q = query(q, where(condition.field, condition.operator, condition.value));
        } else if (condition.type === 'orderBy') {
          q = query(q, orderBy(condition.field, condition.direction || 'asc'));
        } else if (condition.type === 'limit') {
          q = query(q, limit(condition.value));
        }
      });

      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: documents };
    } catch (error) {
      console.error('Error getting documents:', error);
      return { success: false, error: error.message };
    }
  },

  // Read single document
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error: error.message };
    }
  },

  // Update document
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updated_at: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete document
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }
};

// Specific operations for each collection
export const usersAPI = {
  async authenticate(email, password, roleId) {
    const result = await firestoreAPI.getAll(COLLECTIONS.USERS, [
      { type: 'where', field: 'email', operator: '==', value: email },
      { type: 'where', field: 'password', operator: '==', value: password },
      { type: 'where', field: 'role_id', operator: '==', value: roleId }
    ]);
    
    if (result.success && result.data.length > 0) {
      return { success: true, user: result.data[0] };
    }
    return { success: false, error: 'Invalid credentials' };
  }
};

export const assessmentSessionsAPI = {
  async create(sessionData) {
    return await firestoreAPI.create(COLLECTIONS.ASSESSMENT_SESSIONS, sessionData);
  },

  async getById(id) {
    return await firestoreAPI.getById(COLLECTIONS.ASSESSMENT_SESSIONS, id);
  }
};

export const qualityComponentsAPI = {
  async getByMajor(majorName) {
    return await firestoreAPI.getAll(COLLECTIONS.QUALITY_COMPONENTS, [
      { type: 'where', field: 'major_name', operator: '==', value: majorName },
      { type: 'orderBy', field: 'created_at', direction: 'desc' }
    ]);
  },

  async create(componentData) {
    return await firestoreAPI.create(COLLECTIONS.QUALITY_COMPONENTS, componentData);
  },

  async update(id, componentData) {
    return await firestoreAPI.update(COLLECTIONS.QUALITY_COMPONENTS, id, componentData);
  },

  async delete(id) {
    return await firestoreAPI.delete(COLLECTIONS.QUALITY_COMPONENTS, id);
  }
};

export const indicatorsAPI = {
  async getByComponent(componentId, majorName) {
    return await firestoreAPI.getAll(COLLECTIONS.INDICATORS, [
      { type: 'where', field: 'component_id', operator: '==', value: componentId },
      { type: 'where', field: 'major_name', operator: '==', value: majorName },
      { type: 'orderBy', field: 'sequence' }
    ]);
  },

  async create(indicatorData) {
    return await firestoreAPI.create(COLLECTIONS.INDICATORS, indicatorData);
  },

  async getById(id) {
    return await firestoreAPI.getById(COLLECTIONS.INDICATORS, id);
  },

  async delete(id) {
    return await firestoreAPI.delete(COLLECTIONS.INDICATORS, id);
  }
};

export const evaluationsAPI = {
  async create(evaluationData) {
    return await firestoreAPI.create(COLLECTIONS.EVALUATIONS, evaluationData);
  },

  async getBySession(sessionId, majorName) {
    return await firestoreAPI.getAll(COLLECTIONS.EVALUATIONS, [
      { type: 'where', field: 'session_id', operator: '==', value: sessionId },
      { type: 'where', field: 'major_name', operator: '==', value: majorName },
      { type: 'orderBy', field: 'created_at', direction: 'desc' }
    ]);
  },

  async getByComponent(componentId, sessionId, majorName) {
    return await firestoreAPI.getAll(COLLECTIONS.EVALUATIONS, [
      { type: 'where', field: 'component_id', operator: '==', value: componentId },
      { type: 'where', field: 'session_id', operator: '==', value: sessionId },
      { type: 'where', field: 'major_name', operator: '==', value: majorName }
    ]);
  }
};

export const evaluationsActualAPI = {
  async create(evaluationData) {
    return await firestoreAPI.create(COLLECTIONS.EVALUATIONS_ACTUAL, evaluationData);
  },

  async getBySession(sessionId, majorName) {
    return await firestoreAPI.getAll(COLLECTIONS.EVALUATIONS_ACTUAL, [
      { type: 'where', field: 'session_id', operator: '==', value: sessionId },
      { type: 'where', field: 'major_name', operator: '==', value: majorName },
      { type: 'orderBy', field: 'created_at', direction: 'desc' }
    ]);
  }
};

export const committeeEvaluationsAPI = {
  async create(evaluationData) {
    return await firestoreAPI.create(COLLECTIONS.COMMITTEE_EVALUATIONS, evaluationData);
  },

  async update(id, evaluationData) {
    return await firestoreAPI.update(COLLECTIONS.COMMITTEE_EVALUATIONS, id, evaluationData);
  },

  async getByIndicator(indicatorId, majorName, sessionId) {
    return await firestoreAPI.getAll(COLLECTIONS.COMMITTEE_EVALUATIONS, [
      { type: 'where', field: 'indicator_id', operator: '==', value: indicatorId },
      { type: 'where', field: 'major_name', operator: '==', value: majorName },
      { type: 'where', field: 'session_id', operator: '==', value: sessionId }
    ]);
  }
};
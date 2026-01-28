// Firebase Storage operations
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from './config.js';

export const storageAPI = {
  // Upload file
  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: snapshot.ref.fullPath,
        name: snapshot.ref.name
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload multiple files
  async uploadFiles(files, basePath) {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${Date.now()}-${index}-${file.name}`;
        const filePath = `${basePath}/${fileName}`;
        return await this.uploadFile(file, filePath);
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: failed.length === 0,
        successful,
        failed,
        total: files.length
      };
    } catch (error) {
      console.error('Error uploading files:', error);
      return { success: false, error: error.message };
    }
  },

  // Get download URL
  async getDownloadURL(path) {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return { success: true, url };
    } catch (error) {
      console.error('Error getting download URL:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete file
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  },

  // List files in directory
  async listFiles(path) {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url
          };
        })
      );

      return { success: true, files };
    } catch (error) {
      console.error('Error listing files:', error);
      return { success: false, error: error.message };
    }
  }
};

// Helper functions for specific file types
export const evidenceFilesAPI = {
  async uploadEvidenceFiles(files, sessionId, indicatorId) {
    const basePath = `evidence/${sessionId}/${indicatorId}`;
    return await storageAPI.uploadFiles(files, basePath);
  },

  async getEvidenceFiles(sessionId, indicatorId) {
    const path = `evidence/${sessionId}/${indicatorId}`;
    return await storageAPI.listFiles(path);
  },

  async deleteEvidenceFile(sessionId, indicatorId, fileName) {
    const path = `evidence/${sessionId}/${indicatorId}/${fileName}`;
    return await storageAPI.deleteFile(path);
  }
};
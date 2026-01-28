// Custom React hooks for Firebase operations
import { useState, useEffect } from 'react';
import { 
  qualityComponentsAPI, 
  indicatorsAPI, 
  evaluationsAPI, 
  assessmentSessionsAPI 
} from '../firebase/firestore.js';
import { authAPI } from '../firebase/auth.js';
import { evidenceFilesAPI } from '../firebase/storage.js';

// Authentication hook
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authAPI.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const result = await authAPI.signIn(email, password, role);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, login, logout };
};

// Quality Components hook
export const useQualityComponents = (majorName) => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const result = await qualityComponentsAPI.getByMajor(majorName);
      if (result.success) {
        setComponents(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (majorName) {
      fetchComponents();
    }
  }, [majorName]);

  const addComponent = async (componentData) => {
    try {
      const result = await qualityComponentsAPI.create({
        ...componentData,
        major_name: majorName
      });
      if (result.success) {
        await fetchComponents(); // Refresh list
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateComponent = async (id, componentData) => {
    try {
      const result = await qualityComponentsAPI.update(id, componentData);
      if (result.success) {
        await fetchComponents(); // Refresh list
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteComponent = async (id) => {
    try {
      const result = await qualityComponentsAPI.delete(id);
      if (result.success) {
        await fetchComponents(); // Refresh list
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    components,
    loading,
    error,
    addComponent,
    updateComponent,
    deleteComponent,
    refetch: fetchComponents
  };
};

// Indicators hook
export const useIndicators = (componentId, majorName) => {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIndicators = async () => {
    if (!componentId) return;
    
    try {
      setLoading(true);
      const result = await indicatorsAPI.getByComponent(componentId, majorName);
      if (result.success) {
        setIndicators(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [componentId, majorName]);

  const addIndicator = async (indicatorData) => {
    try {
      const result = await indicatorsAPI.create({
        ...indicatorData,
        component_id: componentId,
        major_name: majorName
      });
      if (result.success) {
        await fetchIndicators(); // Refresh list
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteIndicator = async (id) => {
    try {
      const result = await indicatorsAPI.delete(id);
      if (result.success) {
        await fetchIndicators(); // Refresh list
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    indicators,
    loading,
    error,
    addIndicator,
    deleteIndicator,
    refetch: fetchIndicators
  };
};

// Evaluations hook
export const useEvaluations = (sessionId, majorName) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvaluations = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const result = await evaluationsAPI.getBySession(sessionId, majorName);
      if (result.success) {
        setEvaluations(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [sessionId, majorName]);

  const submitEvaluation = async (evaluationData, files = []) => {
    try {
      // Upload files first if any
      let fileUrls = [];
      if (files.length > 0) {
        const uploadResult = await evidenceFilesAPI.uploadEvidenceFiles(
          files, 
          sessionId, 
          evaluationData.indicator_id
        );
        if (uploadResult.success) {
          fileUrls = uploadResult.successful.map(f => f.url);
        }
      }

      // Submit evaluation with file URLs
      const result = await evaluationsAPI.create({
        ...evaluationData,
        session_id: sessionId,
        major_name: majorName,
        evidence_files: fileUrls
      });

      if (result.success) {
        await fetchEvaluations(); // Refresh list
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    evaluations,
    loading,
    error,
    submitEvaluation,
    refetch: fetchEvaluations
  };
};

// Assessment Session hook
export const useAssessmentSession = (sessionId) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        const result = await assessmentSessionsAPI.getById(sessionId);
        if (result.success) {
          setSession(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return { session, loading, error };
};
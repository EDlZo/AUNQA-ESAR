// Firebase-based// Dependencies
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

// Firebase Admin SDK
const admin = require('firebase-admin');

// Supabase Client
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'placeholder-key'
);

console.log('✅ Supabase client initialized');
console.log('📦 Bucket:', process.env.SUPABASE_BUCKET_NAME);

// Create uploads directory if it doesn't exist (only in non-Vercel environment)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!process.env.VERCEL && !fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('📁 Created uploads directory');
  } catch (err) {
    console.error('❌ Failed to create uploads directory:', err.message);
  }
}

// Initialize Firebase Admin with environment variables
let db = null;
let isFirebaseInitialized = false;

if (!admin.apps.length) {
  try {
    // Try to use environment variables first
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
      console.log('🔑 Using Firebase environment variables');
      console.log('📧 Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
      console.log('🆔 Project ID:', process.env.FIREBASE_PROJECT_ID);

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        // storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Commented out to force local storage
      });
      console.log('✅ Firebase Admin initialized with environment variables (local storage)');
      isFirebaseInitialized = true;
    } else {
      console.log('⚠️ Missing Firebase environment variables:');
      console.log('- FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
      console.log('- FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
      console.log('- FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);

      // Fallback to service account file (Only in development)
      if (process.env.NODE_ENV !== 'production' && fs.existsSync('./firebase-service-account.json')) {
        const serviceAccount = require('./firebase-service-account.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'aunqa-esar.appspot.com'
        });
        console.log('✅ Firebase Admin initialized with service account file');
        isFirebaseInitialized = true;
      } else {
        console.log('❌ Firebase Admin not initialized: Missing credentials and no service account file');
        console.log('🔄 Will use mock data for development');
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.log('🔄 Will use mock data for development');
  }
}

if (isFirebaseInitialized && admin.apps.length) {
  try {
    db = admin.firestore();
    console.log('✅ Firestore database initialized');
  } catch (error) {
    console.error('❌ Firestore initialization failed:', error);
    db = null;
  }
} else {
  console.log('❌ Firestore database not available - using mock data');
}

// Mock data for when Firebase is not available
const mockData = {
  programs: [
    { id: '1', levelId: '1', facultyId: '1', facultyName: 'คณะวิศวกรรมศาสตร์', majorId: '1', majorName: 'วิศวกรรมคอมพิวเตอร์' },
    { id: '2', levelId: '1', facultyId: '1', facultyName: 'คณะวิศวกรรมศาสตร์', majorId: '2', majorName: 'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)' }
  ],
  quality_components: [
    { id: '1', component_id: '2', quality_name: 'องค์ประกอบที่ 2 : ผลการดำเนินงานตามเกณฑ์ AUN-QA' }
  ],
  indicators: [
    { id: '1', component_id: '1', sequence: '2.1', indicator_name: 'ตัวบ่งชี้ตัวอย่าง', indicator_type: 'ผลลัพธ์', criteria_type: 'เชิงคุณภาพ' }
  ],
  evaluations: [],
  evaluations_actual: [],
  committee_evaluations: [],
  assessment_sessions: []
};

// Helper function to get mock data or real data
async function getData(collection, filters = {}) {
  // Normalize collection name
  const colMap = {
    'qualityComponents': 'quality_components',
    'evaluationsActual': 'evaluations_actual',
    'committeeEvaluations': 'committee_evaluations',
    'assessmentSessions': 'assessment_sessions'
  };
  const normalizedCollection = colMap[collection] || collection;

  if (db) {
    try {
      let query = db.collection(normalizedCollection);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Type handling for specific fields
          let finalValue = value;
          if ((key === 'component_id' || key === 'session_id' || key === 'indicator_id') && typeof value === 'string' && !isNaN(value)) {
            // For component_id we definitely want number
            // For session_id and indicator_id, we usually want string but some legacy might be numbers.
            // But we can only pick one. Let's stick with String for IDs as per our recent findings.
            // If it's component_id, force Number.
            if (key === 'component_id') finalValue = Number(value);
            else finalValue = String(value);
          }
          query = query.where(key, '==', finalValue);
        }
      });

      const snapshot = await query.get();
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Auto-retry/Smart Resolution if no results
      if (results.length === 0) {
        console.log(`🔍 [getData] 0 results for ${normalizedCollection}, attempting resolution...`);

        let retryNeeded = false;
        let retryFilters = { ...filters };

        // 1. Try Smart ID Resolution for indicator_id in evaluations_actual
        if (normalizedCollection === 'evaluations_actual' && filters.indicator_id) {
          try {
            const inputId = filters.indicator_id;
            // Case A: Input is Firestore Doc ID, database uses Legacy ID
            const indDoc = await db.collection('indicators').doc(String(inputId)).get();
            if (indDoc.exists && indDoc.data().id) {
              console.log(`🧠 [SmartID] Resolved Firestore ID ${inputId} to Legacy ID ${indDoc.data().id}`);
              retryFilters.indicator_id = String(indDoc.data().id);
              retryNeeded = true;
            } else {
              // Case B: Input is Legacy ID, database uses Firestore Doc ID (Try to find Doc ID)
              const indSnap = await db.collection('indicators').where('id', '==', isNaN(inputId) ? -1 : Number(inputId)).get();
              if (!indSnap.empty) {
                console.log(`🧠 [SmartID] Resolved Legacy ID ${inputId} to Firestore ID ${indSnap.docs[0].id}`);
                retryFilters.indicator_id = indSnap.docs[0].id;
                retryNeeded = true;
              }
            }
          } catch (e) { console.warn('[SmartID] Resolution error:', e.message); }
        }

        // If resolution helped, try searching again with resolved IDs but ORIGINAL types for others
        if (retryNeeded) {
          console.log(`🔄 Retrying with Smart ID:`, retryFilters);
          let retryQuery = db.collection(normalizedCollection);
          Object.entries(retryFilters).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              // Preserve type for non-ID fields if they exist
              retryQuery = retryQuery.where(key, '==', val);
            }
          });
          const retrySnapshot = await retryQuery.get();
          results = retrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (results.length > 0) return results;
        }

        // 2. If still no results, try aggressive type-swapping for all ID fields
        console.log(`🔄 Attempting type-swapping retry...`);
        retryFilters = { ...filters };
        let typeRetryNeeded = false;
        Object.entries(filters).forEach(([key, value]) => {
          if ((key === 'session_id' || key === 'indicator_id') && value !== undefined) {
            // If currently string, try number; if number, try string
            if (typeof value === 'string' && !isNaN(value) && value !== '') {
              retryFilters[key] = Number(value);
              typeRetryNeeded = true;
            } else if (typeof value === 'number') {
              retryFilters[key] = String(value);
              typeRetryNeeded = true;
            }
          }
        });

        if (typeRetryNeeded) {
          let typeQuery = db.collection(normalizedCollection);
          Object.entries(retryFilters).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              typeQuery = typeQuery.where(key, '==', val);
            }
          });
          const typeSnapshot = await typeQuery.get();
          results = typeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      }

      return results;
    } catch (error) {
      console.error(`Error fetching ${normalizedCollection}:`, error);
      return [];
    }
  } else {
    // Return mock data
    let data = mockData[normalizedCollection] || [];

    // Apply filters to mock data
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') { // Added value !== ''
        data = data.filter(item => {
          // Flexible type comparison for mock data
          // For session_id and indicator_id, allow comparison as both string and number
          if ((key === 'session_id' || key === 'indicator_id') && !isNaN(value)) {
            return String(item[key]) === String(value) || Number(item[key]) === Number(value);
          }
          return String(item[key]) === String(value);
        });
      }
    });

    return data;
  }
}

// Helper function to add data
async function addData(collection, data) {
  // Normalize collection name
  const colMap = {
    'qualityComponents': 'quality_components',
    'evaluationsActual': 'evaluations_actual',
    'committeeEvaluations': 'committee_evaluations',
    'assessmentSessions': 'assessment_sessions'
  };
  const normalizedCollection = colMap[collection] || collection;

  if (db) {
    try {
      // Ensure component_id is Number if present
      const processedData = { ...data };
      if (processedData.component_id !== undefined && !isNaN(processedData.component_id)) {
        processedData.component_id = Number(processedData.component_id);
      }

      const docRef = await db.collection(normalizedCollection).add({
        ...processedData,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: docRef.id, success: true };
    } catch (error) {
      console.error(`Error adding to ${normalizedCollection}:`, error);
      return { success: false, error: error.message };
    }
  } else {
    // Mock success for development
    const mockId = Date.now().toString();
    return { id: mockId, success: true };
  }
}
// Disable Firebase Storage - using local file storage instead
const bucket = null;
console.log('📦 Using local file storage (Firebase Storage disabled)');

// Collections
const firebaseConfig = {
  apiKey: "AIzaSyA7hRJDJpixXHtSfYHapEqv9eePXoakLz8",
  authDomain: "aunqa-esar.firebaseapp.com",
  projectId: "aunqa-esar",
  storageBucket: "aunqa-esar.firebasestorage.app",
  messagingSenderId: "1043756688021",
  appId: "1:1043756688021:web:5172408a9000ca8e67319c",
  measurementId: "G-7T1KV7GPQG"
};

// Multer setup for temporary file handling (before uploading to Firebase Storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = os.tmpdir();
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalExt = path.extname(file.originalname);
    cb(null, uniqueSuffix + originalExt);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์ PDF และรูปภาพเท่านั้น'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));
console.log('📁 Serving uploads from:', UPLOADS_DIR);

// Debug middleware
app.use((req, res, next) => {
  console.log(`[REQ] [${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ================= FILE MANAGEMENT (Top Priority) =================
// Append files to latest actual evaluation
app.post('/api/evaluations-actual/append-files', upload.array('evidence_files', 10), async (req, res) => {
  try {
    console.log('➡️ [APPEND-FILES] Payload:', req.body);
    const { session_id, indicator_id, major_name, evidence_number, evidence_name } = req.body;

    if (!session_id || !indicator_id) {
      return res.status(400).json({ error: 'ต้องระบุ session_id และ indicator_id' });
    }

    // Find latest evaluation for this indicator/session
    console.log(`Searching for evaluations with session_id: ${session_id}, indicator_id: ${indicator_id}`);
    const evaluations = await getData('evaluationsActual', { session_id, indicator_id });
    console.log(`Found ${evaluations.length} evaluations`);

    evaluations.sort((a, b) => {
      const getT = (v) => v?.created_at?._seconds || v?.created_at?.seconds || 0;
      return getT(b) - getT(a);
    });

    let targetEval = evaluations[0];
    let isUpdate = true;

    if (!targetEval) {
      targetEval = {
        session_id,
        indicator_id,
        major_name,
        evidence_files_json: '[]',
        evidence_meta_json: '{}',
        status: 'submitted'
      };
      isUpdate = false;
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const evidenceFiles = JSON.parse(targetEval.evidence_files_json || '[]');
    const evidenceMeta = JSON.parse(targetEval.evidence_meta_json || '{}');

    for (const file of files) {
      evidenceFiles.push(file.filename);
      let publicUrl = null;
      try {
        const destination = `evidence_actual/${session_id}/${indicator_id}/${file.filename}`;
        publicUrl = await uploadFileToFirebase(file.path, destination);
      } catch (uploadError) { console.error(`Failed to upload ${file.filename}:`, uploadError); }

      evidenceMeta[file.filename] = {
        name: evidence_name || file.originalname,
        number: evidence_number || '1',
        url: publicUrl
      };
    }

    const updatedData = {
      ...targetEval,
      evidence_files_json: JSON.stringify(evidenceFiles),
      evidence_meta_json: JSON.stringify(evidenceMeta)
    };

    if (isUpdate) {
      await db.collection('evaluations_actual').doc(targetEval.id).update({
        evidence_files_json: updatedData.evidence_files_json,
        evidence_meta_json: updatedData.evidence_meta_json
      });
    } else {
      await addData('evaluationsActual', updatedData);
    }

    res.json({ success: true, files: evidenceFiles, meta: evidenceMeta });
  } catch (error) {
    console.error('Error appending files:', error);
    res.status(500).json({ error: 'เพิ่มไฟล์ไม่สำเร็จ', details: error.message });
  }
});

// Remove a single file from the latest actual evaluation
app.post('/api/evaluations-actual/remove-file', async (req, res) => {
  try {
    console.log('➡️ [REMOVE-FILE] Payload:', req.body);
    const { session_id, indicator_id, filename } = req.body;

    if (!session_id || !indicator_id || !filename) {
      return res.status(400).json({ error: 'ต้องระบุ session_id, indicator_id และ filename' });
    }

    console.log(`Searching for evaluations with session_id: ${session_id}, indicator_id: ${indicator_id}`);
    const evaluations = await getData('evaluationsActual', { session_id, indicator_id });
    console.log(`Found ${evaluations.length} evaluations`);

    evaluations.sort((a, b) => {
      const getT = (v) => v?.created_at?._seconds || v?.created_at?.seconds || 0;
      return getT(b) - getT(a);
    });

    const targetEval = evaluations[0];
    if (!targetEval) {
      console.log('❌ No evaluation found for this indicator/session');
      return res.status(404).json({ error: 'ไม่พบข้อมูลการประเมิน' });
    }

    console.log('✅ Found target evaluation:', targetEval.id);

    let evidenceFiles = JSON.parse(targetEval.evidence_files_json || '[]');
    let evidenceMeta = JSON.parse(targetEval.evidence_meta_json || '{}');
    const updatedFiles = evidenceFiles.filter(f => f !== filename);
    if (evidenceMeta[filename]) delete evidenceMeta[filename];

    await db.collection('evaluations_actual').doc(targetEval.id).update({
      evidence_files_json: JSON.stringify(updatedFiles),
      evidence_meta_json: JSON.stringify(evidenceMeta)
    });

    try {
      const storagePath = `evidence_actual/${session_id}/${indicator_id}/${filename}`;
      await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).remove([storagePath]);
    } catch (e) { console.warn('Supabase delete error:', e.message); }

    res.json({ success: true, files: updatedFiles });
  } catch (error) {
    console.error('Error removing file:', error);
    res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ', details: error.message });
  }
});

// Aliases for frontend typos
app.post('/api/evaluation_tual/remove-file', (req, res, next) => {
  req.url = '/api/evaluations-actual/remove-file';
  next();
});
app.post('/api/evaluation_tual/append-files', (req, res, next) => {
  req.url = '/api/evaluations-actual/append-files';
  next();
});

// Health check
app.get('/api/ping', (req, res) => {
  res.json({
    ok: true,
    pid: process.pid,
    cwd: process.cwd(),
    firebase: !!db,
    storage: !!bucket
  });
});

// ================= PROGRAMS =================
app.get('/api/programs', async (req, res) => {
  try {
    const programs = await getData('programs');
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลโปรแกรมได้', details: error.message });
  }
});

// ================= QUALITY COMPONENTS =================
app.get('/api/quality-components', async (req, res) => {
  try {
    if (!db) {
      // Use mock data when Firebase is not available
      const { session_id, major_name } = req.query || {};
      const components = await getData('qualityComponents', { major_name });
      return res.json(components);
    }

    const { session_id, major_name } = req.query || {};

    // Use simple query without complex ordering to avoid index requirements
    let query = db.collection('quality_components');

    if (major_name) {
      query = query.where('major_name', '==', major_name);
    }

    // Remove ordering to avoid index requirement
    // query = query.orderBy('created_at', 'desc');

    const snapshot = await query.get();
    const components = [];

    snapshot.forEach(doc => {
      components.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory instead
    components.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return b.created_at.seconds - a.created_at.seconds;
      }
      return 0;
    });

    res.json(components);
  } catch (error) {
    console.error('Error fetching quality components:', error);
    res.status(500).json({ error: 'ดึงองค์ประกอบไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/quality-components', async (req, res) => {
  try {
    const { quality_name, component_id, session_id, major_name } = req.body;

    const result = await addData('qualityComponents', {
      quality_name,
      component_id: parseInt(component_id),
      session_id,
      major_name
    });

    if (result.success) {
      res.json({ success: true, id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating quality component:', error);
    res.status(500).json({ error: 'ไม่สามารถสร้างองค์ประกอบคุณภาพได้', details: error.message });
  }
});

app.delete('/api/quality-components/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!db) return res.json({ success: true }); // Mock success

    await db.collection('quality_components').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quality component:', error);
    res.status(500).json({ error: 'ไม่สามารถลบองค์ประกอบคุณภาพได้', details: error.message });
  }
});

app.patch('/api/quality-components/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id; // Don't include ID in update

    if (!db) return res.json({ success: true }); // Mock success

    // Ensure component_id is Number if present
    if (updateData.component_id !== undefined && !isNaN(updateData.component_id)) {
      updateData.component_id = Number(updateData.component_id);
    }

    await db.collection('quality_components').doc(id).update({
      ...updateData,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating quality component:', error);
    res.status(500).json({ error: 'ไม่สามารถแก้ไของค์ประกอบคุณภาพได้', details: error.message });
  }
});

// ================= INDICATORS =================
app.get('/api/indicators', async (req, res) => {
  try {
    const { session_id, major_name, component_id } = req.query;
    const filters = {};
    if (component_id) filters.component_id = component_id;
    if (major_name) filters.major_name = major_name;

    const indicators = await getData('indicators', filters);

    // Sort indicators by sequence numerically (e.g., 2.1 < 2.10)
    indicators.sort((a, b) => {
      const seqA = String(a.sequence || '');
      const seqB = String(b.sequence || '');
      return seqA.localeCompare(seqB, undefined, { numeric: true, sensitivity: 'base' });
    });

    res.json(indicators);
  } catch (error) {
    console.error('Error fetching indicators:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลตัวบ่งชี้ได้', details: error.message });
  }
});

app.get('/api/indicators-by-component/:componentId', async (req, res) => {
  try {
    const { componentId } = req.params;
    const { session_id, major_name } = req.query;

    const indicators = await getData('indicators', {
      component_id: componentId,
      major_name
    });

    // Sort indicators by sequence numerically
    indicators.sort((a, b) => {
      const seqA = String(a.sequence || '');
      const seqB = String(b.sequence || '');
      return seqA.localeCompare(seqB, undefined, { numeric: true, sensitivity: 'base' });
    });

    res.json(indicators);
  } catch (error) {
    console.error('Error fetching indicators by component:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลตัวบ่งชี้ได้', details: error.message });
  }
});

app.post('/api/indicators', async (req, res) => {
  try {
    const { component_id, sequence, indicator_type, criteria_type, indicator_name, data_source, session_id, major_name } = req.body;

    const result = await addData('indicators', {
      component_id: parseInt(component_id),
      sequence,
      indicator_type,
      criteria_type,
      indicator_name,
      data_source,
      session_id,
      major_name
    });

    if (result.success) {
      res.json({ success: true, id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating indicator:', error);
    res.status(500).json({ error: 'ไม่สามารถสร้างตัวบ่งชี้ได้', details: error.message });
  }
});

app.delete('/api/indicators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!db) return res.json({ success: true });

    await db.collection('indicators').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting indicator:', error);
    res.status(500).json({ error: 'ไม่สามารถลบตัวบ่งชี้ได้', details: error.message });
  }
});

// ================= BULK OPERATIONS =================
app.get('/api/bulk/session-summary', async (req, res) => {
  try {
    if (!db) {
      // Use mock data when Firebase is not available
      const { session_id, major_name } = req.query;
      if (!major_name) return res.status(400).json({ error: 'กรุณาระบุ major_name' });

      console.log(`[BULK] Fetching session summary for major: ${major_name}, session: ${session_id} (using mock data)`);

      const [components, evaluations, evaluationsActual, committeeEvaluations, indicators] = await Promise.all([
        getData('qualityComponents', { major_name }),
        getData('evaluations', { session_id, major_name }),
        getData('evaluationsActual', { session_id, major_name }),
        getData('committeeEvaluations', { session_id, major_name }),
        getData('indicators', { major_name })
      ]);

      // Sort indicators by sequence numerically
      indicators.sort((a, b) => {
        const seqA = String(a.sequence || '');
        const seqB = String(b.sequence || '');
        return seqA.localeCompare(seqB, undefined, { numeric: true, sensitivity: 'base' });
      });

      return res.json({
        components,
        evaluations,
        evaluations_actual: evaluationsActual,
        committee_evaluations: committeeEvaluations,
        indicators
      });
    }

    const { session_id, major_name } = req.query;
    if (!major_name) return res.status(400).json({ error: 'กรุณาระบุ major_name' });

    console.log(`[BULK] Fetching session summary for major: ${major_name}, session: ${session_id}`);

    // Parallel fetch using Promise.all
    const [compSnap, evalSnap, evalActualSnap, commSnap, indSnap] = await Promise.all([
      db.collection('quality_components').where('major_name', '==', major_name).get(),
      session_id ? db.collection('evaluations').where('major_name', '==', major_name).where('session_id', '==', String(session_id)).get() : Promise.resolve({ docs: [] }),
      session_id ? db.collection('evaluations_actual').where('major_name', '==', major_name).where('session_id', '==', String(session_id)).get() : Promise.resolve({ docs: [] }),
      session_id ? db.collection('committee_evaluations').where('major_name', '==', major_name).where('session_id', '==', String(session_id)).get() : Promise.resolve({ docs: [] }),
      db.collection('indicators').where('major_name', '==', major_name).get()
    ]);

    const components = compSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const evaluations = evalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const evaluations_actual = evalActualSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const committee_evaluations = commSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const indicators = indSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort indicators
    indicators.sort((a, b) => {
      const seqA = String(a.sequence || '');
      const seqB = String(b.sequence || '');
      return seqA.localeCompare(seqB, undefined, { numeric: true, sensitivity: 'base' });
    });

    res.json({
      components,
      evaluations,
      evaluations_actual,
      committee_evaluations,
      indicators
    });
  } catch (error) {
    console.error('Error in session summary batch:', error);
    res.status(500).json({ error: 'ดึงข้อมูลสรุปไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/bulk/indicators', async (req, res) => {
  try {
    const { indicators } = req.body;

    if (!Array.isArray(indicators)) {
      return res.status(400).json({ error: 'ข้อมูลตัวบ่งชี้ต้องเป็น array' });
    }

    const results = [];
    for (const indicator of indicators) {
      const result = await addData('indicators', indicator);
      results.push(result);
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error bulk creating indicators:', error);
    res.status(500).json({ error: 'ไม่สามารถสร้างตัวบ่งชี้แบบกลุ่มได้', details: error.message });
  }
});

// ================= ASSESSMENT SESSIONS =================
app.post('/api/assessment-sessions', async (req, res) => {
  try {
    const { level_id, faculty_id, faculty_name, major_id, major_name, evaluator_id } = req.body;

    const result = await addData('assessmentSessions', {
      level_id,
      faculty_id,
      faculty_name,
      major_id,
      major_name,
      evaluator_id
    });

    if (result.success) {
      res.json({ success: true, session_id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating assessment session:', error);
    res.status(500).json({ error: 'ไม่สามารถสร้าง session ได้', details: error.message });
  }
});

app.get('/api/assessment-sessions/latest', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { major_name, evaluator_id } = req.query;
    if (!major_name) {
      return res.status(400).json({ error: 'major_name จำเป็น' });
    }

    console.log(`🔍 Looking for latest session for major: ${major_name}`);

    // Prefer finding sessions that ALREADY have evaluation data
    const evalSnap = await db.collection('evaluations_actual')
      .where('major_name', '==', major_name)
      .get();

    if (!evalSnap.empty) {
      const evals = evalSnap.docs.map(doc => doc.data());
      // Sort in-memory to avoid index requirement
      evals.sort((a, b) => {
        const getTime = (val) => {
          if (!val) return 0;
          if (val.seconds) return val.seconds * 1000;
          if (val._seconds) return val._seconds * 1000;
          if (val.toDate) return val.toDate().getTime();
          if (typeof val === 'string') return new Date(val).getTime();
          return 0;
        };
        return getTime(b.created_at) - getTime(a.created_at);
      });
      console.log(`✅ Found session with data: ${evals[0].session_id}`);
      return res.json({ session_id: String(evals[0].session_id) });
    }

    // Fallback to assessment_sessions if no evaluation data exists yet
    let query = db.collection('assessment_sessions')
      .where('major_name', '==', major_name);

    const snapshot = await query.get();
    if (snapshot.empty) {
      return res.json({ session_id: null });
    }

    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by created_at in memory
    sessions.sort((a, b) => {
      const getTime = (val) => {
        if (!val) return 0;
        if (val.seconds) return val.seconds * 1000;
        if (val._seconds) return val._seconds * 1000;
        if (typeof val === 'string') return new Date(val).getTime();
        return 0;
      };
      return getTime(b.created_at) - getTime(a.created_at);
    });

    res.json({ session_id: sessions[0].id });
  } catch (error) {
    console.error('Error fetching latest session:', error);
    res.status(500).json({ error: 'ดึงข้อมูลเซสชันล่าสุดไม่สำเร็จ', details: error.message });
  }
});

// Helper function to upload file to Supabase Storage
async function uploadFileToFirebase(localPath, destination) {
  try {
    // Read file from local path
    const fileBuffer = fs.readFileSync(localPath);
    const fileName = path.basename(destination);
    const filePath = destination;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .getPublicUrl(filePath);

    // Delete temp file
    try {
      fs.unlinkSync(localPath);
    } catch (e) {
      console.warn('Could not delete temp file:', e.message);
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
}

async function getLatestEvaluationActual(sessionId, indicatorId) {
  if (!db) return null;
  try {
    // Try both string and number for robust matching
    const sessionIds = [sessionId, parseInt(sessionId)].filter(v => v !== null && !isNaN(v));
    const indicatorIds = [indicatorId, parseInt(indicatorId)].filter(v => v !== null && !isNaN(v));

    let allDocs = [];
    for (const sid of sessionIds) {
      for (const iid of indicatorIds) {
        const snapshot = await db.collection('evaluations_actual')
          .where('session_id', '==', sid)
          .where('indicator_id', '==', iid)
          .get();
        snapshot.forEach(doc => allDocs.push({ id: doc.id, ...doc.data() }));
      }
    }

    if (allDocs.length === 0) return null;

    // Helper for robust timestamp comparison
    const getTime = (val) => {
      if (!val) return 0;
      if (val instanceof Date) return val.getTime();
      if (typeof val === 'string') return new Date(val).getTime();
      if (val && typeof val === 'object') {
        if (val.seconds) return val.seconds * 1000;
        if (val._seconds) return val._seconds * 1000;
        if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
      }
      return 0;
    };

    allDocs.sort((a, b) => getTime(b.created_at) - getTime(a.created_at));
    return allDocs[0];
  } catch (error) {
    console.error('Error in getLatestEvaluationActual:', error);
    return null;
  }
}

// ================= LOGIN =================
app.post('/api/login', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, message: 'Firebase not initialized' });
    }

    const { username, password, role } = req.body;
    console.log(`Login attempt: user=${username}, role=${role}`);

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
      return res.status(400).json({ success: false, message: 'บทบาทไม่ถูกต้อง' });
    }

    // Query Firestore
    const usersRef = db.collection('users');
    const query = usersRef
      .where('email', '==', username)
      .where('password', '==', password)
      .where('role_id', '==', roleId);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้ รหัสผ่าน หรือ Role ไม่ถูกต้อง'
      });
    }

    const userDoc = snapshot.docs[0];
    const userData = { id: userDoc.id, ...userDoc.data() };

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// ================= INDICATORS =================
app.get('/api/indicators/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const doc = await db.collection('indicators').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลตัวบ่งชี้' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching indicator:', error);
    res.status(500).json({ error: 'ดึงข้อมูลตัวบ่งชี้ไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/indicators', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const {
      component_id,
      sequence,
      indicator_type,
      criteria_type,
      indicator_name,
      data_source,
      session_id,
      major_name
    } = req.body || {};

    const indicatorData = {
      component_id,
      sequence,
      indicator_type,
      criteria_type,
      indicator_name,
      data_source: data_source || null,
      session_id: session_id || null,
      major_name: major_name || null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('indicators').add(indicatorData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating indicator:', error);
    res.status(500).json({ error: 'บันทึกข้อมูลตัวบ่งชี้ไม่สำเร็จ', details: error.message });
  }
});

app.delete('/api/indicators/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    await db.collection('indicators').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting indicator:', error);
    res.status(500).json({ error: 'ลบตัวบ่งชี้ไม่สำเร็จ', details: error.message });
  }
});

app.get('/api/indicators-by-component/:componentId', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { componentId } = req.params;
    const { session_id, major_name } = req.query || {};

    console.log(`🔍 Looking for indicators with component_id: ${componentId} (type: ${typeof componentId})`);

    // Try both string and number versions of component_id
    const queries = [
      db.collection('indicators').where('component_id', '==', componentId),
      db.collection('indicators').where('component_id', '==', parseInt(componentId)),
      db.collection('indicators').where('component_id', '==', componentId.toString())
    ];

    let allIndicators = [];

    for (const query of queries) {
      try {
        let currentQuery = query;

        if (major_name) {
          currentQuery = currentQuery.where('major_name', '==', major_name);
        }

        const snapshot = await currentQuery.get();
        snapshot.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          // Avoid duplicates
          if (!allIndicators.find(ind => ind.id === data.id)) {
            allIndicators.push(data);
          }
        });
      } catch (queryError) {
        console.log(`Query failed: ${queryError.message}`);
      }
    }

    // Sort in memory by sequence
    allIndicators.sort((a, b) => {
      const seqA = a.sequence || '';
      const seqB = b.sequence || '';
      return seqA.localeCompare(seqB);
    });

    console.log(`✅ Found ${allIndicators.length} indicators for component_id: ${componentId}`);

    res.json(allIndicators);
  } catch (error) {
    console.error('Error fetching indicators by component:', error);
    res.status(500).json({ error: 'ดึงตัวบ่งชี้ไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/bulk/indicators-by-components', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { component_ids, major_name } = req.body || {};
    if (!Array.isArray(component_ids)) {
      return res.status(400).json({ error: 'component_ids ต้องเป็นอาเรย์' });
    }

    // Firestore doesn't support 'IN' with more than 10-30 items depending on version
    // But we can fetch indicators and filter or do multiple queries
    // For simplicity and to avoid too many queries, let's fetch all indicators for the major
    // and then filter in memory if there are many components.

    let query = db.collection('indicators');
    if (major_name) {
      query = query.where('major_name', '==', major_name);
    }

    const snapshot = await query.get();
    const allIndicators = [];
    snapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      // Filter by component_ids in memory to handle type mismatches (string/number)
      if (component_ids.some(id => String(id) === String(data.component_id))) {
        allIndicators.push(data);
      }
    });

    // Sort by sequence
    allIndicators.sort((a, b) => {
      const seqA = String(a.sequence || '');
      const seqB = String(b.sequence || '');
      return seqA.localeCompare(seqB, undefined, { numeric: true, sensitivity: 'base' });
    });

    res.json(allIndicators);
  } catch (error) {
    console.error('Error in bulk indicators fetch:', error);
    res.status(500).json({ error: 'ดึงข้อมูลตัวบ่งชี้แบบกลุ่มไม่สำเร็จ' });
  }
});

// บันทึกตัวบ่งชี้แบบกลุ่ม (Batch Create)
app.post('/api/bulk/indicators', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
    const { indicators } = req.body;
    if (!Array.isArray(indicators) || indicators.length === 0) {
      return res.status(400).json({ error: 'indicators must be a non-empty array' });
    }

    console.log(`[BULK] Creating ${indicators.length} indicators`);

    const batch = db.batch();
    const results = [];
    const timestamp = new Date().toISOString();

    for (const item of indicators) {
      const docRef = db.collection('indicators').doc();
      const docData = {
        ...item,
        created_at: timestamp
      };
      batch.set(docRef, docData);
      results.push({ id: docRef.id, ...docData });
    }

    await batch.commit();
    res.json({ success: true, count: results.length, indicators: results });
  } catch (error) {
    console.error('Error in bulk indicators creation:', error);
    res.status(500).json({ error: 'บันทึกข้อมูลแบบกลุ่มไม่สำเร็จ', details: error.message });
  }
});

// ================= ASSESSMENT SESSIONS =================
app.post('/api/assessment-sessions', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { level_id, faculty_id, faculty_name, major_id, major_name, evaluator_id } = req.body || {};

    if (!level_id) {
      return res.status(400).json({ error: 'level_id จำเป็น' });
    }

    const sessionData = {
      level_id,
      faculty_id: faculty_id || null,
      faculty_name: faculty_name || null,
      major_id: major_id || null,
      major_name: major_name || null,
      evaluator_id: evaluator_id || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('assessment_sessions').add(sessionData);
    res.json({ success: true, session_id: docRef.id });
  } catch (error) {
    console.error('Error creating assessment session:', error);
    res.status(500).json({ error: 'สร้างเซสชันไม่สำเร็จ', details: error.message });
  }
});

app.get('/api/assessment-sessions/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const doc = await db.collection('assessment_sessions').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'ไม่พบเซสชัน' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching assessment session:', error);
    res.status(500).json({ error: 'ดึงเซสชันไม่สำเร็จ', details: error.message });
  }
});

// ================= EVALUATIONS =================
app.post('/api/evaluations', upload.single('evidence_file'), async (req, res) => {
  try {
    const {
      session_id,
      indicator_id,
      program_id,
      year,
      evaluator_id,
      score,
      target_value,
      comment,
      status,
      major_name
    } = req.body;

    let evidenceFileUrl = null;

    // Upload file to Firebase Storage if provided
    if (req.file && bucket) {
      try {
        const destination = `evidence/${session_id}/${indicator_id}/${req.file.filename}`;
        evidenceFileUrl = await uploadFileToFirebase(req.file.path, destination);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        // Continue without file if upload fails
      }
    }

    const evaluationData = {
      session_id: session_id || null,
      indicator_id: indicator_id || null,
      program_id: program_id || null,
      year: year || null,
      evaluator_id: evaluator_id || null,
      score: score ? parseFloat(score) : null,
      target_value: target_value || null,
      comment: comment || null,
      evidence_file_url: evidenceFileUrl,
      evidence_file_name: req.file ? req.file.originalname : null,
      status: status || 'submitted',
      major_name: major_name || null
    };

    const result = await addData('evaluations', evaluationData);

    if (result.success) {
      res.json({
        success: true,
        evaluation_id: result.id,
        evidence_file_url: evidenceFileUrl
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(500).json({ error: 'บันทึกผลประเมินไม่สำเร็จ', details: error.message });
  }
});

app.get('/api/evaluations', async (req, res) => {
  try {
    const { evaluator_id, program_id, year, component_id, session_id, major_name } = req.query;

    const filters = {};
    if (session_id) filters.session_id = session_id;
    if (major_name) filters.major_name = major_name;
    if (evaluator_id) filters.evaluator_id = parseInt(evaluator_id);

    const evaluations = await getData('evaluations', filters);
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการประเมินได้', details: error.message });
  }
});

app.get('/api/evaluations/history', async (req, res) => {
  try {
    const { session_id, major_name } = req.query;

    const filters = {};
    if (session_id) filters.session_id = session_id;
    if (major_name) filters.major_name = major_name;

    const evaluations = await getData('evaluations', filters);
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluation history:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงประวัติการประเมินได้', details: error.message });
  }
});

// ================= EVALUATIONS ACTUAL =================
app.post('/api/evaluations-actual', upload.array('evidence_files', 10), async (req, res) => {
  try {
    const { session_id, indicator_id, operation_result, operation_score, reference_score, goal_achievement, evidence_number, evidence_name, evidence_url, comment, major_name, status, keep_existing } = req.body;

    let evidenceFiles = [];
    let evidenceMeta = {};

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        evidenceFiles.push(file.filename);

        let publicUrl = null;
        try {
          // Upload to Supabase Storage
          const destination = `evidence_actual/${session_id}/${indicator_id}/${file.filename}`;
          publicUrl = await uploadFileToFirebase(file.path, destination);
        } catch (uploadError) {
          console.error(`Failed to upload ${file.filename} to Supabase:`, uploadError);
        }

        evidenceMeta[file.filename] = {
          name: evidence_name || file.originalname,
          number: evidence_number || '1',
          url: publicUrl // Save the Cloud Storage URL here
        };
      }
    }

    // Handle URL evidence
    if (evidence_url) {
      const urlKey = `url_${Date.now()}`;
      evidenceFiles.push(urlKey);
      evidenceMeta[urlKey] = {
        name: evidence_name || 'URL Evidence',
        number: evidence_number || '1',
        url: evidence_url
      };
    }

    const evaluationData = {
      session_id,
      indicator_id,
      operation_result,
      operation_score: operation_score ? parseFloat(operation_score) : null,
      reference_score: reference_score ? parseFloat(reference_score) : null,
      goal_achievement,
      evidence_files_json: JSON.stringify(evidenceFiles),
      evidence_meta_json: JSON.stringify(evidenceMeta),
      comment,
      major_name,
      status: status || 'submitted'
    };

    const result = await addData('evaluationsActual', evaluationData);

    if (result.success) {
      res.json({
        success: true,
        evaluation_id: result.id,
        evidence_files: evidenceFiles
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating actual evaluation:', error);
    res.status(500).json({ error: 'บันทึกผลการดำเนินงานไม่สำเร็จ', details: error.message });
  }
});

app.get('/api/evaluations-actual/history', async (req, res) => {
  try {
    const { session_id, major_name } = req.query;

    const filters = {};
    if (session_id) filters.session_id = session_id;
    if (major_name) filters.major_name = major_name;

    const evaluations = await getData('evaluationsActual', filters);
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching actual evaluation history:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงประวัติการดำเนินงานได้', details: error.message });
  }
});

// ================= COMMITTEE EVALUATIONS =================
app.post('/api/committee-evaluations', async (req, res) => {
  try {
    const { session_id, major_name, indicator_id, committee_score, strengths, improvements } = req.body;

    const evaluationData = {
      session_id,
      major_name,
      indicator_id,
      committee_score: committee_score ? parseFloat(committee_score) : null,
      strengths,
      improvements
    };

    const result = await addData('committeeEvaluations', evaluationData);

    if (result.success) {
      res.json({ success: true, id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating committee evaluation:', error);
    res.status(500).json({ error: 'บันทึกการประเมินของคณะกรรมการไม่สำเร็จ', details: error.message });
  }
});

// ================= FILE HANDLING =================
app.get('/api/view/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;

    // 1. Try to find the file in evaluations (Legacy/Simple)
    const evalSnap = await db.collection('evaluations')
      .where('evidence_file_name', '==', filename)
      .limit(1)
      .get();

    if (!evalSnap.empty && evalSnap.docs[0].data().evidence_file_url) {
      console.log(`🔗 Redirecting to evaluation URL for: ${filename}`);
      return res.redirect(evalSnap.docs[0].data().evidence_file_url);
    }

    // 2. Try to find the file in evaluations_actual (New system)
    // Since filenames are in a JSON array, we have to search slightly differently or find by meta
    // But filenames in evaluations_actual are often the 'key' in evidence_meta_json
    // Firestore doesn't support searching inside JSON keys easily, so we might need a broader query
    // or just assume if it's not in evaluations, it might be in actual.

    const actualSnap = await db.collection('evaluations_actual').get();
    for (const doc of actualSnap.docs) {
      const data = doc.data();
      const meta = data.evidence_meta_json ? JSON.parse(data.evidence_meta_json) : {};
      if (meta[filename] && meta[filename].url) {
        console.log(`🔗 Redirecting to actual evaluation URL for: ${filename}`);
        return res.redirect(meta[filename].url);
      }
    }

    // 3. Check if file exists locally in uploads directory as a fallback
    const publicLocalPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(publicLocalPath)) {
      return res.sendFile(publicLocalPath);
    }

    // 4. Search in Supabase Storage root as a last resort
    const { data: files } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .list('', { search: filename });

    if (files && files.length > 0) {
      const { data: { publicUrl } } = supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .getPublicUrl(files[0].name);
      return res.redirect(publicUrl);
    }

    // Also check the specific session/indicator structure in uploads if it was ever used locally
    // Our local structure often matches: uploads/evidence_actual/${session_id}/${indicator_id}/${file.filename}
    // But since we only have 'filename' here, we'd need to recursive search if we really wanted to be thorough locals.

    // For now, if not in root uploads, show the Cloud message
    res.status(404).send(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center; color: #333; line-height: 1.6;">
          <h2 style="color: #1d4ed8; margin-bottom: 20px;">หาไฟล์ไม่พบในระบบ Local</h2>
          <p>ลิงก์ที่คุณกำลังเปิดเป็นรูปแบบเก่า (Local Storage) และไฟล์นี้ไม่มีอยู่ใน Server เครื่องนี้แล้วครับ</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; display: inline-block; margin-top: 20px; text-align: left; max-width: 500px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <p style="font-weight: 700; color: #1e293b; margin-top: 0;">วิธีแก้ไข:</p>
            <ol style="margin-bottom: 0;">
              <li><strong>ไฟล์ที่เพิ่งอัปโหลด:</strong> โปรดกลับไปที่หน้า "สรุปผล" ระบบจะใช้ลิงก์จาก Cloud Storage ให้โดยอัตโนมัติ</li>
              <li><strong>ไฟล์เก่า:</strong> หากเป็นไฟล์ที่เคยอัปโหลดทิ้งไว้และหาไม่พบจริงๆ แนะนำให้ลองอัปโหลดใหม่อีกครั้งครับ ระบบใหม่จะเก็บไว้ใน Cloud ถาวรและปลอดภัยกว่าเดิมครับ</li>
            </ol>
          </div>
          
          <p style="margin-top: 30px; font-size: 0.85rem; color: #94a3b8; font-family: monospace;">
            Resource: ${filename}
          </p>
          <a href="javascript:history.back()" style="display: inline-block; margin-top: 20px; color: #3b82f6; text-decoration: none; font-weight: 500;">← ย้อนกลับ</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเรียกดูไฟล์' });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3002;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Firebase server running on port ${PORT}`);
    console.log('Note: Add Firebase service account key to enable full functionality');
  });
}

module.exports = app;
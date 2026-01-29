// Firebase-based// Dependencies
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Firebase Admin SDK
const admin = require('firebase-admin');

// Supabase Client
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('✅ Supabase client initialized');
console.log('📦 Bucket:', process.env.SUPABASE_BUCKET_NAME);

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Initialize Firebase Admin with environment variables
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
      } else {
        console.log('❌ Firebase Admin not initialized: Missing credentials and no service account file');
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
if (db) {
  console.log('✅ Firestore database initialized');
} else {
  console.log('❌ Firestore database not available');
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
    if (!fs.existsSync('temp-uploads')) {
      fs.mkdirSync('temp-uploads');
    }
    cb(null, 'temp-uploads/');
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
  console.log(`[REQ] ${req.method} ${req.path}`);
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

// ================= QUALITY COMPONENTS =================
app.get('/api/quality-components', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
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
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { componentId, qualityName, session_id, major_name } = req.body || {};

    if (!qualityName) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อองค์ประกอบ' });
    }

    const componentData = {
      component_id: componentId || null,
      quality_name: qualityName,
      session_id: session_id || null,
      major_name: major_name || null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('quality_components').add(componentData);

    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating quality component:', error);
    res.status(500).json({ error: 'บันทึกองค์ประกอบไม่สำเร็จ', details: error.message });
  }
});

app.delete('/api/quality-components/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    await db.collection('quality_components').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quality component:', error);
    res.status(500).json({ error: 'ลบองค์ประกอบไม่สำเร็จ', details: error.message });
  }
});

app.patch('/api/quality-components/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { componentId, qualityName } = req.body || {};

    const updateData = {
      component_id: componentId || null,
      quality_name: qualityName,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('quality_components').doc(req.params.id).update(updateData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating quality component:', error);
    res.status(500).json({ error: 'แก้ไของค์ประกอบไม่สำเร็จ', details: error.message });
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

// ดึงข้อมูลสรุปทั้งหมดในครั้งเดียว (Dashboard / Assessment / Summary)
app.get('/api/bulk/session-summary', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Firebase not initialized' });
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
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

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
      major_name: major_name || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('evaluations').add(evaluationData);

    res.json({
      success: true,
      evaluation_id: docRef.id,
      evidence_file_url: evidenceFileUrl
    });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(500).json({ error: 'บันทึกผลประเมินไม่สำเร็จ', details: error.message });
  }
});

app.get('/api/evaluations', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { evaluator_id, program_id, year, component_id, session_id, major_name } = req.query;

    // Use simple query without complex ordering
    let query = db.collection('evaluations');

    if (session_id) query = query.where('session_id', '==', session_id);
    if (major_name) query = query.where('major_name', '==', major_name);
    if (evaluator_id) query = query.where('evaluator_id', '==', parseInt(evaluator_id));

    // Remove complex ordering to avoid index requirement
    // query = query.orderBy('created_at', 'desc');

    const snapshot = await query.get();
    const evaluations = [];

    snapshot.forEach(doc => {
      evaluations.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory
    evaluations.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return b.created_at.seconds - a.created_at.seconds;
      }
      return 0;
    });

    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ error: 'ดึงข้อมูลการประเมินไม่สำเร็จ', details: error.message });
  }
});

// ================= FILE HANDLING =================
app.get('/api/view/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;

    // Search in Supabase Storage
    const { data: files, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .list('', {
        search: filename
      });

    // If not found in root, we might need a more complex search if folders are used
    // But since we have the public URL in metadata, the frontend should ideally use that

    // For now, let's try to get a list from frequent folders if root fails
    // However, Supabase list is not recursive. 

    // A better way is to just generate the public URL directly if we know the bucket structure
    // Our structure: evidence_actual/${session_id}/${indicator_id}/${file.filename}

    // Since we don't have session_id/indicator_id here, we can't easily guess the path
    // Let's rely on the frontend using the full URL from metadata

    // But for backward compatibility with existing hardcoded /api/view/:filename links:
    res.status(404).json({
      error: 'โปรดใช้ URL โดยตรงจากระบบ หรือระบุเลข Session/Indicator',
      note: 'ระบบเปลี่ยนไปใช้ Cloud Storage แล้ว ลิงก์แบบเดิมอาจไม่รองรับ'
    });
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเรียกดูไฟล์' });
  }
});

// ================= EVALUATIONS HISTORY =================
app.get('/api/evaluations/history', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { session_id, major_name } = req.query;

    let query = db.collection('evaluations');

    if (session_id) query = query.where('session_id', '==', session_id);
    if (major_name) query = query.where('major_name', '==', major_name);

    const snapshot = await query.get();
    const evaluations = [];

    snapshot.forEach(doc => {
      evaluations.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory
    evaluations.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return b.created_at.seconds - a.created_at.seconds;
      }
      return 0;
    });

    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations history:', error);
    res.status(500).json({ error: 'โหลดประวัติไม่สำเร็จ', details: error.message });
  }
});

// ================= EVALUATIONS ACTUAL HISTORY =================
app.get('/api/evaluations-actual/history', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { session_id, major_name } = req.query;

    let query = db.collection('evaluations_actual');

    if (session_id) query = query.where('session_id', '==', session_id);
    if (major_name) query = query.where('major_name', '==', major_name);

    const snapshot = await query.get();
    const evaluations = [];

    snapshot.forEach(doc => {
      evaluations.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory
    evaluations.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return b.created_at.seconds - a.created_at.seconds;
      }
      return 0;
    });

    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching actual evaluations history:', error);
    res.status(500).json({ error: 'โหลดประวัติการประเมินผลไม่สำเร็จ', details: error.message });
  }
});
app.post('/api/evaluations-actual', upload.array('evidence_files', 10), async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const {
      session_id,
      indicator_id,
      operation_result,
      operation_score,
      reference_score,
      goal_achievement,
      evidence_number,
      evidence_name,
      evidence_url,
      comment,
      major_name,
      status,
      keep_existing,
      evidence_numbers,
      evidence_names,
      evidence_urls
    } = req.body;

    console.log('========== EVALUATION SAVE REQUEST ==========');
    console.log('Received actual evaluation data:', {
      session_id, indicator_id, operation_result, major_name
    });
    console.log('Files received from multer:', req.files?.length || 0);
    console.log('evidence_numbers:', req.body.evidence_numbers);
    console.log('evidence_names:', req.body.evidence_names);
    console.log('evidence_urls:', req.body.evidence_urls);

    // Handle multiple file uploads to local storage
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      console.log('--- Starting file upload to local storage ---');
      for (const file of req.files) {
        console.log(`Processing file: ${file.originalname}, multer filename: ${file.filename}`);
        try {
          const destination = `evidence_actual/${session_id}/${indicator_id}/${file.filename}`;
          const publicUrl = await uploadFileToFirebase(file.path, destination);
          console.log(`✓ Saved to: ${publicUrl}`);
          uploadedFiles.push({
            filename: file.filename,
            originalname: file.originalname,
            url: publicUrl
          });
        } catch (uploadError) {
          console.error(`File upload error for ${file.originalname}:`, uploadError);
        }
      }
    }

    // Prepare metadata for current request
    let numbersParsed = [];
    let namesParsed = [];
    let urlsParsed = [];
    try { if (evidence_numbers) numbersParsed = JSON.parse(evidence_numbers); } catch (e) { }
    try { if (evidence_names) namesParsed = JSON.parse(evidence_names); } catch (e) { }
    try { if (evidence_urls) urlsParsed = JSON.parse(evidence_urls); } catch (e) { }

    let currentFiles = uploadedFiles.map(f => f.filename);
    let currentMeta = {};

    // 1. Assign meta to uploaded files
    uploadedFiles.forEach((f, i) => {
      currentMeta[f.filename] = {
        number: numbersParsed[i] || null,
        name: namesParsed[i] || null,
        url: f.url
      };
    });

    // 2. Handle URL-only entries
    const fileCount = req.files ? req.files.length : 0;
    for (let i = fileCount; i < numbersParsed.length || i < namesParsed.length || i < urlsParsed.length; i++) {
      const urlKey = `url_${i}_${namesParsed[i] || 'evidence'}`;
      currentMeta[urlKey] = {
        number: numbersParsed[i] || null,
        name: namesParsed[i] || null,
        url: urlsParsed[i] || null
      };
      currentFiles.push(urlKey);
    }

    let finalFiles = currentFiles;
    let finalMeta = currentMeta;

    // 3. Merge with existing if requested
    if (String(keep_existing).toLowerCase() === 'true') {
      const latest = await getLatestEvaluationActual(session_id, indicator_id);
      if (latest) {
        let prevFiles = [];
        let prevMeta = {};
        try {
          prevFiles = typeof latest.evidence_files_json === 'string'
            ? JSON.parse(latest.evidence_files_json || '[]')
            : (latest.evidence_files_json || []);
        } catch (e) { }
        try {
          prevMeta = typeof latest.evidence_meta_json === 'string'
            ? JSON.parse(latest.evidence_meta_json || '{}')
            : (latest.evidence_meta_json || {});
        } catch (e) { }

        // Filter out any duplicates if same filename survives (unlikely with multer hashes but good practice)
        finalFiles = [...new Set([...prevFiles, ...currentFiles])];
        finalMeta = { ...prevMeta, ...currentMeta };
      }
    }

    console.log('--- Constructed file data ---');
    console.log('uploadedFiles:', uploadedFiles);
    console.log('finalFiles array:', finalFiles);
    console.log('finalMeta object:', JSON.stringify(finalMeta, null, 2));

    const evaluationData = {
      session_id: session_id || null,
      indicator_id: indicator_id || null,
      operation_result: operation_result || null,
      operation_score: operation_score ? parseFloat(operation_score) : null,
      reference_score: reference_score ? parseFloat(reference_score) : null,
      goal_achievement: goal_achievement || null,
      evidence_number: evidence_number || null,
      evidence_name: evidence_name || null,
      evidence_url: evidence_url || null,
      comment: comment || null,
      evidence_file: finalFiles[0] || null,
      evidence_files_json: JSON.stringify(finalFiles),
      evidence_meta_json: JSON.stringify(finalMeta),
      status: status || 'submitted',
      major_name: major_name || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('--- Saving to Firestore ---');
    console.log('evidence_files_json:', evaluationData.evidence_files_json);
    console.log('evidence_meta_json:', evaluationData.evidence_meta_json);

    const docRef = await db.collection('evaluations_actual').add(evaluationData);
    console.log('✓ Saved to Firestore with ID:', docRef.id);
    console.log('========== END SAVE REQUEST ==========');
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error saving actual evaluation:', error);
    res.status(500).json({ error: 'บันทึกการประเมินผลไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/evaluations-actual/append-files', upload.array('evidence_files', 10), async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { session_id, indicator_id, major_name, evidence_numbers, evidence_names, evidence_urls } = req.body;

    if (!session_id || !indicator_id) {
      return res.status(400).json({ error: 'ต้องระบุ session_id และ indicator_id' });
    }

    // Find latest evaluation using index-free helper
    const latest = await getLatestEvaluationActual(session_id, indicator_id);
    let docId = null;
    let existingFiles = [];
    let existingMeta = {};

    if (latest) {
      docId = latest.id;
      try { existingFiles = JSON.parse(latest.evidence_files_json || '[]'); } catch (e) { }
      try { existingMeta = JSON.parse(latest.evidence_meta_json || '{}'); } catch (e) { }
    }

    // Upload new files
    const newFiles = [];
    let numbersParsed = [];
    let namesParsed = [];
    let urlsParsed = [];
    try { if (evidence_numbers) numbersParsed = JSON.parse(evidence_numbers); } catch (e) { }
    try { if (evidence_names) namesParsed = JSON.parse(evidence_names); } catch (e) { }
    try { if (evidence_urls) urlsParsed = JSON.parse(evidence_urls); } catch (e) { }

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const destination = `evidence_actual/${session_id}/${indicator_id}/${file.filename}`;
          const publicUrl = await uploadFileToFirebase(file.path, destination);
          newFiles.push(file.filename);
          existingMeta[file.filename] = {
            number: numbersParsed[i] || null,
            name: namesParsed[i] || null,
            url: publicUrl
          };
        } catch (uploadError) {
          console.error(`File upload error for ${file.originalname}:`, uploadError);
        }
      }
    }

    // Handle URL-only entries in append
    const fileCount = req.files ? req.files.length : 0;
    for (let i = fileCount; i < numbersParsed.length || i < namesParsed.length || i < urlsParsed.length; i++) {
      const urlKey = `url_${i}_${namesParsed[i] || 'evidence'}`;
      existingMeta[urlKey] = {
        number: numbersParsed[i] || null,
        name: namesParsed[i] || null,
        url: urlsParsed[i] || null
      };
      newFiles.push(urlKey);
    }

    const mergedFiles = [...new Set([...existingFiles, ...newFiles])];
    const updateData = {
      evidence_files_json: JSON.stringify(mergedFiles),
      evidence_meta_json: JSON.stringify(existingMeta),
      evidence_file: mergedFiles[0] || null,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    if (docId) {
      await db.collection('evaluations_actual').doc(docId).update(updateData);
      res.json({ success: true, id: docId, files: mergedFiles });
    } else {
      // Create new if not exists
      const newData = {
        ...updateData,
        session_id,
        indicator_id,
        major_name: major_name || null,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        status: 'submitted'
      };
      const newDoc = await db.collection('evaluations_actual').add(newData);
      res.json({ success: true, id: newDoc.id, files: mergedFiles });
    }
  } catch (error) {
    console.error('Error appending files:', error);
    res.status(500).json({ error: 'เพิ่มไฟล์ไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/evaluations-actual/remove-file', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { session_id, indicator_id, filename } = req.body;

    if (!session_id || !indicator_id || !filename) {
      return res.status(400).json({ error: 'ต้องระบุ session_id, indicator_id และ filename' });
    }

    // Find latest evaluation using index-free helper
    const latest = await getLatestEvaluationActual(session_id, indicator_id);
    if (!latest) {
      return res.status(404).json({ error: 'ไม่พบรายการที่ต้องการลบไฟล์' });
    }

    let files = [];
    let meta = {};
    try { files = JSON.parse(latest.evidence_files_json || '[]'); } catch (e) { }
    try { meta = JSON.parse(latest.evidence_meta_json || '{}'); } catch (e) { }

    const updatedFiles = files.filter(f => f !== filename);
    if (meta[filename]) delete meta[filename];

    await db.collection('evaluations_actual').doc(latest.id).update({
      evidence_files_json: JSON.stringify(updatedFiles),
      evidence_meta_json: JSON.stringify(meta),
      evidence_file: updatedFiles[0] || null,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Try to delete from Firebase Storage
    try {
      const destination = `evidence_actual/${session_id}/${indicator_id}/${filename}`;
      await bucket.file(destination).delete();
      console.log(`Deleted file from storage: ${destination}`);
    } catch (storageError) {
      console.warn(`Could not delete file from storage (it might have been deleted already): ${filename}`);
    }

    res.json({ success: true, files: updatedFiles });
  } catch (error) {
    console.error('Error removing file:', error);
    res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ', details: error.message });
  }
});

// ================= COMMITTEE EVALUATIONS =================
app.get('/api/committee-evaluations', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { indicator_id, major_name, session_id } = req.query;

    let query = db.collection('committee_evaluations');

    if (major_name) query = query.where('major_name', '==', major_name);
    if (session_id) query = query.where('session_id', '==', session_id);
    if (indicator_id) query = query.where('indicator_id', '==', indicator_id);

    const snapshot = await query.get();
    const evaluations = [];

    snapshot.forEach(doc => {
      evaluations.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory
    evaluations.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return b.created_at.seconds - a.created_at.seconds;
      }
      return 0;
    });

    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching committee evaluations:', error);
    res.status(500).json({ error: 'โหลดข้อมูลการประเมินกรรมการไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/committee-evaluations', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { indicator_id, major_name, session_id, committee_score, strengths, improvements } = req.body;

    if (!indicator_id || !major_name || !session_id) {
      return res.status(400).json({ error: 'กรุณาระบุข้อมูลที่จำเป็น' });
    }

    // Check if evaluation already exists
    const existingQuery = db.collection('committee_evaluations')
      .where('indicator_id', '==', indicator_id)
      .where('major_name', '==', major_name)
      .where('session_id', '==', session_id);

    const existingSnapshot = await existingQuery.get();

    if (!existingSnapshot.empty) {
      // Update existing evaluation
      const docId = existingSnapshot.docs[0].id;
      await db.collection('committee_evaluations').doc(docId).update({
        committee_score,
        strengths,
        improvements,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new evaluation
      await db.collection('committee_evaluations').add({
        indicator_id,
        major_name,
        session_id,
        committee_score,
        strengths,
        improvements,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ success: true, message: 'บันทึกการประเมินกรรมการเรียบร้อย' });
  } catch (error) {
    console.error('Error saving committee evaluation:', error);
    res.status(500).json({ error: 'บันทึกการประเมินกรรมการไม่สำเร็จ', details: error.message });
  }
});

// ================= INDICATOR DETAIL =================
app.get('/api/indicator-detail', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { indicator_id } = req.query || {};
    if (!indicator_id) return res.status(400).json({ error: 'indicator_id จำเป็น' });

    const doc = await db.collection('indicators').doc(indicator_id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'ไม่พบตัวบ่งชี้' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching indicator detail:', error);
    res.status(500).json({ error: 'ดึงข้อมูลตัวบ่งชี้ไม่สำเร็จ', details: error.message });
  }
});

app.post('/api/bulk/indicator-details', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { indicator_ids } = req.body || {};
    if (!Array.isArray(indicator_ids) || indicator_ids.length === 0) {
      return res.json({}); // Return empty map if no IDs
    }

    // Firestore doesn't support 'IN' with more than 10-30 IDs.
    // If there are many IDs, we can fetch all and filter, or do multiple queries.
    // For indicator details, they are usually in the same major, so we can fetch all indicators for a major if major_name is provided,
    // or fetch by ID if there are few.

    // Let's use get() for specific IDs in chunks of 30
    const chunks = [];
    for (let i = 0; i < indicator_ids.length; i += 30) {
      chunks.push(indicator_ids.slice(i, i + 30));
    }

    const results = {};
    for (const chunk of chunks) {
      const snapshot = await db.collection('indicators')
        .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
        .get();

      snapshot.forEach(doc => {
        results[doc.id] = { id: doc.id, ...doc.data() };
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error in bulk indicator details fetch:', error);
    res.status(500).json({ error: 'ดึงรายละเอียดตัวบ่งชี้แบบกลุ่มไม่สำเร็จ' });
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
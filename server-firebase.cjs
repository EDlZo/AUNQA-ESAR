// Firebase-based server
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
if (!admin.apps.length) {
  try {
    // Try to use environment variables first
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      console.log('✅ Firebase Admin initialized with environment variables');
    } else {
      // Fallback to service account file
      const serviceAccount = require('./firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'aunqa-esar.appspot.com'
      });
      console.log('✅ Firebase Admin initialized with service account file');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
}

const db = admin.firestore ? admin.firestore() : null;
const bucket = admin.storage ? admin.storage().bucket() : null;

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

// Helper functions
async function uploadFileToFirebase(filePath, destination) {
  if (!bucket) {
    throw new Error('Firebase Storage not initialized');
  }
  
  try {
    const [file] = await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    // Clean up temp file
    fs.unlinkSync(filePath);
    
    return publicUrl;
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

// ================= LOGIN =================
app.post('/api/login', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, message: 'Firebase not initialized' });
    }

    const { username, password, role } = req.body;

    const roleMapping = {
      'system_admin': 1,
      'sar_manager': 2,
      'reporter': 3,
      'evaluator': 4,
      'external_evaluator': 5,
      'executive': 6
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
app.get('/api/view/:filename', (req, res) => {
  // For Firebase Storage, redirect to the public URL
  // This is a placeholder - in practice, you'd store the full URL in the database
  res.status(404).json({ error: 'File viewing not implemented for Firebase Storage' });
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

    const { indicator_id, session_id, major_name } = req.query || {};
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

// ================= START SERVER =================
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Firebase server running on port ${PORT}`);
  console.log('Note: Add Firebase service account key to enable full functionality');
});

module.exports = app;
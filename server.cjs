// ...existing code...
// ...existing code...
const express = require('express');
const cors = require('cors');
const db = require('./db.cjs'); // ต้องมีไฟล์ db.cjs ด้วย
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
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
    fileSize: 10 * 1024 * 1024 // จำกัดขนาดไฟล์ 10MB
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// Debug: log every request method and path to trace 404s
app.use((req, res, next) => {
  try { console.log(`[REQ] ${req.method} ${req.path}`); } catch { }
  next();
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// health check
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, pid: process.pid, cwd: process.cwd() });
});

// ================= LOGIN =================
app.post('/api/login', (req, res) => {
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

  db.query(
    'SELECT user_id, name, email, role_id FROM users WHERE email = ? AND password = ? AND role_id = ?',
    [username, password, roleId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในฐานข้อมูล' });

      console.log('Login Query Params:', [username, password, roleId]);
      if (results.length === 0) {
        console.log('Login Failed: No match found');
        return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้ รหัสผ่าน หรือ Role ไม่ถูกต้อง' });
      }

      console.log('Login Success for user:', results[0].email);
      res.json({ success: true, user: results[0] });
    }
  );
});

// ================= QUALITY COMPONENTS =================
// GET all (supports major-scoped via query)
app.get('/api/quality-components1', async (req, res) => {
  const { session_id, major_name } = req.query || {};
  try {
    let table = null;
    if (major_name && QUALITY_TABLE_MAP[major_name]) {
      table = QUALITY_TABLE_MAP[major_name];
    } else if (session_id) {
      table = await resolveQualityTableBySession(session_id);
    }
    if (table) {
      const [rows] = await db.promise().query(`SELECT * FROM ${table} ORDER BY id DESC`);
      return res.json(rows);
    }
    db.query('SELECT * FROM quality_components1', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: 'ดึงองค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// POST add
app.post('/api/quality-components1', async (req, res) => {
  try {
    const { componentId, qualityName, session_id, major_name } = req.body || {};
    if (!qualityName) return res.status(400).json({ error: 'กรุณากรอกชื่อองค์ประกอบ' });
    let table = null;
    if (major_name && QUALITY_TABLE_MAP[major_name]) {
      table = QUALITY_TABLE_MAP[major_name];
    } else if (session_id) {
      table = await resolveQualityTableBySession(session_id);
    }
    if (table) {
      ensureQualityTable(table);
      const [result] = await db.promise().query(
        `INSERT INTO ${table} (component_id, quality_name) VALUES (?, ?)`,
        [componentId || null, qualityName]
      );
      return res.json({ success: true, id: result.insertId, table });
    }
    db.query(
      'INSERT INTO quality_components1 (component_id, quality_name) VALUES (?, ?)',
      [componentId, qualityName],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId, component_id: componentId, quality_name: qualityName });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'บันทึกองค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// DELETE
app.delete('/api/quality-components1/:id', async (req, res) => {
  try {
    const { session_id, major_name } = req.query || {};
    let table = null;
    if (major_name && QUALITY_TABLE_MAP[major_name]) table = QUALITY_TABLE_MAP[major_name];
    else if (session_id) table = await resolveQualityTableBySession(session_id);
    if (table) {
      await db.promise().query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      return res.json({ success: true });
    }
    db.query('DELETE FROM quality_components1 WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: 'ลบองค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// PATCH EDIT
app.patch('/api/quality-components1/:id', async (req, res) => {
  try {
    const { componentId, qualityName, session_id, major_name } = req.body || {};
    let table = null;
    if (major_name && QUALITY_TABLE_MAP[major_name]) table = QUALITY_TABLE_MAP[major_name];
    else if (session_id) table = await resolveQualityTableBySession(session_id);
    if (table) {
      await db.promise().query(
        `UPDATE ${table} SET component_id = ?, quality_name = ? WHERE id = ?`,
        [componentId || null, qualityName, req.params.id]
      );
      return res.json({ success: true });
    }
    db.query(
      'UPDATE quality_components1 SET component_id = ?, quality_name = ? WHERE id = ?',
      [componentId, qualityName, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'แก้ไของค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// ================= QUALITY COMPONENTS (MAJOR-SCOPED) =================
const QUALITY_TABLE_MAP = {
  'วิศวกรรมคอมพิวเตอร์': 'quality_components_ce',
  'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)': 'quality_components_ce_ai',
};

function ensureQualityTable(tableName) {
  db.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      component_id INT NULL,
      quality_name VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    () => { }
  );
}

Object.values(QUALITY_TABLE_MAP).forEach(ensureQualityTable);

async function resolveQualityTableBySession(sessionId) {
  if (!sessionId) return null;
  const [rows] = await db.promise().query('SELECT major_name FROM assessment_sessions WHERE id = ?', [sessionId]);
  if (rows.length === 0) return null;
  const majorName = rows[0].major_name;
  const table = QUALITY_TABLE_MAP[majorName] || null;
  if (table) ensureQualityTable(table);
  return table;
}

// GET components for major
app.get('/api/quality-components-major', async (req, res) => {
  try {
    const { session_id, major_name } = req.query;
    let table = QUALITY_TABLE_MAP[major_name] || null;
    if (!table) table = await resolveQualityTableBySession(session_id);
    if (!table) return res.json([]);
    const [rows] = await db.promise().query(`SELECT * FROM ${table} ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'ดึงองค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// GET components for assessment (alias for quality-components-major)
app.get('/api/quality-components', async (req, res) => {
  try {
    const { session_id, major_name } = req.query;
    console.log('📊 GET /api/quality-components called with:', { session_id, major_name });

    let table = QUALITY_TABLE_MAP[major_name] || null;
    if (!table) table = await resolveQualityTableBySession(session_id);
    if (!table) {
      console.log('❌ No table found for:', major_name);
      return res.json([]);
    }

    console.log('📋 Using table:', table);
    const [rows] = await db.promise().query(`SELECT * FROM ${table} ORDER BY id DESC`);
    console.log('✅ Components found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error in GET /api/quality-components:', err);
    res.status(500).json({ error: 'ดึงองค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// POST add component for major
app.post('/api/quality-components-major', async (req, res) => {
  try {
    const { session_id, major_name, componentId, qualityName } = req.body;
    let table = QUALITY_TABLE_MAP[major_name] || null;
    if (!table) table = await resolveQualityTableBySession(session_id);
    if (!table) return res.status(400).json({ error: 'ไม่พบตารางของสาขา' });
    ensureQualityTable(table);
    const [result] = await db.promise().query(
      `INSERT INTO ${table} (component_id, quality_name) VALUES (?, ?)`,
      [componentId || null, qualityName]
    );
    res.json({ success: true, id: result.insertId, table });
  } catch (err) {
    res.status(500).json({ error: 'บันทึกองค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// DELETE component for major
app.delete('/api/quality-components-major/:id', async (req, res) => {
  try {
    const { session_id, major_name } = req.query;
    let table = QUALITY_TABLE_MAP[major_name] || null;
    if (!table) table = await resolveQualityTableBySession(session_id);
    if (!table) return res.status(400).json({ error: 'ไม่พบตารางของสาขา' });
    await db.promise().query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบองค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// PATCH component for major
app.patch('/api/quality-components-major/:id', async (req, res) => {
  try {
    const { session_id, major_name, componentId, qualityName } = req.body;
    let table = QUALITY_TABLE_MAP[major_name] || null;
    if (!table) table = await resolveQualityTableBySession(session_id);
    if (!table) return res.status(400).json({ error: 'ไม่พบตารางของสาขา' });
    await db.promise().query(
      `UPDATE ${table} SET component_id = ?, quality_name = ? WHERE id = ?`,
      [componentId || null, qualityName, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'แก้ไของค์ประกอบไม่สำเร็จ', details: err.message });
  }
});

// ================= EVALUATIONS =================
// ================= INDICATORS =================
app.get('/api/indicators/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'id ไม่ถูกต้อง' });
  }
  try {
    const [rows] = await db.promise().query('SELECT * FROM indicators WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลตัวบ่งชี้' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'ดึงข้อมูลตัวบ่งชี้ไม่สำเร็จ', details: err });
  }
});

// POST add indicator (must be async for await)
// --- Major-scoped indicators ---
const INDICATOR_TABLE_MAP = {
  'วิศวกรรมคอมพิวเตอร์': 'indicators_ce',
  'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)': 'indicators_ce_ai',
};

function ensureIndicatorTable(tableName) {
  db.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      component_id INT NOT NULL,
      sequence VARCHAR(50) NOT NULL,
      indicator_type VARCHAR(100) NOT NULL,
      criteria_type VARCHAR(100) NOT NULL,
      indicator_name TEXT NOT NULL,
      data_source TEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    () => { }
  );
}

Object.values(INDICATOR_TABLE_MAP).forEach(ensureIndicatorTable);

async function resolveIndicatorTableBySession(sessionId) {
  if (!sessionId) return null;
  const [rows] = await db.promise().query('SELECT major_name FROM assessment_sessions WHERE id = ?', [sessionId]);
  if (rows.length === 0) return null;
  const majorName = rows[0].major_name;
  const table = INDICATOR_TABLE_MAP[majorName] || null;
  if (table) ensureIndicatorTable(table);
  return table;
}

app.post('/api/indicators', async (req, res) => {
  const { component_id, sequence, indicator_type, criteria_type, indicator_name, data_source, session_id, major_name } = req.body || {};
  try {
    let table = null;
    if (major_name && INDICATOR_TABLE_MAP[major_name]) table = INDICATOR_TABLE_MAP[major_name];
    else if (session_id) table = await resolveIndicatorTableBySession(session_id);

    if (table) {
      ensureIndicatorTable(table);
      const [result] = await db.promise().query(
        `INSERT INTO ${table} (component_id, sequence, indicator_type, criteria_type, indicator_name, data_source) VALUES (?, ?, ?, ?, ?, ?)`,
        [component_id, sequence, indicator_type, criteria_type, indicator_name, data_source]
      );
      return res.json({ success: true, id: result.insertId, table });
    }

    const [result] = await db.promise().query(
      `INSERT INTO indicators 
       (component_id, sequence, indicator_type, criteria_type, indicator_name, data_source) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [component_id, sequence, indicator_type, criteria_type, indicator_name, data_source]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error adding indicator:', err);
    res.status(500).json({ error: 'บันทึกข้อมูลตัวบ่งชี้ไม่สำเร็จ', details: err.message });
  }
});


// DELETE indicator
app.delete('/api/indicators/:id', async (req, res) => {
  try {
    const { session_id, major_name } = req.query || {};
    let table = null;
    if (major_name && INDICATOR_TABLE_MAP[major_name]) table = INDICATOR_TABLE_MAP[major_name];
    else if (session_id) table = await resolveIndicatorTableBySession(session_id);
    if (table) {
      await db.promise().query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      return res.json({ success: true });
    }
    await db.promise().query('DELETE FROM indicators WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบตัวบ่งชี้ไม่สำเร็จ' });
  }
});
// GET indicators by component
app.get('/api/indicators-by-component/:componentId', async (req, res) => {
  const { componentId } = req.params;
  const { session_id, major_name } = req.query || {};
  try {
    let table = null;
    if (major_name && INDICATOR_TABLE_MAP[major_name]) table = INDICATOR_TABLE_MAP[major_name];
    else if (session_id) table = await resolveIndicatorTableBySession(session_id);
    if (table) {
      const [rows] = await db.promise().query(`SELECT * FROM ${table} WHERE component_id = ? ORDER BY sequence`, [componentId]);
      return res.json(rows);
    }
    const [rows] = await db.promise().query('SELECT * FROM indicators WHERE component_id = ? ORDER BY sequence', [componentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'ดึงตัวบ่งชี้ไม่สำเร็จ', details: err });
  }
});

// Get indicator detail by id (major/session aware)
app.get('/api/indicator-detail', async (req, res) => {
  try {
    const { indicator_id, session_id, major_name } = req.query || {};
    if (!indicator_id) return res.status(400).json({ error: 'indicator_id จำเป็น' });
    let table = null;
    if (major_name && INDICATOR_TABLE_MAP[major_name]) table = INDICATOR_TABLE_MAP[major_name];
    else if (session_id) table = await resolveIndicatorTableBySession(session_id);
    if (!table) return res.status(404).json({ error: 'ไม่พบตารางตัวบ่งชี้ของสาขา' });
    const [rows] = await db.promise().query(`SELECT * FROM ${table} WHERE id = ?`, [indicator_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'ไม่พบตัวบ่งชี้' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'ดึงข้อมูลตัวบ่งชี้ไม่สำเร็จ', details: err.message });
  }
});


// ================= FILE HANDLING =================
app.get('/api/check-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.json({ exists: true, filename: filename });
  } else {
    res.status(404).json({ exists: false, error: 'ไม่พบไฟล์' });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) res.status(500).json({ error: 'ไม่สามารถดาวน์โหลดไฟล์ได้' });
    });
  } else {
    res.status(404).json({ error: 'ไม่พบไฟล์' });
  }
});

// ================= ASSESSMENT SESSIONS =================
// Ensure table exists on startup
db.query(
  `CREATE TABLE IF NOT EXISTS assessment_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_id VARCHAR(50) NOT NULL,
    faculty_id VARCHAR(100),
    faculty_name VARCHAR(255),
    major_id VARCHAR(100),
    major_name VARCHAR(255),
    evaluator_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  () => { }
);

// Create session
app.post('/api/assessment-sessions', async (req, res) => {
  const { level_id, faculty_id, faculty_name, major_id, major_name, evaluator_id } = req.body || {};
  if (!level_id) return res.status(400).json({ error: 'level_id จำเป็น' });
  try {
    const [result] = await db.promise().query(
      'INSERT INTO assessment_sessions (level_id, faculty_id, faculty_name, major_id, major_name, evaluator_id) VALUES (?, ?, ?, ?, ?, ?)',
      [level_id, faculty_id || null, faculty_name || null, major_id || null, major_name || null, evaluator_id || null]
    );
    res.json({ success: true, session_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'สร้างเซสชันไม่สำเร็จ', details: err.message });
  }
});

// Get session by id
app.get('/api/assessment-sessions/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM assessment_sessions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'ไม่พบเซสชัน' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'ดึงเซสชันไม่สำเร็จ', details: err.message });
  }
});

app.get('/api/view/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext.slice(1)}`);
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'ไม่พบไฟล์' });
  }
});

// GET evaluations
app.get('/api/evaluations', async (req, res) => {
  const { evaluator_id, program_id, year, component_id, session_id, major_name } = req.query;

  // เลือกตารางตาม major_name
  let tableName = 'evaluations'; // default
  if (major_name && MAJOR_TABLE_MAP[major_name]) {
    tableName = MAJOR_TABLE_MAP[major_name];
  }

  let sql;
  const params = [];

  if (component_id) {
    // หาข้อมูลการประเมินผ่าน indicators table เมื่อมี component_id
    sql = `SELECT e.*, i.component_id 
           FROM ${tableName} e 
           LEFT JOIN indicators i ON e.indicator_id = i.id 
           WHERE i.component_id = ?`;
    params.push(component_id);

    if (evaluator_id) { sql += ' AND e.evaluator_id=?'; params.push(evaluator_id); }
    if (program_id) { sql += ' AND e.program_id=?'; params.push(program_id); }
    if (year) { sql += ' AND e.year=?'; params.push(year); }
    if (session_id) { sql += ' AND e.session_id=?'; params.push(session_id); }

    sql += ' ORDER BY e.created_at DESC';
  } else {
    // ดึงข้อมูลการประเมินโดยตรงเมื่อไม่มี component_id filter
    sql = `SELECT * FROM ${tableName} WHERE 1=1`;

    if (evaluator_id) { sql += ' AND evaluator_id=?'; params.push(evaluator_id); }
    if (program_id) { sql += ' AND program_id=?'; params.push(program_id); }
    if (year) { sql += ' AND year=?'; params.push(year); }
    if (session_id) { sql += ' AND session_id=?'; params.push(session_id); }

    sql += ' ORDER BY created_at DESC';
  }

  console.log('Evaluations API - SQL:', sql);
  console.log('Evaluations API - Params:', params);
  console.log('Evaluations API - Table:', tableName);

  try {
    const [rows] = await db.promise().query(sql, params);
    console.log('Evaluations API - Results:', rows.length, 'rows');
    if (rows.length > 0) {
      console.log('Evaluations API - Sample row:', rows[0]);
    }
    res.json(rows);
  } catch (err) {
    console.error('Error fetching evaluations:', err);
    res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ', details: err.message });
  }
});

// --- Major-specific evaluations ---
const MAJOR_TABLE_MAP = {
  'วิศวกรรมคอมพิวเตอร์': 'evaluations_ce',
  'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)': 'evaluations_ce_ai',
};

// --- Major-specific actual evaluations ---
const MAJOR_ACTUAL_TABLE_MAP = {
  'วิศวกรรมคอมพิวเตอร์': 'evaluations_actual_ce',
  'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)': 'evaluations_actual_ce_ai',
};

function ensureEvaluationTable(tableName) {
  db.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
      evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NULL,
      indicator_id INT NULL,
      program_id INT NULL,
      year INT NULL,
      evaluator_id INT NULL,
      score DECIMAL(5,2) NULL,
      target_value TEXT NULL,
      comment TEXT NULL,
      evidence_file VARCHAR(255) NULL,
      status VARCHAR(50) DEFAULT 'submitted',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    () => { }
  );

  // เพิ่มคอลัมน์ target_value ถ้ายังไม่มี (สำหรับตารางที่มีอยู่แล้ว)
  db.query(
    `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS target_value TEXT NULL AFTER score`,
    () => { }
  );
}

// Create tables for known majors on start
Object.values(MAJOR_TABLE_MAP).forEach(ensureEvaluationTable);

async function resolveMajorTableBySession(sessionId) {
  if (!sessionId) return null;
  const [rows] = await db.promise().query('SELECT major_name FROM assessment_sessions WHERE id = ?', [sessionId]);
  if (rows.length === 0) return null;
  const majorName = rows[0].major_name;
  const table = MAJOR_TABLE_MAP[majorName] || null;
  if (table) ensureEvaluationTable(table);
  return table;
}

// Accept evaluation submission with file upload and route to major-specific table
app.post('/api/evaluations', upload.single('evidence_file'), async (req, res) => {
  try {
    console.log('➡️  POST /api/evaluations received');
    const { session_id, indicator_id, program_id, year, evaluator_id, score, target_value, comment, status, major_name } = req.body;
    const filename = req.file ? req.file.filename : null;

    console.log('Received evaluation data:', {
      session_id, indicator_id, score, target_value, comment, major_name
    });

    let table = null;
    if (major_name && MAJOR_TABLE_MAP[major_name]) {
      table = MAJOR_TABLE_MAP[major_name];
    } else {
      table = await resolveMajorTableBySession(session_id);
    }

    if (!table) {
      console.log('❌ No table found for major:', major_name, 'session:', session_id);
      return res.status(400).json({ success: false, error: 'ไม่พบตารางสำหรับสาขาที่เลือก' });
    }

    console.log('✅ Using table:', table);

    ensureEvaluationTable(table);
    const [result] = await db.promise().query(
      `INSERT INTO ${table} (session_id, indicator_id, program_id, year, evaluator_id, score, target_value, comment, evidence_file, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [session_id || null, indicator_id || null, program_id || null, year || null, evaluator_id || null, score || null, target_value || null, comment || null, filename, status || 'submitted']
    );

    console.log('✅ Inserted evaluation with ID:', result.insertId);

    const response = { success: true, table, evaluation_id: result.insertId, evidence_file: filename };
    console.log('📤 Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('❌ Error in /api/evaluations:', err);
    res.status(500).json({ success: false, error: 'บันทึกผลประเมินไม่สำเร็จ', details: err.message });
  }
});

// Read evaluations for current session/major
app.get('/api/evaluations/history', async (req, res) => {
  try {
    const { session_id, major_name } = req.query;
    let table = null;
    if (major_name && MAJOR_TABLE_MAP[major_name]) {
      table = MAJOR_TABLE_MAP[major_name];
    } else if (session_id) {
      table = await resolveMajorTableBySession(session_id);
    }
    if (!table) return res.json([]);
    const [rows] = await db.promise().query(`SELECT * FROM ${table} WHERE session_id = ? ORDER BY created_at DESC`, [session_id || null]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'โหลดประวัติไม่สำเร็จ', details: err.message });
  }
});

// === ACTUAL EVALUATIONS APIs ===

// Ensure actual-evaluations tables have necessary columns (including evidence fields)
function ensureActualEvaluationTable(tableName) {
  db.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
      evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NULL,
      indicator_id INT NULL,
      program_id INT NULL,
      year INT NULL,
      evaluator_id INT NULL,
      operation_result TEXT NULL,
      operation_score DECIMAL(5,2) NULL,
      reference_score DECIMAL(5,2) NULL,
      goal_achievement VARCHAR(50) NULL,
      evidence_number VARCHAR(255) NULL,
      evidence_name VARCHAR(255) NULL,
      evidence_url TEXT NULL,
      comment TEXT NULL,
      evidence_file VARCHAR(255) NULL,
      evidence_files_json TEXT NULL,
      evidence_meta_json TEXT NULL,
      status VARCHAR(50) DEFAULT 'submitted',
      major_name VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    () => { }
  );
  // Backfill additional columns if table already exists (compat with MySQL versions)
  function addColumnIfMissing(columnName, columnDDL) {
    db.query(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
      [tableName, columnName],
      (err, rows) => {
        if (err) return; // silent
        if (!rows || rows.length === 0) {
          db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDDL}`, () => { });
        }
      }
    );
  }
  addColumnIfMissing('evidence_name', 'evidence_name VARCHAR(255) NULL AFTER evidence_number');
  addColumnIfMissing('evidence_url', 'evidence_url TEXT NULL AFTER evidence_name');
  addColumnIfMissing('evidence_file', 'evidence_file VARCHAR(255) NULL');
  addColumnIfMissing('evidence_files_json', 'evidence_files_json TEXT NULL');
  addColumnIfMissing('evidence_meta_json', 'evidence_meta_json TEXT NULL');
}

Object.values(MAJOR_ACTUAL_TABLE_MAP).forEach(ensureActualEvaluationTable);

async function resolveActualTable(sessionId, majorName) {
  let name = majorName || null;
  if (!name && sessionId) {
    try {
      const [rows] = await db.promise().query('SELECT major_name FROM assessment_sessions WHERE id = ? LIMIT 1', [sessionId]);
      if (rows && rows.length > 0) name = rows[0].major_name || null;
    } catch { }
  }
  const table = name && MAJOR_ACTUAL_TABLE_MAP[name] ? MAJOR_ACTUAL_TABLE_MAP[name] : null;
  if (table) ensureActualEvaluationTable(table);
  return table;
}

// Accept actual evaluation submission (with optional multiple files upload)
app.post('/api/evaluations-actual', upload.array('evidence_files', 10), async (req, res) => {
  try {
    const { session_id, indicator_id, operation_result, operation_score, reference_score, goal_achievement, evidence_number, evidence_name, evidence_url, comment, major_name, status, keep_existing } = req.body;
    // Support both: single 'evidence_file' and multiple 'evidence_files'
    const singleFile = req.file ? req.file.filename : null;
    const files = Array.isArray(req.files) ? req.files.map(f => f.filename) : [];

    console.log('Received actual evaluation data:', {
      session_id, indicator_id, operation_result, operation_score, reference_score, goal_achievement, major_name
    });

    const table = await resolveActualTable(session_id, major_name);
    if (!table) {
      return res.status(400).json({ error: 'ไม่พบตารางสำหรับสาขาที่เลือก' });
    }

    console.log('Using actual evaluation table:', table);

    ensureActualEvaluationTable(table);

    // Resolve previous files list for this session/indicator (latest record)
    let previousFiles = [];
    try {
      const [prevRows] = await db.promise().query(
        `SELECT evidence_file, evidence_files_json FROM ${table} WHERE session_id = ? AND indicator_id = ? ORDER BY created_at DESC LIMIT 1`,
        [session_id || null, indicator_id || null]
      );
      if (prevRows && prevRows.length > 0) {
        const prev = prevRows[0];
        if (prev.evidence_files_json) {
          try { previousFiles = JSON.parse(prev.evidence_files_json) || []; } catch { previousFiles = []; }
        } else if (prev.evidence_file) {
          previousFiles = [prev.evidence_file];
        }
      }
    } catch { }

    // Decide files to store: optionally keep existing
    const mergeExisting = String(keep_existing || '').toLowerCase() === 'true' || keep_existing === '1';
    let finalFiles = mergeExisting ? [...previousFiles, ...files] : files;
    // de-duplicate
    finalFiles = Array.from(new Set(finalFiles.filter(Boolean)));

    // Build per-file metadata from incoming parallel arrays (JSON string expected)
    let numbers = [];
    let names = [];
    let urls = [];
    try { if (typeof req.body.evidence_numbers === 'string') numbers = JSON.parse(req.body.evidence_numbers); } catch { }
    try { if (typeof req.body.evidence_names === 'string') names = JSON.parse(req.body.evidence_names); } catch { }
    try { if (typeof req.body.evidence_urls === 'string') urls = JSON.parse(req.body.evidence_urls); } catch { }

    const newMeta = {};

    // สำหรับไฟล์ที่อัปโหลด: ใช้ชื่อไฟล์เป็น key
    files.forEach((fname, i) => {
      newMeta[fname] = {
        number: numbers[i] || null,
        name: names[i] || null,
        url: urls[i] || null
      };
    });

    // สำหรับ URL-only (ไม่มีไฟล์): ใช้ url_ prefix เป็น key
    // กรณีที่ length ของ metadata arrays มากกว่า files = มี URL-only entries
    const urlOnlyCount = Math.max(numbers.length, names.length, urls.length) - files.length;
    if (urlOnlyCount > 0) {
      for (let i = files.length; i < numbers.length || i < names.length || i < urls.length; i++) {
        const urlKey = `url_${i}_${names[i] || 'evidence'}`;
        newMeta[urlKey] = {
          number: numbers[i] || null,
          name: names[i] || null,
          url: urls[i] || null
        };
        // เพิ่ม URL-only entry ลงใน finalFiles เพื่อให้แสดงในรายการ
        finalFiles.push(urlKey);
      }
    }

    // Merge previous meta if keeping
    let mergedMeta = newMeta;
    if (mergeExisting) {
      try {
        const [prevMetaRows] = await db.promise().query(
          `SELECT evidence_meta_json FROM ${table} WHERE session_id = ? AND indicator_id = ? ORDER BY created_at DESC LIMIT 1`,
          [session_id || null, indicator_id || null]
        );
        if (prevMetaRows && prevMetaRows.length > 0 && prevMetaRows[0].evidence_meta_json) {
          const prevMeta = JSON.parse(prevMetaRows[0].evidence_meta_json) || {};
          mergedMeta = { ...prevMeta, ...newMeta };
        }
      } catch { }
    }

    // Build INSERT dynamically based on existing columns to avoid schema mismatch
    const [colsRows] = await db.promise().query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table]
    );
    const existingCols = new Set((colsRows || []).map(r => r.COLUMN_NAME));
    const candidate = {
      session_id: session_id || null,
      indicator_id: indicator_id || null,
      operation_result,
      operation_score: operation_score || null,
      reference_score: reference_score || null,
      goal_achievement,
      evidence_number: evidence_number || null,
      evidence_name: evidence_name || null,
      evidence_url: evidence_url || null,
      comment: comment || null,
      evidence_file: singleFile || (finalFiles[0] || null),
      evidence_files_json: finalFiles.length ? JSON.stringify(finalFiles) : null,
      evidence_meta_json: Object.keys(mergedMeta).length ? JSON.stringify(mergedMeta) : null,
      status: status || 'submitted',
      major_name: major_name || null
    };
    const columns = Object.keys(candidate).filter(c => existingCols.has(c));
    const values = columns.map(c => candidate[c]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const [result] = await db.promise().query(sql, values);

    console.log('Inserted actual evaluation with ID:', result.insertId);

    res.json({ success: true, table, evaluation_id: result.insertId });
  } catch (err) {
    console.error('Error saving actual evaluation:', err);
    res.status(500).json({ error: 'บันทึกการประเมินผลไม่สำเร็จ', details: err.message });
  }
});

// Append files to latest actual evaluation of an indicator within current session/major
app.post('/api/evaluations-actual/append-files', upload.array('evidence_files', 10), async (req, res) => {
  try {
    console.log('➡️  POST /api/evaluations-actual/append-files');
    const { session_id, indicator_id, major_name } = req.body || {};
    if (!session_id || !indicator_id) {
      return res.status(400).json({ error: 'ต้องระบุ session_id และ indicator_id' });
    }
    const table = await resolveActualTable(session_id, major_name);
    if (!table) return res.status(400).json({ error: 'ไม่พบตารางสำหรับสาขาที่เลือก' });

    const [rows] = await db.promise().query(
      `SELECT evaluation_id, evidence_file, evidence_files_json FROM ${table} WHERE session_id = ? AND indicator_id = ? ORDER BY created_at DESC LIMIT 1`,
      [session_id, indicator_id]
    );
    let current = rows && rows[0];
    if (!current) {
      // ถ้าไม่มีรายการล่าสุด ให้สร้างแถวใหม่ขึ้นมาก่อนเพื่อรองรับการเพิ่มไฟล์ครั้งแรก
      const newFilesUploaded = Array.isArray(req.files) ? req.files.map(f => f.filename) : [];
      const primaryFile = newFilesUploaded[0] || null;
      // เมทาดาตาเริ่มต้น
      let numbers = [];
      let names = [];
      try { if (typeof req.body.evidence_numbers === 'string') numbers = JSON.parse(req.body.evidence_numbers); } catch { }
      try { if (typeof req.body.evidence_names === 'string') names = JSON.parse(req.body.evidence_names); } catch { }
      const metaInit = {};
      newFilesUploaded.forEach((fname, i) => { metaInit[fname] = { number: numbers[i] || null, name: names[i] || null }; });
      const [ins] = await db.promise().query(
        `INSERT INTO ${table} (session_id, indicator_id, evidence_file, evidence_files_json, evidence_meta_json, status) VALUES (?, ?, ?, ?, ?, 'submitted')`,
        [session_id, indicator_id, primaryFile, newFilesUploaded.length ? JSON.stringify(newFilesUploaded) : null, Object.keys(metaInit).length ? JSON.stringify(metaInit) : null]
      );
      current = { evaluation_id: ins.insertId, evidence_file: primaryFile, evidence_files_json: JSON.stringify(newFilesUploaded) };
    }

    // จากนี้ไปคือกรณีมีแถวอยู่แล้ว (หรือเพิ่งสร้างใหม่ด้านบน)
    const existing = [];
    if (current.evidence_files_json) {
      try { existing.push(...JSON.parse(current.evidence_files_json)); } catch { }
    } else if (current.evidence_file) {
      existing.push(current.evidence_file);
    }
    const newFiles = Array.isArray(req.files) ? req.files.map(f => f.filename) : [];
    const merged = [...existing, ...newFiles];
    const primary = merged[0] || null;

    // Merge metadata
    let numbers = [];
    let names = [];
    try { if (typeof req.body.evidence_numbers === 'string') numbers = JSON.parse(req.body.evidence_numbers); } catch { }
    try { if (typeof req.body.evidence_names === 'string') names = JSON.parse(req.body.evidence_names); } catch { }
    const newMeta = {};
    newFiles.forEach((fname, i) => { newMeta[fname] = { number: numbers[i] || null, name: names[i] || null }; });
    let meta = {};
    try {
      const [prev] = await db.promise().query(
        `SELECT evidence_meta_json FROM ${table} WHERE evaluation_id = ?`,
        [current.evaluation_id]
      );
      if (prev && prev.length > 0 && prev[0].evidence_meta_json) meta = JSON.parse(prev[0].evidence_meta_json) || {};
    } catch { }
    meta = { ...meta, ...newMeta };
    await db.promise().query(
      `UPDATE ${table} SET evidence_file = ?, evidence_files_json = ?, evidence_meta_json = ? WHERE evaluation_id = ?`,
      [primary, JSON.stringify(merged), Object.keys(meta).length ? JSON.stringify(meta) : null, current.evaluation_id]
    );
    res.json({ success: true, evaluation_id: current.evaluation_id, files: merged, meta });
  } catch (err) {
    console.error('Error appending files:', err);
    res.status(500).json({ error: 'เพิ่มไฟล์ไม่สำเร็จ', details: err.message });
  }
});

// Optional debug GET to confirm route is registered (will instruct to use POST)
app.get('/api/evaluations-actual/append-files', (req, res) => {
  res.status(405).json({ error: 'ใช้วิธี POST เท่านั้นสำหรับเส้นทางนี้' });
});

// Remove a single file from the latest actual evaluation of an indicator
app.post('/api/evaluations-actual/remove-file', async (req, res) => {
  try {
    console.log('➡️  POST /api/evaluations-actual/remove-file');
    const { session_id, indicator_id, major_name, filename } = req.body || {};
    if (!session_id || !indicator_id || !filename) {
      return res.status(400).json({ error: 'ต้องระบุ session_id, indicator_id, filename' });
    }
    const table = await resolveActualTable(session_id, major_name);
    if (!table) return res.status(400).json({ error: 'ไม่พบตารางสำหรับสาขาที่เลือก' });
    const [rows] = await db.promise().query(
      `SELECT evaluation_id, evidence_file, evidence_files_json FROM ${table} WHERE session_id = ? AND indicator_id = ? ORDER BY created_at DESC LIMIT 1`,
      [session_id, indicator_id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'ไม่พบรายการ' });
    const current = rows[0];
    let files = [];
    if (current.evidence_files_json) {
      try { files = JSON.parse(current.evidence_files_json) || []; } catch { }
    } else if (current.evidence_file) {
      files = [current.evidence_file];
    }
    const updated = files.filter(f => f !== filename);
    const primary = updated[0] || null;
    // Update metadata as well
    let meta = {};
    try {
      const [prev] = await db.promise().query(
        `SELECT evidence_meta_json FROM ${table} WHERE evaluation_id = ?`,
        [current.evaluation_id]
      );
      if (prev && prev.length > 0 && prev[0].evidence_meta_json) meta = JSON.parse(prev[0].evidence_meta_json) || {};
    } catch { }
    if (meta && meta[filename]) delete meta[filename];
    await db.promise().query(
      `UPDATE ${table} SET evidence_file = ?, evidence_files_json = ?, evidence_meta_json = ? WHERE evaluation_id = ?`,
      [primary, updated.length ? JSON.stringify(updated) : null, Object.keys(meta).length ? JSON.stringify(meta) : null, current.evaluation_id]
    );
    // Try removing file from disk (best-effort)
    try {
      const filePath = path.join(__dirname, 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { }
    res.json({ success: true, files: updated });
  } catch (err) {
    console.error('Error removing file:', err);
    res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ', details: err.message });
  }
});

// --- Compatibility aliases for mistyped paths observed on client ---
// alias: /api/evaluation_tual/append-files -> /api/evaluations-actual/append-files
app.post('/api/evaluation_tual/append-files', (req, res, next) => {
  req.url = '/api/evaluations-actual/append-files';
  next();
});
// alias: /api/evaluation_tual/remove-file -> /api/evaluations-actual/remove-file
app.post('/api/evaluation_tual/remove-file', (req, res, next) => {
  req.url = '/api/evaluations-actual/remove-file';
  next();
});

// Read actual evaluations for current session/major
app.get('/api/evaluations-actual/history', async (req, res) => {
  try {
    const { session_id, major_name } = req.query;
    let table = null;
    if (major_name && MAJOR_ACTUAL_TABLE_MAP[major_name]) {
      table = MAJOR_ACTUAL_TABLE_MAP[major_name];
    }
    if (!table) return res.json([]);

    const [rows] = await db.promise().query(`SELECT * FROM ${table} WHERE session_id = ? ORDER BY created_at DESC`, [session_id || null]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching actual evaluations:', err);
    res.status(500).json({ error: 'โหลดประวัติการประเมินผลไม่สำเร็จ', details: err.message });
  }
});

// ================= COMMITTEE EVALUATIONS =================
// Fixed table names per major
const COMMITTEE_TABLE_MAP = {
  'วิศวกรรมคอมพิวเตอร์': 'committee_evaluations_ce',
  'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)': 'committee_evaluations_ce_ai',
};

async function ensureCommitteeTable(tableName) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      indicator_id INT NOT NULL,
      major_name VARCHAR(255) NOT NULL,
      session_id VARCHAR(255) NOT NULL,
      committee_score DECIMAL(5,2),
      strengths TEXT,
      improvements TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_indicator (indicator_id),
      INDEX idx_session (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  await db.promise().query(createTableSQL);

  // Backfill columns for existing older schema
  const addIfMissing = async (col, ddl) => {
    try {
      const [rows] = await db.promise().query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
        [tableName, col]
      );
      if (!rows || rows.length === 0) {
        await db.promise().query(`ALTER TABLE ${tableName} ADD COLUMN ${ddl}`);
      }
    } catch { }
  };
  await addIfMissing('major_name', 'major_name VARCHAR(255) NULL');
  await addIfMissing('session_id', 'session_id VARCHAR(255) NULL');
}

async function tableExists(name) {
  const [rows] = await db.promise().query(
    'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1',
    [name]
  );
  return !!(rows && rows.length);
}

// Resolve committee table by major and migrate legacy table if found
const resolveCommitteeTableByMajor = async (majorName) => {
  const tableName = COMMITTEE_TABLE_MAP[majorName];
  if (!tableName) return null;
  await ensureCommitteeTable(tableName);

  // Migrate data from legacy dynamic table if it exists (e.g., committee_evaluations_วิศวกรรมคอมพิวเตอร์)
  const legacyName = `committee_evaluations_${majorName}`;
  try {
    if (await tableExists(legacyName)) {
      // copy rows that are not already present (by indicator+session)
      await db.promise().query(
        `INSERT INTO ${tableName} (indicator_id, major_name, session_id, committee_score, strengths, improvements, created_at, updated_at)
         SELECT l.indicator_id, l.major_name, l.session_id, l.committee_score, l.strengths, l.improvements, l.created_at, l.updated_at
         FROM ${legacyName} l
         LEFT JOIN ${tableName} t ON t.indicator_id = l.indicator_id AND t.session_id = l.session_id AND t.major_name = l.major_name
         WHERE t.id IS NULL`
      );
      // optional: keep legacy table for safety; comment next line to preserve
      // await db.promise().query(`DROP TABLE ${legacyName}`);
    }
  } catch { }

  return tableName;
};

// Get committee evaluations
app.get('/api/committee-evaluations', async (req, res) => {
  try {
    const { indicator_id, major_name, session_id } = req.query;

    if (!major_name) {
      return res.status(400).json({ error: 'กรุณาระบุ major_name' });
    }

    const tableName = await resolveCommitteeTableByMajor(major_name);

    let query = `SELECT * FROM ${tableName} WHERE major_name = ? AND session_id = ?`;
    let params = [major_name, session_id];

    if (indicator_id) {
      query += ` AND indicator_id = ?`;
      params.push(indicator_id);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await db.promise().query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching committee evaluations:', err);
    res.status(500).json({ error: 'โหลดข้อมูลการประเมินกรรมการไม่สำเร็จ', details: err.message });
  }
});

// Create/Update committee evaluation
app.post('/api/committee-evaluations', async (req, res) => {
  try {
    const { indicator_id, major_name, session_id, committee_score, strengths, improvements } = req.body;

    if (!indicator_id || !major_name || !session_id) {
      return res.status(400).json({ error: 'กรุณาระบุข้อมูลที่จำเป็น' });
    }

    const tableName = await resolveCommitteeTableByMajor(major_name);

    // Check if evaluation already exists
    const [existing] = await db.promise().query(
      `SELECT id FROM ${tableName} WHERE indicator_id = ? AND major_name = ? AND session_id = ?`,
      [indicator_id, major_name, session_id]
    );

    if (existing.length > 0) {
      // Update existing evaluation
      await db.promise().query(
        `UPDATE ${tableName} SET committee_score = ?, strengths = ?, improvements = ?, updated_at = CURRENT_TIMESTAMP WHERE indicator_id = ? AND major_name = ? AND session_id = ?`,
        [committee_score, strengths, improvements, indicator_id, major_name, session_id]
      );
    } else {
      // Create new evaluation
      await db.promise().query(
        `INSERT INTO ${tableName} (indicator_id, major_name, session_id, committee_score, strengths, improvements) VALUES (?, ?, ?, ?, ?, ?)`,
        [indicator_id, major_name, session_id, committee_score, strengths, improvements]
      );
    }

    res.json({ success: true, message: 'บันทึกการประเมินกรรมการเรียบร้อย' });
  } catch (err) {
    console.error('Error saving committee evaluation:', err);
    res.status(500).json({ error: 'บันทึกการประเมินกรรมการไม่สำเร็จ', details: err.message });
  }
});

// ================= ASSESSMENT SUMMARY =================
app.get('/api/assessment-summary', async (req, res) => {
  try {
    // ส่งข้อมูลสรุปการประเมินผล - ตอนนี้ส่งข้อมูลตัวอย่าง
    res.json({
      message: 'Assessment summary endpoint is working',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching assessment summary:', err);
    res.status(500).json({ error: 'โหลดสรุปการประเมินผลไม่สำเร็จ', details: err.message });
  }
});

// ================= START SERVER =================
app.listen(3001, () => {
  console.log('Server running on port 3001');
});

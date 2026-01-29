// src/components/EvaluationFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import RichTextEditor from './RichTextEditor.jsx';
import { BASE_URL } from '../config/api.js';


export default function EvaluationFormModal({ indicator, selectedProgram, onComplete, onCancel }) {
  // ข้อมูลจากการประเมินเกณฑ์ก่อนหน้า (target_value, score)
  const [criteriaData, setCriteriaData] = useState({ target_value: '', score: '' });
  
  // ข้อมูลการประเมินผลใหม่
  const [operationResult, setOperationResult] = useState(''); // ผลการดำเนินงาน
  const [operationScore, setOperationScore] = useState(''); // คะแนนผลการดำเนินงาน
  const [referenceScore, setReferenceScore] = useState(''); // คะแนนอ้างอิงเกณฑ์
  const [goalAchievement, setGoalAchievement] = useState(''); // การบรรลุเป้า
  const [evidenceNumber, setEvidenceNumber] = useState(''); // หมายเลขหลักฐานอ้างอิง
  const [evidenceName, setEvidenceName] = useState(''); // ชื่อหลักฐานอ้างอิง
  const [evidenceUrl, setEvidenceUrl] = useState(''); // URL หลักฐาน
  const [evidenceFiles, setEvidenceFiles] = useState([]); // ไฟล์หลักฐานหลายไฟล์
  const [comment, setComment] = useState(''); // หมายเหตุ
  const [evidenceType, setEvidenceType] = useState('file'); // 'file' หรือ 'url'
  
  const [loading, setLoading] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState([]);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [pendingEvidenceFiles, setPendingEvidenceFiles] = useState([]); // ไฟล์หลักฐานที่ยังไม่ได้บันทึก
  const fileInputRef = useRef(null);

  // Helper: try relative /api first; if 404, retry against backend port 3001
  const fetchWithFallback = async (path, options) => {
    try {
      const res = await fetch(path, options);
      if (res.status !== 404) return res;
    } catch {}
    try {
      const url = path.startsWith('/api') || path.startsWith('/uploads') ? `${BASE_URL}${path}` : path;
      return await fetch(url, options);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    // โหลดข้อมูลเกณฑ์การประเมินก่อนหน้า
    fetchCriteriaData();
    // โหลดข้อมูลผลการดำเนินการเดิม (ถ้ามี)
    fetchExistingEvaluation();
    // โหลดประวัติผลการดำเนินการ
    fetchEvaluationHistory();
  }, [indicator]);

  const fetchCriteriaData = async () => {
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram?.majorName || '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      
      // 1) ค้นหาจาก session ปัจจุบันก่อน
      let res = await fetch(`${BASE_URL}/api/evaluations/history?${qs}`);
      let criteriaEvaluation = null;
      if (res.ok) {
        const evaluations = await res.json();
        criteriaEvaluation = (Array.isArray(evaluations) ? evaluations : [])
          .filter(ev => String(ev.session_id) === String(sessionId))
          .find(ev => String(ev.indicator_id) === String(indicator.id));
      }

      // 2) ถ้ายังไม่พบ ให้ค้นจากทุก session ของสาขานี้ แล้วเลือกอันท้ายสุดของตัวบ่งชี้นี้
      if (!criteriaEvaluation) {
        const qsAll = new URLSearchParams({ major_name: major }).toString();
        res = await fetch(`${BASE_URL}/api/evaluations?${qsAll}`);
        if (res.ok) {
          const rows = await res.json();
          const list = (Array.isArray(rows) ? rows : [])
            .filter(ev => String(ev.indicator_id) === String(indicator.id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          criteriaEvaluation = list[0] || null;
        }
      }

      if (criteriaEvaluation) {
        setCriteriaData({
          target_value: criteriaEvaluation.target_value || '',
          score: criteriaEvaluation.score || ''
        });
      } else {
        setCriteriaData({ target_value: '', score: '' });
      }
    } catch (error) {
      console.error('Error fetching criteria data:', error);
    }
  };

  const fetchExistingEvaluation = async () => {
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const altId = sessionId && sessionId.length > 10 ? String(Math.floor(Number(sessionId) / 1000)) : '';
      const major = selectedProgram?.majorName || '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      
      // ดึงจากตาราง evaluations_actual (ตารางผลการดำเนินการ)
      const res = await fetchWithFallback(`/api/evaluations-actual/history?${qs}`);
      if (res.ok) {
        let evaluations = await res.json();
        let list = (Array.isArray(evaluations) ? evaluations : []).filter(ev => !sessionId || String(ev.session_id) === String(sessionId));
        if (list.length === 0 && altId) {
          list = (Array.isArray(evaluations) ? evaluations : []).filter(ev => String(ev.session_id) === altId);
          if (list.length > 0) {
            try { localStorage.setItem('assessment_session_id', altId); } catch {}
          }
        }
        let evaluation = list.find(ev => String(ev.indicator_id) === String(indicator.id));
        if (!evaluation) {
          // fallback legacy session id
          const resLegacy = await fetchWithFallback(`/api/evaluations-actual/history?${new URLSearchParams({ session_id: '2147483647', major_name: selectedProgram?.majorName || '' }).toString()}`);
          if (resLegacy.ok) {
            const rows = await resLegacy.json();
            evaluation = (Array.isArray(rows) ? rows : []).find(ev => String(ev.indicator_id) === String(indicator.id));
          }
        }
        if (evaluation) {
          setOperationResult(evaluation.operation_result || '');
          setOperationScore(evaluation.operation_score || '');
          setReferenceScore(evaluation.reference_score || '');
          setGoalAchievement(evaluation.goal_achievement || '');
          setEvidenceNumber(evaluation.evidence_number || '');
          setEvidenceName(evaluation.evidence_name || '');
          setEvidenceUrl(evaluation.evidence_url || '');
          // evidence_file is not read into state; only shown in history/summary
          setComment(evaluation.comment || '');
        }
      }
    } catch (error) {
      console.error('Error fetching existing evaluation:', error);
    }
  };

  const fetchEvaluationHistory = async () => {
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const altId = sessionId && sessionId.length > 10 ? String(Math.floor(Number(sessionId) / 1000)) : '';
      const major = selectedProgram?.majorName || '';
      let historyRows = [];
      // 1) session ปัจจุบัน
      let res = await fetchWithFallback(`/api/evaluations-actual/history?${new URLSearchParams({ session_id: sessionId, major_name: major }).toString()}`);
      if (res.ok) {
        const rows = await res.json();
        historyRows = Array.isArray(rows) ? rows : [];
        historyRows = historyRows.filter(ev => String(ev.session_id) === String(sessionId));
      }

      // 2) ลองใช้ id แบบวินาทีถ้าข้อ 1 ว่าง
      if (historyRows.length === 0 && altId) {
        res = await fetchWithFallback(`/api/evaluations-actual/history?${new URLSearchParams({ session_id: altId, major_name: major }).toString()}`);
        if (res.ok) {
          const rows = await res.json();
          historyRows = Array.isArray(rows) ? rows : [];
          historyRows = historyRows.filter(ev => String(ev.session_id) === altId);
          if (historyRows.length > 0) {
            try { localStorage.setItem('assessment_session_id', altId); } catch {}
          }
        }
      }

      // 3) Fallback legacy id
      if (historyRows.length === 0) {
        res = await fetchWithFallback(`/api/evaluations-actual/history?${new URLSearchParams({ session_id: '2147483647', major_name: major }).toString()}`);
        if (res.ok) {
          const rows = await res.json();
          historyRows = Array.isArray(rows) ? rows : [];
        }
      }

      const history = historyRows
        .filter(ev => String(ev.indicator_id) === String(indicator.id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setEvaluationHistory(history);
    } catch (error) {
      console.error('Error fetching evaluation history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram?.majorName || '';
      
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('indicator_id', indicator.id);
      formData.append('operation_result', operationResult);
      formData.append('operation_score', operationScore);
      formData.append('reference_score', referenceScore);
      formData.append('goal_achievement', goalAchievement);
      formData.append('evidence_number', evidenceNumber);
      formData.append('evidence_name', evidenceName);
      formData.append('evidence_url', evidenceUrl);
      formData.append('comment', comment);
      formData.append('major_name', major);
      formData.append('status', 'submitted');
      // Keep previous files when submitting a new record (merge server-side)
      formData.append('keep_existing', 'true');
      
      // เพิ่มไฟล์หลักฐานที่ยังไม่ได้บันทึก
      if (pendingEvidenceFiles && pendingEvidenceFiles.length > 0) {
        const numbers = pendingEvidenceFiles.map(item => item.number);
        const names = pendingEvidenceFiles.map(item => item.name);
        const urls = pendingEvidenceFiles.map(item => item.url);
        
        // ใช้ข้อมูลหลักฐานจากไฟล์แรก (หรือไฟล์เดียว) เป็นข้อมูลหลัก
        const firstEvidence = pendingEvidenceFiles[0];
        if (firstEvidence) {
          formData.set('evidence_number', firstEvidence.number || '');
          formData.set('evidence_name', firstEvidence.name || '');
          formData.set('evidence_url', firstEvidence.url || '');
        }
        
        // เพิ่มเฉพาะไฟล์ที่มีจริง (ไม่ใช่ URL-only)
        pendingEvidenceFiles.forEach(item => {
          if (item.file) {
            formData.append('evidence_files', item.file);
          }
        });
        
        formData.append('evidence_numbers', JSON.stringify(numbers));
        formData.append('evidence_names', JSON.stringify(names));
        formData.append('evidence_urls', JSON.stringify(urls));
      }
      
      // multiple files (ไฟล์หลักฐานจาก state เดิม)
      if (Array.isArray(evidenceFiles)) {
        evidenceFiles.forEach((f) => formData.append('evidence_files', f));
      }

      const res = await fetchWithFallback('/api/evaluations-actual', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        try { localStorage.setItem('last_summary_major', selectedProgram?.majorName || ''); } catch {}
        if (fileInputRef.current) { try { fileInputRef.current.value = ''; } catch {} }
        // ล้างข้อมูลไฟล์หลักฐานที่ยังไม่ได้บันทึก
        setPendingEvidenceFiles([]);
        onComplete();
      } else {
        alert('บันทึกผลการดำเนินการไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }

    setLoading(false);
  };

  const handleAppendFiles = async (filesToAdd, numbers = [], names = []) => {
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram?.majorName || '';
      const fd = new FormData();
      fd.append('session_id', sessionId);
      fd.append('indicator_id', indicator.id);
      fd.append('major_name', major);
      filesToAdd.forEach(f => fd.append('evidence_files', f));
      // pass metadata arrays aligned with files
      fd.append('evidence_numbers', JSON.stringify(numbers));
      fd.append('evidence_names', JSON.stringify(names));
      const res = await fetchWithFallback('/api/evaluations-actual/append-files', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        alert('เพิ่มไฟล์ไม่สำเร็จ');
      }
      // refresh history to reflect new files
      await fetchEvaluationHistory();
    } catch (err) {
      console.error('Error appending files:', err);
      alert('เกิดข้อผิดพลาดในการเพิ่มไฟล์');
    }
  };

  const handleRemoveFile = async (filename) => {
    try {
      // ตรวจสอบว่าเป็นไฟล์ที่ยังไม่ได้บันทึกหรือไม่
      const isUnSavedFile = evidenceFiles && evidenceFiles.some(f => f.name === filename);
      
      if (isUnSavedFile) {
        // ลบไฟล์จาก state (ยังไม่ได้บันทึก)
        setEvidenceFiles(prev => prev.filter(f => f.name !== filename));
        return;
      }

      // ลบไฟล์จากฐานข้อมูล (บันทึกแล้ว)
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram?.majorName || '';
      const res = await fetchWithFallback('/api/evaluations-actual/remove-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, indicator_id: indicator.id, major_name: major, filename })
      });
      if (!res.ok) {
        alert('ลบไฟล์ไม่สำเร็จ');
        return;
      }
      await fetchEvaluationHistory();
    } catch (err) {
      console.error('Error removing file:', err);
      alert('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  };

  const latestFiles = (() => {
    // รวมไฟล์จากประวัติและไฟล์ที่ยังไม่ได้บันทึก
    let files = [];
    let meta = {};
    let evidence_number = '';
    let evidence_name = '';
    let evidence_url = '';

    // 1. ดึงข้อมูลจากประวัติ (ไฟล์ที่บันทึกแล้ว)
    if (evaluationHistory && evaluationHistory.length > 0) {
      const latest = evaluationHistory[0];
      if (latest.evidence_files_json) {
        try { files.push(...(JSON.parse(latest.evidence_files_json) || [])); } catch {}
      }
      if (latest.evidence_file && !files.includes(latest.evidence_file)) files.push(latest.evidence_file);
      
      if (latest.evidence_meta_json) {
        try { meta = JSON.parse(latest.evidence_meta_json) || {}; } catch {}
      }
      evidence_number = latest.evidence_number || '';
      evidence_name = latest.evidence_name || '';
      evidence_url = latest.evidence_url || '';
    }

    // 2. เพิ่มไฟล์ที่ยังไม่ได้บันทึก
    if (pendingEvidenceFiles && pendingEvidenceFiles.length > 0) {
      pendingEvidenceFiles.forEach((item, index) => {
        // กรณีมีไฟล์: ใช้ชื่อไฟล์
        // กรณีไม่มีไฟล์: ใช้ชื่อจาก metadata หรือ "url_only"
        const filename = item.file 
          ? `pending_${index}_${item.file.name}`
          : `pending_${index}_url_${item.name || 'only'}`;
        files.push(filename);
        meta[filename] = {
          number: item.number,
          name: item.name,
          url: item.url
        };
      });
    }

    return files.map((f, index) => ({ 
      filename: f, 
      meta: meta[f] || {},
      evidence_number: f.startsWith('pending_') ? meta[f]?.number || '' : (meta[f]?.number || `${index + 1}`),
      evidence_name: f.startsWith('pending_') ? meta[f]?.name || '' : (meta[f]?.name || evidence_name),
      evidence_url: f.startsWith('pending_') ? '' : evidence_url,
      isPending: f.startsWith('pending_')
    }));
  })();

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ผลการดำเนินการ</h3>
          <p className="text-sm text-gray-600 mt-1">
            {indicator.sequence} : {indicator.indicator_name}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          กลับ
        </button>
      </div>

      <div className="p-6">
        {/* ข้อมูลเกณฑ์การประเมินจากการประเมินก่อนหน้า */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="text-md font-medium text-blue-900 mb-3">ข้อมูลเกณฑ์การประเมิน (จากการกำหนดเกณฑ์)</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-700">ค่าเป้าหมาย</div>
              <div className="font-medium text-blue-900">{criteriaData.target_value || 'ยังไม่ได้กำหนด'}</div>
            </div>
            <div>
              <div className="text-blue-700">คะแนนค่าเป้าหมาย</div>
              <div className="font-medium text-blue-900">{criteriaData.score || 'ยังไม่ได้กำหนด'}</div>
            </div>
          </div>
        </div>

        {/* ฟอร์มผลการดำเนินการ */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            
            {/* ผลการดำเนินงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ผลการดำเนินงาน <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={operationResult}
                onChange={setOperationResult}
                placeholder="กรอกผลการดำเนินงานที่เกิดขึ้นจริง"
                ariaLabel="ผลการดำเนินงาน"
                minHeight={160}
              />
              {/* Required hint for validation context; enforce before submit */}
              {!operationResult && (
                <div className="text-xs text-red-500 mt-1">จำเป็นต้องระบุข้อมูล</div>
              )}
            </div>

            {/* คะแนนผลการดำเนินงาน และ คะแนนอ้างอิงเกณฑ์ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คะแนนผลการดำเนินงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={operationScore}
                  onChange={(e) => setOperationScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0 - 5.0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คะแนนอ้างอิงเกณฑ์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={referenceScore}
                  onChange={(e) => setReferenceScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0 - 5.0"
                  required
                />
              </div>
            </div>

            {/* การบรรลุเป้า */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                การบรรลุเป้า <span className="text-red-500">*</span>
              </label>
              <select
                value={goalAchievement}
                onChange={(e) => setGoalAchievement(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">เลือกผลการบรรลุเป้า</option>
                <option value="บรรลุ">บรรลุ</option>
                <option value="ไม่บรรลุ">ไม่บรรลุ</option>
                <option value="บรรลุบางส่วน">บรรลุบางส่วน</option>
              </select>
            </div>

            {/* หลักฐานอ้างอิง */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หลักฐานอ้างอิง</label>
              
              {/* ตารางแสดงการอัปโหลดไฟล์ */}
              <div className="mb-4">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">รายการหลักฐานที่อัปโหลดแล้ว</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเลข</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อหลักฐานอ้างอิง</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เอกสารหลักฐาน</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL หลักฐาน</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {latestFiles.length > 0 ? (
                          latestFiles.map((file, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {file.meta?.number || `${index + 1}`}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {file.meta?.name || file.evidence_name || file.filename}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center space-x-2">
                                  {/* ตรวจสอบว่าเป็น URL-only หรือไม่ (ไม่มีไฟล์จริง) */}
                                  {file.filename.startsWith('url_') || file.filename.startsWith('pending_') && !file.filename.match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i) ? (
                                    <>
                                      <span className="text-gray-500">ไม่มีไฟล์</span>
                                      {file.isPending && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                          ยังไม่ได้บันทึก
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span className="break-all">
                                        {file.isPending ? file.filename.replace(/^pending_\d+_/, '') : file.filename}
                                      </span>
                                      {file.isPending ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                          ยังไม่ได้บันทึก
                                        </span>
                                      ) : (
                                        <a 
                                          href={`${BASE_URL}/api/view/${encodeURIComponent(file.filename)}`} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="text-blue-600 hover:text-blue-800 underline"
                                          title="ดาวน์โหลดไฟล์"
                                        >
                                          ดาวน์โหลด
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {/* แสดง URL เฉพาะเมื่อเป็น URL-only (ไม่มีไฟล์จริง) */}
                                {(file.filename.startsWith('url_') || file.filename.startsWith('pending_') && !file.filename.match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i)) && (file.meta?.url || file.evidence_url) ? (
                                  <a 
                                    href={file.meta?.url || file.evidence_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-green-600 hover:text-green-800 underline break-all"
                                  >
                                    เปิดลิงก์
                                  </a>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (file.isPending) {
                                      // ลบไฟล์ที่ยังไม่ได้บันทึก
                                      const pendingIndex = parseInt(file.filename.match(/pending_(\d+)_/)?.[1] || '0');
                                      setPendingEvidenceFiles(prev => prev.filter((_, i) => i !== pendingIndex));
                                    } else {
                                      // ลบไฟล์ที่บันทึกแล้ว
                                      handleRemoveFile(file.filename);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  title="ลบไฟล์"
                                >
                                  ลบ
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center space-y-2">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm">ยังไม่มีหลักฐานที่อัปโหลด</span>
                                <span className="text-xs text-gray-400">คลิกปุ่ม "เพิ่มหลักฐานอ้างอิง" เพื่ออัปโหลดไฟล์</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ปุ่มเพิ่ม/แก้ไขหลักฐานอ้างอิง */}
              <button
                type="button"
                onClick={() => setShowEvidenceModal(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                เพิ่มหลักฐานอ้างอิง
              </button>
            </div>

            {/* หมายเหตุ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
              <RichTextEditor
                value={comment}
                onChange={setComment}
                placeholder="กรอกหมายเหตุเพิ่มเติม (ถ้ามี)"
                ariaLabel="หมายเหตุ"
                minHeight={120}
              />
            </div>

            {/* วันและเวลาของผลการดำเนินการ (จะเป็น created_at อัตโนมัติ) */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">
                วันและเวลาของผลการดำเนินการ: {new Date().toLocaleString('th-TH')}
              </div>
            </div>
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกผลการดำเนินการ'}
            </button>
          </div>
        </form>
        {/* Evidence Modal */}
        {showEvidenceModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">กรอกหลักฐานอ้างอิง</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลข</label>
                  <input
                    type="text"
                    value={evidenceNumber}
                    onChange={(e) => setEvidenceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น 1.1-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักฐานอ้างอิง</label>
                  <input
                    type="text"
                    value={evidenceName}
                    onChange={(e) => setEvidenceName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ระบุชื่อเอกสาร/หลักฐาน"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">ประเภทหลักฐาน</label>
                  <div className="flex space-x-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="evidenceType"
                        value="file"
                        checked={evidenceType === 'file'}
                        onChange={(e) => {
                          setEvidenceType(e.target.value);
                          // ล้างข้อมูล URL เมื่อเลือกไฟล์
                          setEvidenceUrl('');
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">อัปโหลดไฟล์</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="evidenceType"
                        value="url"
                        checked={evidenceType === 'url'}
                        onChange={(e) => {
                          setEvidenceType(e.target.value);
                          // ล้างข้อมูลไฟล์เมื่อเลือก URL
                          setEvidenceFiles([]);
                          if (fileInputRef.current) {
                            try { fileInputRef.current.value = ''; } catch {}
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">URL หลักฐาน</span>
                    </label>
                  </div>
                </div>
                
                {evidenceType === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เอกสารหลักฐาน (อัปโหลดได้ครั้งละ 1 ไฟล์)</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert('ขนาดไฟล์ต้องไม่เกิน 10MB');
                            return;
                          }
                          setEvidenceFiles([file]);
                        }
                        try { e.target.value = ''; } catch {}
                      }}
                      className="w-full"
                      ref={fileInputRef}
                    />
                    <p className="mt-1 text-xs text-gray-500">รองรับ PDF และรูปภาพ ไม่เกินไฟล์ละ 10MB อัปโหลดได้ครั้งละ 1 ไฟล์</p>
                  </div>
                )}
                {evidenceFiles.length > 0 && (
                  <div className="text-xs text-gray-700 space-y-1">
                    {evidenceFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="break-all">{f.name}</span>
                        <button
                          type="button"
                          className="ml-auto text-red-600 hover:underline"
                          onClick={() => setEvidenceFiles(prev => {
                            const next = prev.filter((_, i) => i !== idx);
                            if (next.length === 0 && fileInputRef.current) {
                              try { fileInputRef.current.value = ''; } catch {}
                            }
                            return next;
                          })}
                          aria-label={`ลบ ${f.name}`}
                          title="ลบไฟล์ออกจากรายการที่เลือก"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {evidenceType === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL หลักฐาน</label>
                    <input
                      type="url"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น https://example.com/document.pdf"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    // ล้างข้อมูลใน modal เมื่อปิด
                    setEvidenceNumber('');
                    setEvidenceName('');
                    setEvidenceUrl('');
                    setEvidenceFiles([]);
                    setEvidenceType('file');
                    if (fileInputRef.current) {
                      try { fileInputRef.current.value = ''; } catch {}
                    }
                    setShowEvidenceModal(false);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    // ตรวจสอบว่ามีข้อมูลหลักฐานหรือไม่
                    if (!evidenceNumber && !evidenceName) {
                      alert('กรุณากรอกหมายเลขและชื่อหลักฐานอ้างอิง');
                      return;
                    }
                    
                    if (evidenceType === 'file' && evidenceFiles.length === 0) {
                      alert('กรุณาเลือกไฟล์หลักฐาน');
                      return;
                    }
                    
                    if (evidenceType === 'url' && !evidenceUrl) {
                      alert('กรุณากรอก URL หลักฐาน');
                      return;
                    }
                    
                    // ตรวจสอบหมายเลขหลักฐานซ้ำ (ทั้งใน pending และ saved files)
                    const isDuplicateInPending = pendingEvidenceFiles.some(item => 
                      item.number === evidenceNumber
                    );
                    
                    const isDuplicateInSaved = latestFiles.some(file => {
                      const fileMeta = file.meta || {};
                      return fileMeta.number === evidenceNumber;
                    });
                    
                    if (isDuplicateInPending || isDuplicateInSaved) {
                      alert(`หมายเลขหลักฐาน "${evidenceNumber}" มีอยู่แล้ว กรุณาใช้หมายเลขอื่น`);
                      return;
                    }
                    
                    // เก็บไฟล์หลักฐานไว้ใน state (ยังไม่บันทึกเข้าฐานข้อมูล)
                    
                    // กรณีที่มีไฟล์: เพิ่มไฟล์เดียวพร้อม metadata
                    if (evidenceType === 'file' && evidenceFiles.length > 0) {
                      setPendingEvidenceFiles(prev => [
                        ...prev,
                        {
                          file: evidenceFiles[0],
                          number: evidenceNumber || '',
                          name: evidenceName || '',
                          url: ''
                        }
                      ]);
                    } 
                    // กรณีที่เลือก URL: เพิ่มเฉพาะ metadata
                    else if (evidenceType === 'url' && evidenceUrl) {
                      setPendingEvidenceFiles(prev => [
                        ...prev,
                        {
                          file: null,
                          number: evidenceNumber || '',
                          name: evidenceName || '',
                          url: evidenceUrl || ''
                        }
                      ]);
                    }
                    
                    // ล้างข้อมูลใน modal
                    setEvidenceNumber('');
                    setEvidenceName('');
                    setEvidenceUrl('');
                    setEvidenceFiles([]);
                    setEvidenceType('file');
                    if (fileInputRef.current) {
                      try { fileInputRef.current.value = ''; } catch {}
                    }
                    
                    // ปิด modal
                    setShowEvidenceModal(false);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ลบระบบอัปโหลดไฟล์แยกรายการตามคำขอผู้ใช้ */}

        {/* ประวัติผลการดำเนินการ */}
        {evaluationHistory.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              ประวัติผลการดำเนินการ ({evaluationHistory.length} ครั้ง)
            </h4>
            <div className="space-y-4">
              {evaluationHistory.map((evaluation, index) => (
                <div key={evaluation.evaluation_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-900">
                      การประเมินครั้งที่ {evaluationHistory.length - index}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(evaluation.created_at).toLocaleString('th-TH')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">คะแนนผลการดำเนินงาน</label>
                      <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {evaluation.operation_score || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">คะแนนอ้างอิงเกณฑ์</label>
                      <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {evaluation.reference_score || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">การบรรลุเป้า</label>
                      <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {evaluation.goal_achievement || '-'}
                      </div>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">เอกสารหลักฐาน</label>
                        <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {(() => {
                            // ใช้ข้อมูลจาก evaluation ปัจจุบัน ไม่ใช่จาก latest
                            let files = [];
                            let meta = {};
                            
                            if (evaluation.evidence_files_json) {
                              try { files = JSON.parse(evaluation.evidence_files_json) || []; } catch {}
                            }
                            if (evaluation.evidence_meta_json) {
                              try { meta = JSON.parse(evaluation.evidence_meta_json) || {}; } catch {}
                            }
                            
                            // กรองเฉพาะไฟล์จริง (ไม่ใช่ URL-only)
                            const actualFiles = files.filter(fname => !fname.startsWith('url_'));
                            
                            return actualFiles.length ? (
                              <div className="space-y-2">
                                {actualFiles.map((fname, fileIndex) => {
                                  const fileMeta = meta[fname] || {};
                                  const evidenceNumber = fileMeta.number || `${fileIndex + 1}`;
                                  const evidenceName = fileMeta.name || evaluation.evidence_name || fname;
                                  
                                  return (
                                    <div key={fname} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                      <span className="text-xs text-gray-500 w-8 text-center">{evidenceNumber}</span>
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">{evidenceName}</div>
                                        <a href={`${BASE_URL}/api/view/${encodeURIComponent(fname)}`} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all text-xs block mt-1">
                                          {fname}
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (evaluation.evidence_file ? (
                              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                <span className="text-xs text-gray-500 w-8 text-center">1</span>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{evaluation.evidence_name || evaluation.evidence_file}</div>
                                  <a href={`${BASE_URL}/api/view/${encodeURIComponent(evaluation.evidence_file)}`} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all text-xs block mt-1">
                                    {evaluation.evidence_file}
                                  </a>
                                </div>
                              </div>
                            ) : '-')
                          })()}
                        </div>
                      </div>
                      <div className="lg:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">URL หลักฐาน</label>
                        <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {(() => {
                            // ใช้ข้อมูลจาก evaluation ปัจจุบัน ไม่ใช่จาก latest
                            let files = [];
                            let meta = {};
                            
                            if (evaluation.evidence_files_json) {
                              try { files = JSON.parse(evaluation.evidence_files_json) || []; } catch {}
                            }
                            if (evaluation.evidence_meta_json) {
                              try { meta = JSON.parse(evaluation.evidence_meta_json) || {}; } catch {}
                            }
                            
                            // กรองเฉพาะ URL-only
                            const urlOnlyFiles = files.filter(fname => fname.startsWith('url_'));
                            
                            return urlOnlyFiles.length ? (
                              <div className="space-y-2">
                                {urlOnlyFiles.map((fname, index) => {
                                  const fileMeta = meta[fname] || {};
                                  const evidenceNumber = fileMeta.number || `${index + 1}`;
                                  const evidenceName = fileMeta.name || `URL หลักฐาน ${index + 1}`;
                                  
                                  return (
                                    <div key={fname} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                      <span className="text-xs text-gray-500 w-8 text-center">{evidenceNumber}</span>
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">{evidenceName}</div>
                                        <a href={fileMeta.url} target="_blank" rel="noreferrer" className="text-green-600 underline break-all text-xs block mt-1">
                                          URL: เปิดลิงก์
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (evaluation.evidence_url ? (
                              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                <span className="text-xs text-gray-500 w-8 text-center">1</span>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{evaluation.evidence_name || 'URL หลักฐาน'}</div>
                                  <a href={evaluation.evidence_url} target="_blank" rel="noreferrer" className="text-green-600 underline break-all text-xs block mt-1">
                                    URL: เปิดลิงก์
                                  </a>
                                </div>
                              </div>
                            ) : '-')
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
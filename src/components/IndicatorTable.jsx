// src/components/IndicatorTable.jsx
import React, { useState, useEffect } from 'react';
import { AUNQA_SUBITEMS } from '../templates/aunqa';
import IndicatorForm from './IndicatorForm';
import { BASE_URL } from '../config/api.js';
import { Trash2 } from 'lucide-react';


export default function IndicatorTable({
  selectedComponent,
  indicators,
  onEditClick,
  onDeleteClick,
  onAddIndicator, // เพิ่ม prop สำหรับ handle การเพิ่มตัวบ่งชี้ (optional)
  onAfterBulkAdded,
  onAssessingChange,
  evaluatedMap = {},
  onMarkEvaluated
}) {
  const [showForm, setShowForm] = useState(true);

  const formatSequence = (seq) => {
    if (!seq) return '';
    try {
      return String(seq)
        .split('.')
        .map(part => String(parseInt(part, 10)))
        .join('.');
    } catch {
      return String(seq);
    }
  };

  const pad2 = (n) => {
    try { return String(parseInt(String(n), 10)).padStart(2, '0'); } catch { return '00'; }
  };

  const seedIndicatorsForMainCode = async (mainCode) => {
    const mainNumMatch = String(mainCode).match(/AUN\.(\d+)/i);
    const mainNum = mainNumMatch ? mainNumMatch[1] : '0';
    const mainPart = pad2(mainNum);
    const sessionId = localStorage.getItem('assessment_session_id') || '';
    const sel = localStorage.getItem('selectedProgramContext');
    const major = sel ? (JSON.parse(sel)?.majorName || '') : '';

    // 1) เพิ่มหัวข้อหลัก (บรรทัดหัว) ก่อน
    await fetch(`${BASE_URL}/api/indicators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component_id: selectedComponent.id,
        sequence: mainPart,
        indicator_type: 'ผลลัพธ์',
        criteria_type: 'เชิงคุณภาพ',
        indicator_name: indicatorName,
        data_source: '',
        session_id: sessionId,
        major_name: major
      })
    }).catch(() => { });

    // 2) เพิ่มหัวข้อย่อยตามเทมเพลต
    const list = AUNQA_SUBITEMS[mainCode] || [];
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      await fetch(`${BASE_URL}/api/indicators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component_id: selectedComponent.id,
          sequence: `${mainPart}.${it.seq}`,
          indicator_type: 'ผลลัพธ์',
          criteria_type: 'เชิงคุณภาพ',
          indicator_name: it.text,
          data_source: '',
          session_id: sessionId,
          major_name: major
        })
      }).catch(() => { });
    }
  };

  // State สำหรับฟอร์ม
  const [indicatorSequence, setIndicatorSequence] = useState('');
  const [indicatorType, setIndicatorType] = useState('');
  const [criteriaType, setCriteriaType] = useState('');
  const [indicatorName, setIndicatorName] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [error, setError] = useState('');
  const [flash, setFlash] = useState({ message: '', type: 'success' });
  const [assessIndicator, setAssessIndicator] = useState(null);
  const [assessTarget, setAssessTarget] = useState('');
  const [assessScore, setAssessScore] = useState('');
  const [assessComment, setAssessComment] = useState('');
  const [evaluatedIndicators, setEvaluatedIndicators] = useState(new Set()); // เก็บ ID ของตัวบ่งชี้ที่ประเมินแล้ว
  const [evaluationHistory, setEvaluationHistory] = useState([]); // เก็บประวัติการประเมินสำหรับตัวบ่งชี้ปัจจุบัน

  useEffect(() => {
    if (!flash.message) return;
    const t = setTimeout(() => setFlash({ message: '', type: 'success' }), 3000);
    return () => clearTimeout(t);
  }, [flash.message]);

  // ดึงข้อมูลการประเมินเพื่อเช็คสถานะ
  const fetchEvaluationStatus = async () => {
    if (!selectedComponent) return;
    try {
      let sessionId = localStorage.getItem('assessment_session_id') || '';
      const altId = sessionId && sessionId.length > 10 ? String(Math.floor(Number(sessionId) / 1000)) : '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();

      let res = await fetch(`${BASE_URL}/api/evaluations/history?${qs}`);
      if (res.ok) {
        let evaluations = await res.json();
        // กรองเฉพาะของ session ปัจจุบัน และสถานะที่ส่งแล้ว
        let list = (Array.isArray(evaluations) ? evaluations : [])
          .filter(ev => String(ev.session_id) === String(sessionId) && (ev.status ? String(ev.status).toLowerCase() === 'submitted' : true));
        // ลองใช้รูปแบบ seconds หากยังไม่เจอ
        if (list.length === 0 && altId) {
          list = (Array.isArray(evaluations) ? evaluations : [])
            .filter(ev => String(ev.session_id) === altId && (ev.status ? String(ev.status).toLowerCase() === 'submitted' : true));
          if (list.length > 0) {
            try { localStorage.setItem('assessment_session_id', altId); } catch { }
          }
        }
        let evaluatedIds = new Set(list.map(ev => String(ev.indicator_id)));
        // ถ้ายังว่าง ลองดึงผ่าน endpoint component_id เฉพาะ component ปัจจุบัน
        if (evaluatedIds.size === 0 && selectedComponent?.id) {
          const qs2 = new URLSearchParams({ component_id: selectedComponent.id, session_id: sessionId, major_name: major }).toString();
          const res2 = await fetch(`${BASE_URL}/api/evaluations?${qs2}`);
          if (res2.ok) {
            const rows = await res2.json();
            evaluatedIds = new Set((Array.isArray(rows) ? rows : []).map(r => String(r.indicator_id)));
          }
        }
        // ถ้ายังว่าง ให้ fallback legacy id
        if (evaluatedIds.size === 0) {
          const qsLegacy = new URLSearchParams({ session_id: '2147483647', major_name: major }).toString();
          const resLegacy = await fetch(`${BASE_URL}/api/evaluations/history?${qsLegacy}`);
          if (resLegacy.ok) {
            const rows = await resLegacy.json();
            evaluatedIds = new Set((Array.isArray(rows) ? rows : []).map(r => String(r.indicator_id)));
          }
        }
        setEvaluatedIndicators(evaluatedIds);
      } else {
        console.error('Failed to fetch evaluations:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error fetching evaluation status:', error);
    }
  };

  // เรียกดึงข้อมูลสถานะการประเมินเมื่อ component หรือ indicators เปลี่ยน
  useEffect(() => {
    fetchEvaluationStatus();
  }, [selectedComponent, indicators]);

  // ดึงข้อมูลการประเมินเฉพาะตัวบ่งชี้ที่เลือก
  const fetchIndicatorEvaluation = async (indicatorId) => {
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();

      // ลองหาใน session ปัจจุบันก่อน
      let res = await fetch(`${BASE_URL}/api/evaluations/history?${qs}`);
      if (res.ok) {
        const evaluations = await res.json();
        const evaluation = (Array.isArray(evaluations) ? evaluations : [])
          .filter(ev => String(ev.session_id) === String(sessionId))
          .find(ev => String(ev.indicator_id) === String(indicatorId));
        if (evaluation) return evaluation;
      }

      // ถ้าไม่พบ ให้ดึงทุก session ใน major เดียวกันผ่าน /api/evaluations
      if (selectedComponent?.id) {
        const qs2 = new URLSearchParams({ component_id: selectedComponent.id, major_name: major }).toString();
        res = await fetch(`${BASE_URL}/api/evaluations?${qs2}`);
        if (res.ok) {
          const rows = await res.json();
          const history = (Array.isArray(rows) ? rows : [])
            .filter(ev => String(ev.indicator_id) === String(indicatorId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          return history[0] || null;
        }
      }
    } catch (error) {
      console.error('Error fetching indicator evaluation:', error);
    }
    return null;
  };

  // ดึงประวัติการประเมินทั้งหมดของตัวบ่งชี้ (รวมทั้ง session ปัจจุบันและทั้งหมดใน major)
  const fetchIndicatorHistory = async (indicatorId) => {
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      if (!selectedComponent?.id) { setEvaluationHistory([]); return; }

      const qs1 = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      const qs2 = new URLSearchParams({ component_id: selectedComponent.id, major_name: major }).toString();

      const [res1, res2] = await Promise.all([
        fetch(`${BASE_URL}/api/evaluations/history?${qs1}`),
        fetch(`${BASE_URL}/api/evaluations?${qs2}`)
      ]);

      const arr1 = res1.ok ? await res1.json() : [];
      const arr2 = res2.ok ? await res2.json() : [];

      const merged = [...(Array.isArray(arr1) ? arr1 : []), ...(Array.isArray(arr2) ? arr2 : [])];

      // กรองเฉพาะตัวบ่งชี้นี้ และลบซ้ำตาม evaluation_id
      const byIndicator = merged.filter(ev => String(ev.indicator_id) === String(indicatorId));
      const seen = new Set();
      const deduped = [];
      for (const ev of byIndicator) {
        const key = String(ev.evaluation_id || `${ev.session_id}-${ev.indicator_id}-${ev.created_at}`);
        if (!seen.has(key)) { seen.add(key); deduped.push(ev); }
      }

      deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setEvaluationHistory(deduped);
    } catch (error) {
      console.error('Error fetching indicator history:', error);
      setEvaluationHistory([]);
    }
  };

  // ฟังอีเวนต์จากพาเรนท์เพื่อปิดหน้าเกณฑ์ (ใช้ตอนกดปุ่มกลับด้านบนของ DefineComponentSection)
  useEffect(() => {
    const handler = () => setAssessIndicator(null);
    window.addEventListener('close-assessment', handler);
    return () => window.removeEventListener('close-assessment', handler);
  }, []);

  // แจ้งให้หน้าพ่อทราบสถานะการอยู่ในหน้าประเมิน เพื่อซ่อน/แสดงปุ่มกลับของหน้าด้านนอก
  useEffect(() => {
    if (typeof onAfterBulkAdded === 'undefined' && typeof onAssessingChange === 'undefined') return;
    if (typeof onAssessingChange === 'function') {
      try { onAssessingChange(Boolean(assessIndicator)); } catch { }
    }
  }, [assessIndicator]);

  if (!selectedComponent || !indicators[selectedComponent.id]) {
    return null;
  }
  const indicatorList = indicators[selectedComponent.id] || [];

  const handleOpenForm = () => {
    setShowForm(true);
    setIndicatorSequence('');
    setIndicatorType('');
    setCriteriaType('');
    setIndicatorName('');
    setDataSource('');
    setError('');
  };

  const handleCancel = () => {
    // คงฟอร์มไว้ เคลียร์ค่าเฉยๆ
    setIndicatorSequence('');
    setIndicatorType('');
    setCriteriaType('');
    setIndicatorName('');
    setDataSource('');
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mainMatch = String(indicatorName || '').match(/^\s*AUN\.(\d+)/i);
    if (!mainMatch) {
      if (!indicatorSequence || !indicatorType || !criteriaType || !indicatorName) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      // ตรวจซ้ำก่อนเพิ่ม (ลำดับหรือชื่อซ้ำ)
      const dupBySeq = indicatorList.some(ind => String(ind.sequence) === String(indicatorSequence));
      const dupByName = indicatorList.some(ind => String(ind.indicator_name || '').trim() === String(indicatorName).trim());
      if (dupBySeq || dupByName) {
        setFlash({ message: 'เพิ่มตัวบ่งชี้นี้ไปแล้ว', type: 'error' });
        return;
      }
    }
    // สร้าง object ตัวบ่งชี้ใหม่
    const newIndicator = {
      component_id: selectedComponent.id,
      sequence: indicatorSequence,
      indicator_type: indicatorType,
      criteria_type: criteriaType,
      indicator_name: indicatorName,
      data_source: dataSource
    };
    try {
      if (mainMatch) {
        const mainCode = `AUN.${mainMatch[1]}`;
        const mainPart = pad2(mainMatch[1]);
        // ตรวจซ้ำหัวข้อหลัก (ดูจาก sequence หัวข้อหลักหรือชื่อหัวข้อหลัก)
        const existsMain = indicatorList.some(ind => String(ind.sequence) === mainPart || String(ind.indicator_name || '').trim() === String(indicatorName).trim());
        if (existsMain) {
          setSuccessMsg('เพิ่มตัวบ่งชี้นี้ไปแล้ว');
          return;
        }
        await seedIndicatorsForMainCode(mainCode);
        // แจ้งให้หน้าพ่อ refresh เฉพาะรายการ โดยไม่ออกจากหน้า
        if (typeof onAfterBulkAdded === 'function') {
          try { await onAfterBulkAdded(selectedComponent); } catch { }
        }
        setFlash({ message: 'เพิ่มตัวบ่งชี้เรียบร้อย', type: 'success' });
        return;
      }
      // เรียก API เพิ่มตัวบ่งชี้
      const res = await fetch(`${BASE_URL}/api/indicators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIndicator)
      });
      if (res.ok) {
        setIndicatorSequence('');
        setIndicatorType('');
        setCriteriaType('');
        setIndicatorName('');
        setDataSource('');
        setError('');
        if (typeof onAddIndicator === 'function') {
          const result = await res.json();
          onAddIndicator(result.indicator, selectedComponent.id);
        }
        setFlash({ message: 'เพิ่มตัวบ่งชี้เรียบร้อย', type: 'success' });
      } else {
        setError('บันทึกตัวบ่งชี้ไม่สำเร็จ');
      }
    } catch (err) {
      setError('');
      setFlash({ message: 'เพิ่มตัวบ่งชี้นี้ไปแล้ว', type: 'error' });
    }
  };

  const handleSubmitAssessment = async () => {
    if (!assessIndicator) return;
    let sessionId = localStorage.getItem('assessment_session_id') || '';
    const normalizedId = sessionId && sessionId.length > 10 ? String(Math.floor(Number(sessionId) / 1000)) : sessionId;
    if (normalizedId !== sessionId) {
      try { localStorage.setItem('assessment_session_id', normalizedId); } catch { }
    }
    const sel = localStorage.getItem('selectedProgramContext');
    const major = sel ? (JSON.parse(sel)?.majorName || '') : '';

    // เช็คว่าเคยประเมินแล้วหรือไม่
    const existingEvaluation = await fetchIndicatorEvaluation(assessIndicator.id);

    const formData = new FormData();
    formData.append('session_id', normalizedId);
    formData.append('indicator_id', assessIndicator.id);
    formData.append('score', assessScore);
    formData.append('target_value', assessTarget); // เก็บ target ใน target_value field
    formData.append('comment', assessComment);
    formData.append('status', 'submitted');
    formData.append('major_name', major);

    console.log('Sending evaluation data:', {
      session_id: sessionId,
      indicator_id: assessIndicator.id,
      score: assessScore,
      target_value: assessTarget,
      comment: assessComment,
      major_name: major
    });

    try {
      const res = await fetch(`${BASE_URL}/api/evaluations`, { method: 'POST', body: formData });
      const responseText = await res.text();
      console.log('Server response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { success: false, error: 'Invalid response format' };
      }

      if (res.ok && responseData.success) {
        const message = existingEvaluation ?
          'อัปเดตเกณฑ์การประเมินเรียบร้อย' :
          'บันทึกเกณฑ์การประเมินเรียบร้อย';
        setFlash({ message, type: 'success' });
        setAssessIndicator(null);
        setAssessTarget('');
        setAssessScore('');
        setAssessComment('');
        // อัปเดตสถานะการประเมิน
        await fetchEvaluationStatus();
        // รีเฟรชประวัติการประเมิน
        if (assessIndicator) {
          await fetchIndicatorHistory(assessIndicator.id);
        }
        // reset all fields
      } else {
        const errorMessage = responseData.error || responseData.details || 'บันทึกไม่สำเร็จ';
        setFlash({ message: errorMessage, type: 'error' });
        console.error('Server error:', responseData);
      }
    } catch (error) {
      console.error('Network error:', error);
      setFlash({ message: 'บันทึกไม่สำเร็จ: ' + error.message, type: 'error' });
    }
  };

  // Single-view mode: show only assessment form when assessIndicator is selected
  if (assessIndicator) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">เกณฑ์การประเมิน</h3>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            onClick={() => { setAssessIndicator(null); if (typeof onAssessingChange === 'function') { try { onAssessingChange(false); } catch { } } }}
          >
            กลับ
          </button>
        </div>
        {flash.message && (
          <div className={`mb-4 rounded-md px-4 py-2 border ${flash.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {flash.message}
            <button className={`${flash.type === 'success' ? 'text-green-700' : 'text-red-700'} float-right`} onClick={() => setFlash({ message: '', type: 'success' })}>×</button>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="text-sm text-gray-700 mb-2">{assessIndicator.sequence} : {assessIndicator.indicator_name}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">ชนิดตัวบ่งชี้</div>
                <div className="font-medium">{assessIndicator.indicator_type || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">ชนิดเกณฑ์มาตรฐาน</div>
                <div className="font-medium">{assessIndicator.criteria_type || '-'}</div>
              </div>
            </div>
          </div>
          <div className="p-4">
            {/* เกณฑ์การประเมิน - แสดงเป็นตาราง */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">เกณฑ์การประเมิน</label>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">ระดับ 1</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">ระดับ 2</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">ระดับ 3</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">ระดับ 4</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-700">ระดับ 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">มีการดำเนินงานระดับ 1</td>
                      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">มีการดำเนินงานระดับ 2</td>
                      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">มีการดำเนินงานระดับ 3</td>
                      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">มีการดำเนินงานระดับ 4</td>
                      <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">มีการดำเนินงานระดับ 5-7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ช่องกรอกข้อมูล */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ค่าเป้าหมาย</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assessTarget}
                  onChange={e => setAssessTarget(e.target.value)}
                  placeholder="กรอกค่าเป้าหมาย"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนค่าเป้าหมาย</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assessScore}
                  onChange={e => setAssessScore(e.target.value)}
                  placeholder="0.0 - 5.0"
                />
              </div>
            </div>

            {/* ช่องหมายเหตุ */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={assessComment}
                onChange={e => setAssessComment(e.target.value)}
                placeholder="กรอกหมายเหตุเพิ่มเติม (ถ้ามี)"
              />
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700" onClick={() => setAssessIndicator(null)}>ยกเลิก</button>
              <button className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700" onClick={handleSubmitAssessment}>บันทึก</button>
            </div>
          </div>
        </div>

        {/* แสดงประวัติการประเมิน */}
        {evaluationHistory.length > 0 && (
          <div className="mt-6 bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">ประวัติการประเมิน ({evaluationHistory.length} ครั้ง)</h4>
            </div>
            <div className="p-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ค่าเป้าหมาย</label>
                        <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {evaluation.target_value || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">คะแนน</label>
                        <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {evaluation.score || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">หมายเหตุ</label>
                        <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {evaluation.comment || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">ข้อมูลตัวบ่งชี้ที่กำหนดไว้:</h3>
      </div>

      {showForm && (
        <div className="mb-8">
          <IndicatorForm
            selectedComponent={selectedComponent}
            indicatorSequence={indicatorSequence}
            setIndicatorSequence={setIndicatorSequence}
            indicatorType={indicatorType}
            setIndicatorType={setIndicatorType}
            criteriaType={criteriaType}
            setCriteriaType={setCriteriaType}
            indicatorName={indicatorName}
            setIndicatorName={setIndicatorName}
            dataSource={dataSource}
            setDataSource={setDataSource}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            error={error}
            flash={flash}
            onDismissFlash={() => setFlash({ message: '', type: 'success' })}
          />
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  ลำดับ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  ตัวบ่งชี้
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  ชนิดตัวบ่งชี้
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  ชนิดเกณฑ์มาตรฐาน
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicatorList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">ไม่มีข้อมูลตัวบ่งชี้</td>
                </tr>
              ) : (
                indicatorList.map((indicator) => (
                  <tr key={indicator.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                      {String(indicator.sequence).includes('.') ? (
                        <span>{formatSequence(indicator.sequence)}</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold">
                          {formatSequence(indicator.sequence)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className={(String(indicator.sequence).includes('.') ? 'font-medium' : 'font-bold') + ' text-gray-900'}>
                        {indicator.indicator_name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-900 border-r border-gray-200">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {indicator.indicator_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-900 border-r border-gray-200">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {indicator.criteria_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onDeleteClick(indicator.id, selectedComponent.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 group"
                        title="ลบตัวบ่งชี้"
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

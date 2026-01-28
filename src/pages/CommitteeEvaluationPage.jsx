// src/pages/CommitteeEvaluationPage.jsx
import React, { useState, useEffect } from 'react';
import ProgramSelection from '../components/ProgramSelection.jsx';
// import CommitteeEvaluationModal from '../components/CommitteeEvaluationModal.jsx';

export default function CommitteeEvaluationPage() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewComponent, setViewComponent] = useState(null);
  const [viewIndicators, setViewIndicators] = useState([]);
  const [componentIndicatorsCount, setComponentIndicatorsCount] = useState({}); // componentId -> count of main indicators
  const [evaluatingIndicator, setEvaluatingIndicator] = useState(null);
  const [flash, setFlash] = useState({ message: '', type: 'success' });
  const [rows, setRows] = useState([]); // evaluations_actual
  const [criteriaMap, setCriteriaMap] = useState({}); // indicator_id -> { target_value, score }
  const [committeeMap, setCommitteeMap] = useState({}); // indicator_id -> { committee_score, strengths, improvements }
  // ฟิลด์แก้ไขของหน้าแบบเต็ม (ต้องอยู่นอกการเรนเดอร์แบบมีเงื่อนไข เพื่อไม่ให้ผิดกติกา Hooks)
  const [editorScore, setEditorScore] = useState('');
  const [editorStrengths, setEditorStrengths] = useState('');
  const [editorImprovements, setEditorImprovements] = useState('');

  useEffect(() => {
    // สำหรับหน้าสรุปผลการประเมิน ให้เริ่มต้นใหม่เสมอ
    // ล้างข้อมูลเก่าและไม่โหลดจาก localStorage
    setSelectedProgram(null);
    setViewComponent(null);
    setViewIndicators([]);
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchComponents();
      // โหลดข้อมูลจากหน้าสรุปผลการดำเนินการ
      fetchEvaluationData();
    }
  }, [selectedProgram]);

  // นับจำนวนหัวข้อหลักของตัวบ่งชี้ต่อองค์ประกอบ
  useEffect(() => {
    const sessionId = localStorage.getItem('assessment_session_id') || '';
    const major = selectedProgram?.majorName || selectedProgram?.major_name || '';
    if (!sessionId || !major || components.length === 0) return;
    (async () => {
      const countMap = {};
      for (const comp of components) {
        try {
          const res = await fetch(`http://localhost:3001/api/indicators-by-component/${encodeURIComponent(comp.id)}?session_id=${sessionId}&major_name=${encodeURIComponent(major)}`);
          const inds = res.ok ? await res.json() : [];
          const mainCount = (Array.isArray(inds) ? inds : []).filter(ind => !String(ind?.sequence ?? '').includes('.')).length;
          countMap[comp.id] = mainCount;
        } catch {
          countMap[comp.id] = 0;
        }
      }
      setComponentIndicatorsCount(countMap);
    })();
  }, [components, selectedProgram]);

  // ตั้งค่า initial values เมื่อเลือกตัวบ่งชี้เพื่อประเมิน
  useEffect(() => {
    if (!evaluatingIndicator) return;
    const key = String(evaluatingIndicator.id);
    const committee = committeeMap[key] || {};
    setEditorScore(committee.committee_score || '');
    setEditorStrengths(committee.strengths || '');
    setEditorImprovements(committee.improvements || '');
  }, [evaluatingIndicator, committeeMap]);

  const fetchComponents = async () => {
    if (!selectedProgram) return;
    
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram.majorName || selectedProgram.major_name;
      const response = await fetch(`http://localhost:3001/api/quality-components?major_name=${encodeURIComponent(major)}&session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setComponents(data);
      }
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllIndicators = async () => {
    if (!selectedProgram) return;
    
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram.majorName || selectedProgram.major_name;
      const response = await fetch(`http://localhost:3001/api/indicators?major_name=${encodeURIComponent(major)}&session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setViewIndicators(data);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    }
  };

  const fetchEvaluationData = async () => {
    if (!selectedProgram) return;
    
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram.majorName || selectedProgram.major_name;
      
      // โหลดข้อมูล evaluations_actual
      const actualResponse = await fetch(`http://localhost:3001/api/evaluations-actual/history?session_id=${sessionId}&major_name=${major}`);
      if (actualResponse.ok) {
        const actualData = await actualResponse.json();
        setRows(Array.isArray(actualData) ? actualData : []);
      }
      
      // โหลดข้อมูลเกณฑ์ (target, score)
      const criteriaResponse = await fetch(`http://localhost:3001/api/evaluations/history?session_id=${sessionId}&major_name=${major}`);
      if (criteriaResponse.ok) {
        const criteriaData = await criteriaResponse.json();
        const map = {};
        (Array.isArray(criteriaData) ? criteriaData : []).forEach(r => {
          map[String(r.indicator_id)] = { target_value: r.target_value || '', score: r.score || '' };
        });
        setCriteriaMap(map);
      }
      
      // โหลดข้อมูลกรรมการประเมิน
      const committeeResponse = await fetch(`http://localhost:3001/api/committee-evaluations?session_id=${sessionId}&major_name=${major}`);
      if (committeeResponse.ok) {
        const committeeData = await committeeResponse.json();
        const map = {};
        (Array.isArray(committeeData) ? committeeData : []).forEach(r => {
          map[String(r.indicator_id)] = { 
            committee_score: r.committee_score || '', 
            strengths: r.strengths || '', 
            improvements: r.improvements || '' 
          };
        });
        setCommitteeMap(map);
      }
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
    }
  };

  const handleViewIndicators = async (component) => {
    setViewComponent(component);
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram.majorName || selectedProgram.major_name;
      // ใช้ endpoint เดียวกับหน้า "สรุปผลการดำเนินการ" เพื่อดึงตัวบ่งชี้ตามองค์ประกอบ
      const response = await fetch(
        `http://localhost:3001/api/indicators-by-component/${encodeURIComponent(component.id)}?session_id=${sessionId}&major_name=${encodeURIComponent(major)}`
      );
      if (response.ok) {
        const data = await response.json();
        setViewIndicators(data);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationComplete = () => {
    setEvaluatingIndicator(null);
    setFlash({ message: 'บันทึกการประเมินเรียบร้อย', type: 'success' });
    // รีเฟรชข้อมูล
    if (viewComponent) {
      handleViewIndicators(viewComponent);
    }
  };

  const handleEvaluationCancel = () => {
    setEvaluatingIndicator(null);
  };

  const handleEvaluationSaved = () => {
    // รีเฟรชข้อมูลหลังจากบันทึกการประเมิน
    fetchEvaluationData();
    setFlash({ message: 'บันทึกการประเมินเรียบร้อยแล้ว', type: 'success' });
    setTimeout(() => setFlash({ message: '', type: 'success' }), 3000);
  };

  const handleSaveCommittee = async () => {
    if (!evaluatingIndicator) return;
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram.majorName || selectedProgram.major_name;
      const body = {
        session_id: sessionId,
        major_name: major,
        indicator_id: evaluatingIndicator.id,
        committee_score: editorScore,
        strengths: editorStrengths,
        improvements: editorImprovements,
      };
      const res = await fetch('http://localhost:3001/api/committee-evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setCommitteeMap(prev => ({
          ...prev,
          [String(evaluatingIndicator.id)]: { committee_score: editorScore, strengths: editorStrengths, improvements: editorImprovements },
        }));
        handleEvaluationSaved();
        setEvaluatingIndicator(null);
      } else {
        setFlash({ message: 'บันทึกไม่สำเร็จ', type: 'error' });
      }
    } catch (e) {
      setFlash({ message: 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
    }
  };

  // หากกำลังประเมิน ให้แสดงหน้าเต็มเหมือน Summary + ช่องกรอกคะแนนกรรมการ
  if (evaluatingIndicator) {
    const ind = evaluatingIndicator;
    const latest = rows
      .filter(r => String(r.indicator_id) === String(ind.id))
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
    const crit = criteriaMap[String(ind.id)] || {};
    const committee = committeeMap[String(ind.id)] || {};

    // สร้างส่วนแสดงหลักฐานอ้างอิงเหมือน SummaryPage
    const renderEvidence = () => {
      const evidenceFiles = [];
      let evidenceMeta = {};
      if (latest?.evidence_files_json) {
        try {
          const files = JSON.parse(latest.evidence_files_json);
          if (Array.isArray(files)) evidenceFiles.push(...files);
        } catch {}
      }
      if (latest?.evidence_file && !evidenceFiles.includes(latest.evidence_file)) {
        evidenceFiles.push(latest.evidence_file);
      }
      if (latest?.evidence_meta_json) {
        try { evidenceMeta = JSON.parse(latest.evidence_meta_json) || {}; } catch {}
      }
      if (evidenceFiles.length === 0) {
        return (
          <div className="text-center py-4 text-gray-500">
            <div className="text-sm">ไม่มีหลักฐานอ้างอิง</div>
          </div>
        );
      }
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเลข</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อหลักฐานอ้างอิง</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">เอกสารหลักฐาน</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evidenceFiles.map((filename, index) => {
                const fileMeta = evidenceMeta[filename] || {};
                const evidenceNumber = fileMeta.number || `${index + 1}`;
                const evidenceName = fileMeta.name || latest?.evidence_name || filename;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium text-center bg-gray-50 w-20">{evidenceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{evidenceName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {filename.startsWith('url_') ? (
                        <a href={fileMeta.url || latest?.evidence_url || '#'} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-800 underline cursor-pointer">URL: เปิดลิงก์</a>
                      ) : (
                        <a href={`http://localhost:3001/api/view/${encodeURIComponent(filename)}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline cursor-pointer">ไฟล์: เปิดไฟล์</a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">รายละเอียด</div>
              <div className="font-semibold">{ind.sequence} : {ind.indicator_name}</div>
            </div>
            <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded" onClick={()=>{ setEvaluatingIndicator(null); }}>กลับ</button>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
              {ind.sequence} {ind.indicator_name}
            </div>
            {/* ผลการดำเนินงาน (Rich text) */}
            <div>
              <div className="font-semibold mb-2">ผลการดำเนินงาน</div>
              <div
                className="prose max-w-none border rounded p-3"
                dangerouslySetInnerHTML={{ __html: latest?.operation_result || '<em>ไม่มีข้อมูล</em>' }}
              />
            </div>
            <div className="border-2 border-green-300 rounded p-3">
              <div className="text-center text-sm text-gray-700 mb-3 font-medium">ผลการดำเนินงาน ปีการศึกษา</div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-center">ค่าเป้าหมาย</th>
                      <th className="px-3 py-2 text-center">คะแนนค่าเป้าหมาย</th>
                      <th className="px-3 py-2 text-center">ผลการดำเนินงาน</th>
                      <th className="px-3 py-2 text-center">คะแนนอ้างอิงเกณฑ์</th>
                      <th className="px-3 py-2 text-center">การบรรลุเป้าหมาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 text-center">{crit.target_value || '-'}</td>
                      <td className="px-3 py-2 text-center">{crit.score || '-'}</td>
                      <td className="px-3 py-2 text-center">{latest?.operation_score ?? '-'}</td>
                      <td className="px-3 py-2 text-center">{latest?.reference_score ?? '-'}</td>
                      <td className="px-3 py-2 text-center">{latest?.goal_achievement ?? '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-2 border-orange-300 rounded p-3 space-y-4">
              <div>
                <div className="font-medium">คะแนนประเมิน (กรรมการ)</div>
                <input type="number" inputMode="decimal" value={editorScore} onChange={e=>setEditorScore(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="กรอกคะแนนกรรมการ" />
              </div>
              <div>
                <div className="font-medium">Strengths (จุดแข็ง)</div>
                <textarea value={editorStrengths} onChange={e=>setEditorStrengths(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={4} placeholder="พิมพ์จุดแข็ง" />
              </div>
              <div>
                <div className="font-medium">Areas for Improvement (เรื่องที่พัฒนา/ปรับปรุงได้)</div>
                <textarea value={editorImprovements} onChange={e=>setEditorImprovements(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={4} placeholder="พิมพ์ข้อที่ควรพัฒนา" />
              </div>
              <div className="flex gap-2 justify-end">
                <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded" onClick={()=> setEvaluatingIndicator(null)}>ยกเลิก</button>
                <button className="px-4 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700" onClick={handleSaveCommittee}>บันทึก</button>
              </div>
            </div>

            {/* ส่วนแสดงหลักฐานอ้างอิง */}
            <div className="border-2 border-purple-300 rounded p-3">
              <div className="font-medium mb-3">รายการหลักฐานอ้างอิง</div>
              {renderEvidence()}
            </div>
            <div className="text-xs text-gray-500">บันทึกล่าสุด: {latest ? new Date(latest.created_at).toLocaleString('th-TH') : '-'}</div>
          </div>
        </div>
      </div>
    );
  }

  // หากยังไม่ได้เลือกสาขา ให้แสดงหน้าเลือกสาขา
  if (!selectedProgram) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">สรุปผลการประเมิน</h2>
          <p className="text-gray-600 mt-1">กรุณาเลือกสาขาที่ต้องการประเมิน</p>
        </div>
        <ProgramSelection
          onComplete={(s) => { 
            setSelectedProgram(s); 
            try { localStorage.setItem('selectedProgramContext', JSON.stringify(s)); } catch {}
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {flash.message && (
        <div className={`mb-4 p-3 rounded ${flash.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {flash.message}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">สรุปผลการประเมิน</h1>
          <p className="text-sm text-gray-600">สาขา: {selectedProgram.majorName || selectedProgram.major_name}</p>
        </div>
        <button
          onClick={() => setSelectedProgram(null)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          เปลี่ยนสาขา
        </button>
      </div>

      {/* Flash Message */}
      {flash.message && (
        <div className={`mb-4 rounded-md px-4 py-2 border ${
          flash.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {flash.message}
          <button 
            className={`${flash.type === 'success' ? 'text-green-700' : 'text-red-700'} float-right`}
            onClick={() => setFlash({ message: '', type: 'success' })}
          >
            ×
          </button>
        </div>
      )}

      {/* ตารางองค์ประกอบหลัก */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">องค์ประกอบที่</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ชื่อองค์ประกอบ</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">แสดง</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ตัวบ่งชี้</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6">กำลังโหลด...</td></tr>
              ) : components.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">ยังไม่มีองค์ประกอบ</td></tr>
              ) : (
                components.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold">{c.component_id || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{c.quality_name}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="inline-flex items-center px-3 py-1.5 text-xs rounded bg-blue-100 text-black" onClick={() => handleViewIndicators(c)}>แสดง</button>
                    </td>
                    <td className="px-4 py-3 text-center">{componentIndicatorsCount[c.id] ?? '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="inline-flex items-center px-3 py-1.5 text-xs rounded border" onClick={() => handleViewIndicators(c)}>ตัวบ่งชี้</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* รายการตัวบ่งชี้ขององค์ประกอบที่เลือก */}
      {viewComponent && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">ตัวบ่งชี้ขององค์ประกอบ</div>
              <div className="font-semibold">{viewComponent.quality_name}</div>
            </div>
            <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded" onClick={()=>{setViewComponent(null); setViewIndicators([]);}}>ปิด</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ชื่อตัวบ่งชี้</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">คะแนนค่าเป้าหมาย</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ผลประเมินตนเอง</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ผลการดำเนินการ</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">การบรรลุเป้าหมาย</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ผลประเมินกรรมการ</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ประเมินผล</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-6">กำลังโหลด...</td></tr>
                ) : viewIndicators.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-6 text-gray-400">ยังไม่มีตัวบ่งชี้</td></tr>
                ) : (
                  viewIndicators
                    // แสดงเฉพาะตัวบ่งชี้ที่มีผลการดำเนินการแล้ว (อิงจากหน้าผลการดำเนินการ)
                    .filter((ind) => rows.some(r => String(r.indicator_id) === String(ind.id)))
                    .map((ind) => (
                    <tr key={ind.id}>
                      <td className="px-4 py-3 text-center text-sm">
                        {String(ind.sequence).includes('.') ? (
                          <span>{ind.sequence}</span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold">
                            {ind.sequence}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-left">
                        <div className={(String(ind.sequence).includes('.') ? 'font-normal' : 'font-bold') + ' text-gray-900 text-left'}>
                          {ind.indicator_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {criteriaMap[String(ind.id)]?.target_value || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {criteriaMap[String(ind.id)]?.score || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(() => {
                          const actual = rows.find(r => String(r.indicator_id) === String(ind.id));
                          return actual ? `${actual.operation_score ?? '-'}` : '-';
                        })()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(() => {
                          const actual = rows.find(r => String(r.indicator_id) === String(ind.id));
                          return actual ? `${actual.goal_achievement ?? '-'}` : '-';
                        })()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {committeeMap[String(ind.id)]?.committee_score || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setEvaluatingIndicator(ind)}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded bg-orange-600 text-white hover:bg-orange-700"
                        >
                          ประเมินผล
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-gray-500 border-t">หน้าสำหรับกรรมการประเมิน</div>
        </div>
      )}
    </div>
  );
}
// src/pages/AssessmentTablePage.jsx
import React, { useEffect, useState } from 'react';
import AssessmentTable from '../components/AssessmentTable';
import { BASE_URL } from '../config/api.js';


export default function AssessmentTablePage({ setActiveTab }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [indicators, setIndicators] = useState({});
  const [loading, setLoading] = useState(false);
  const [indicatorMap, setIndicatorMap] = useState({}); // { [id]: { id, sequence, indicator_name, component_id } }
  const [evidenceRows, setEvidenceRows] = useState([]); // flattened evidence rows for current session/major

  useEffect(() => {
    try {
      const sel = localStorage.getItem('selectedProgramContext');
      if (sel) setSelectedProgram(JSON.parse(sel));
    } catch {}
  }, []);

  useEffect(() => {
    const fetchComponents = async () => {
      if (!selectedProgram) return;
      setLoading(true);
      try {
        const sessionId = localStorage.getItem('assessment_session_id') || Date.now().toString();
        localStorage.setItem('assessment_session_id', sessionId);
        const apiUrl = `${BASE_URL}/api/quality-components?session_id=${sessionId}&major_name=${encodeURIComponent(selectedProgram.majorName)}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          setComponents(Array.isArray(data) ? data : []);
        } else {
          setComponents([]);
        }
      } catch {
        setComponents([]);
      }
      setLoading(false);
    };
    fetchComponents();
  }, [selectedProgram]);

  // Fetch all indicators map for resolving indicator_id -> sequence/name
  useEffect(() => {
    const fetchIndicators = async () => {
      if (!selectedProgram) return;
      try {
        const sessionId = localStorage.getItem('assessment_session_id') || '';
        const res = await fetch(`${BASE_URL}/api/indicators?session_id=${sessionId}&major_name=${encodeURIComponent(selectedProgram.majorName)}`);
        if (res.ok) {
          const data = await res.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(it => { map[String(it.id)] = it; });
          setIndicatorMap(map);
        } else {
          setIndicatorMap({});
        }
      } catch {
        setIndicatorMap({});
      }
    };
    fetchIndicators();
  }, [selectedProgram]);

  // Fetch actual evaluation history to list recently uploaded files
  useEffect(() => {
    const fetchEvidence = async () => {
      if (!selectedProgram) { setEvidenceRows([]); return; }
      try {
        const sessionId = localStorage.getItem('assessment_session_id') || '';
        const qs = new URLSearchParams({ session_id: sessionId, major_name: selectedProgram.majorName }).toString();
        const res = await fetch(`${BASE_URL}/api/evaluations-actual/history?${qs}`);
        let rows = [];
        if (res.ok) {
          rows = await res.json();
        }
        // Flatten files from evidence_file and evidence_files_json
        const flattened = [];
        (Array.isArray(rows) ? rows : []).forEach(r => {
          const files = [];
          if (r.evidence_files_json) {
            try { files.push(...(JSON.parse(r.evidence_files_json) || [])); } catch {}
          }
          if (r.evidence_file) {
            if (!files.includes(r.evidence_file)) files.push(r.evidence_file);
          }
          if (files.length === 0) return;
          files.forEach(fname => {
            flattened.push({
              evaluation_id: r.evaluation_id,
              indicator_id: String(r.indicator_id),
              file: fname,
              created_at: r.created_at
            });
          });
        });
        // Sort newest first
        flattened.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        setEvidenceRows(flattened);
      } catch {
        setEvidenceRows([]);
      }
    };
    fetchEvidence();
  }, [selectedProgram]);

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  if (!selectedProgram) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 mb-4">ยังไม่ได้เลือกสาขา</p>
          <button
            onClick={() => setActiveTab && setActiveTab('assessment')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            เลือกสาขา
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">สาขา: {selectedProgram.majorName}</h2>
            <p className="text-gray-600">คณะ: {selectedProgram.facultyName}</p>
          </div>
          <button
            onClick={() => { setActiveTab && setActiveTab('assessment'); }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            เปลี่ยนสาขา
          </button>
        </div>
      </div>

      {/* ตารางรายการหลักฐานอ้างอิง (ไฟล์ที่อัปโหลดล่าสุด) */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-900">
          รายการหลักฐานอ้างอิง (ไฟล์ที่อัปโหลดล่าสุด)
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">หมายเลข</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">รายการหลักฐานอ้างอิง</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {evidenceRows.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-500 text-sm">ยังไม่มีการอัปโหลดไฟล์</td></tr>
              ) : (
                evidenceRows.map((row, idx) => {
                  const ind = indicatorMap[row.indicator_id] || {};
                  const code = ind.sequence || `#${row.indicator_id}`;
                  const name = ind.indicator_name || 'ไฟล์หลักฐาน';
                  const href = `/uploads/${row.file}`;
                  return (
                    <tr key={`${row.evaluation_id}-${idx}`}>
                      <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-100">{code}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{name}</a>
                        <span className="ml-2 text-gray-500">({row.file})</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ตารางองค์ประกอบแบบอ่านอย่างเดียว */}
      {!selectedComponent && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">เลือกองค์ประกอบคุณภาพเพื่อประเมิน</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">องค์ประกอบที่</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">ชื่อองค์ประกอบ</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ตัวบ่งชี้</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-6 text-gray-500">กำลังโหลด...</td></tr>
                ) : components.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-gray-500">ไม่มีข้อมูลองค์ประกอบ</td></tr>
                ) : (
                  components.map((component, idx) => (
                    <tr key={component.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {component.component_id || idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="font-medium text-gray-900">{component.quality_name}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
                          onClick={() => handleComponentSelect(component)}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          ตัวบ่งชี้
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ตารางตัวบ่งชี้เพื่อประเมิน */}
      {selectedComponent && (
        <AssessmentTable
          mode="evaluation"
          selectedComponent={selectedComponent}
          indicators={indicators}
          selectedProgram={selectedProgram}
          onBack={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}








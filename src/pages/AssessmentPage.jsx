// src/pages/AssessmentPage.jsx
import React, { useState, useEffect } from 'react';
import { GraduationCap, Target, ClipboardList } from 'lucide-react';
import ProgramSelection from '../components/ProgramSelection';
import AssessmentTable from '../components/AssessmentTable';
import { BASE_URL } from '../config/api.js';


export default function AssessmentPage({ currentUser, setActiveTab, assessmentMode = 'evaluation' }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showComponents, setShowComponents] = useState(false);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [indicators, setIndicators] = useState({});
  const [loading, setLoading] = useState(false);

  // Debug log
  console.log('AssessmentPage rendered:', { selectedProgram, showComponents, components: components.length });

  // โหลดองค์ประกอบอัตโนมัติเมื่อเลือกโปรแกรม (อ่านอย่างเดียวเหมือนหน้าจัดการ)
  useEffect(() => {
    const fetchComponents = async () => {
      if (!selectedProgram) return;
      setLoading(true);
      try {
        // ใช้ seconds เพื่อไม่ให้เกินค่า INT ของฐานข้อมูล
        const sessionId = localStorage.getItem('assessment_session_id') || Math.floor(Date.now() / 1000).toString();
        localStorage.setItem('assessment_session_id', sessionId);
        const apiUrl = `${BASE_URL}/api/quality-components?session_id=${sessionId}&major_name=${encodeURIComponent(selectedProgram.majorName)}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          setComponents(Array.isArray(data) ? data : []);
          setShowComponents(true);
        } else {
          setComponents([]);
          setShowComponents(true);
        }
      } catch {
        setComponents([]);
        setShowComponents(true);
      }
      setLoading(false);
    };
    fetchComponents();
  }, [selectedProgram]);

  // โหลดตัวบ่งชี้เมื่อเลือกองค์ประกอบ
  useEffect(() => {
    if (selectedComponent) {
      fetchIndicators();
    }
  }, [selectedComponent]);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const compId = selectedComponent.id; // ใช้ id ขององค์ประกอบ (ตรงกับที่บันทึกตัวบ่งชี้)
      const url = `${BASE_URL}/api/indicators-by-component/${encodeURIComponent(compId)}?session_id=${sessionId}&major_name=${encodeURIComponent(selectedProgram.majorName)}`;
      let res = await fetch(url);
      let data = [];
      if (res.ok) {
        data = await res.json();
      }
      // ถ้าไม่พบในตารางตามสาขา ให้ลองดึงจากตารางกลาง
      if (!Array.isArray(data) || data.length === 0) {
        const baseRes = await fetch(`${BASE_URL}/api/indicators-by-component/${encodeURIComponent(compId)}`);
        if (baseRes.ok) {
          data = await baseRes.json();
        }
      }
      setIndicators(prev => ({ ...prev, [compId]: Array.isArray(data) ? data : [] }));
    } catch (error) {
      console.error('Error fetching indicators:', error);
    }
    setLoading(false);
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setSelectedComponent(null);
    setComponents([]);
    setIndicators({});
    setShowComponents(true); // โชว์ส่วนองค์ประกอบทันที (อ่านอย่างเดียว)
    try { localStorage.setItem('selectedProgramContext', JSON.stringify(program)); } catch { }
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  return (

    <div className="container mx-auto px-4">
      {/* การเลือกโปรแกรม - แสดงเฉพาะเมื่อยังไม่เริ่มประเมิน */}
      {!selectedProgram && (
        <div className="max-w-4xl mx-auto py-12">
          <div className="text-center mb-8">
            {assessmentMode === 'criteria' ? (
              <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            ) : (
              <ClipboardList className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {assessmentMode === 'criteria' ? 'กำหนดค่าเป้าหมาย' : 'ผลการดำเนินการ'}
            </h1>
            <p className="text-gray-600 mt-2">
              {assessmentMode === 'criteria'
                ? 'กรุณาเลือกสาขาที่ต้องการกำหนดค่าเป้าหมาย'
                : 'กรุณาเลือกสาขาที่ต้องการบันทึกผลการดำเนินงาน'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <ProgramSelection
              mode="assess"
              storageKey="assessmentProgramSelection"
              buttonText="ผลการดำเนินการ"
              onComplete={handleProgramSelect}
            />
          </div>
        </div>
      )}

      {/* ตัดปุ่มเริ่มประเมินออก และแสดงรายการองค์ประกอบอัตโนมัติแบบอ่านอย่างเดียว */}
      {selectedProgram && showComponents && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              สาขา : {selectedProgram.majorName}
            </h2>
            <button
              onClick={() => { setSelectedProgram(null); setShowComponents(false); setSelectedComponent(null); }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              เปลี่ยนสาขา
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* การเลือกองค์ประกอบ - แสดงเป็นตารางแบบเดียวกับหน้าจัดการ (อ่านอย่างเดียว) */}
              {components.length > 0 && !selectedComponent && (
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
                        {components.map((component, idx) => (
                          <tr key={component.id || idx} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {component.component_id || idx + 1}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                              <div className="font-medium text-gray-900">
                                {component.quality_name}
                              </div>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* แสดงตารางตัวบ่งชี้สำหรับบันทึกผลการดำเนินการ */}
              {selectedComponent && indicators[selectedComponent.id] && (
                <AssessmentTable
                  selectedComponent={selectedComponent}
                  indicators={indicators}
                  selectedProgram={selectedProgram}
                  mode={assessmentMode}
                  onBack={() => setSelectedComponent(null)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>

  );
}
import { useState, useEffect } from 'react';
import { Target, ClipboardList } from 'lucide-react';
import ProgramSelection from '../components/ProgramSelection';
import AssessmentTable from '../components/AssessmentTable';
import { BASE_URL } from '../config/api.js';

export default function AssessmentPage({ assessmentMode = 'evaluation' }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showComponents, setShowComponents] = useState(false);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [indicators, setIndicators] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeYear, setActiveYear] = useState(null);

  // Fetch active round on mount
  useEffect(() => {
    fetch(`${BASE_URL}/api/rounds`)
      .then(res => res.json())
      .then(data => {
        const active = data.find(r => r.is_active);
        if (active) setActiveYear(active.year);
        else if (data.length > 0) setActiveYear(data[0].year);
      })
      .catch(err => console.error('Failed to load rounds', err));
  }, []);

  const [sessionData, setSessionData] = useState({
    evaluations: [],
    evaluationsActual: []
  });

  // โหลดองค์ประกอบและข้อมูลสรุปอัตโนมัติเมื่อเลือกโปรแกรม
  useEffect(() => {
    const fetchFullSessionData = async () => {
      if (!selectedProgram) return;
      setLoading(true);
      try {
        const majorName = selectedProgram.majorName || selectedProgram.major_name || '';
        let sessionId = localStorage.getItem('assessment_session_id');

        // If session ID is missing, try to recover the latest one for this major from backend
        if (!sessionId) {
          console.log(`🔍 Attempting to recover latest session for: ${majorName}`);
          try {
            const recoveryRes = await fetch(`${BASE_URL}/api/assessment-sessions/latest?major_name=${encodeURIComponent(majorName)}`);
            if (recoveryRes.ok) {
              const recoveryData = await recoveryRes.json();
              if (recoveryData.session_id) {
                sessionId = recoveryData.session_id;
                console.log(`✅ Recovered session: ${sessionId}`);
                localStorage.setItem('assessment_session_id', sessionId);
              }
            }
          } catch (recoveryError) {
            console.warn('Session recovery failed:', recoveryError);
          }
        }

        // If still no session ID, generate a new one
        if (!sessionId) {
          sessionId = Math.floor(Date.now() / 1000).toString();
          localStorage.setItem('assessment_session_id', sessionId);
          console.log(`🆕 Created new session: ${sessionId}`);
        }

        const qsObj = { session_id: sessionId, major_name: majorName };
        if (activeYear) qsObj.year = activeYear;

        const qs = new URLSearchParams(qsObj).toString();

        // ใช้ Bulk endpoint ดึงข้อมูลทั้งหมดในครั้งเดียว
        const res = await fetch(`${BASE_URL}/api/bulk/session-summary?${qs}`);
        if (res.ok) {
          const data = await res.json();
          setComponents(Array.isArray(data.components) ? data.components : []);
          setSessionData({
            evaluations: data.evaluations || [],
            evaluationsActual: data.evaluations_actual || []
          });

          // จัดกลุ่ม indicators ตาม component_id ล่วงหน้า (ID-agnostic mapping)
          const indicatorsMap = {};
          if (Array.isArray(data.indicators)) {
            data.indicators.forEach(ind => {
              const cid = String(ind.component_id);
              if (!indicatorsMap[cid]) indicatorsMap[cid] = [];
              if (!indicatorsMap[cid].some(existing => existing.id === ind.id)) {
                indicatorsMap[cid].push(ind);
              }
            });

            // ตรวจสอบความถูกต้อง: ตรวจสอบให้แน่ใจว่าแต่ละ component มีตัวบ่งชี้ของตัวเองโดยดูจากทั้ง ID และ logical ID
            if (Array.isArray(data.components)) {
              data.components.forEach(comp => {
                const firestoreId = String(comp.id);
                const logicalId = String(comp.component_id);

                if (!indicatorsMap[firestoreId] && indicatorsMap[logicalId]) {
                  indicatorsMap[firestoreId] = indicatorsMap[logicalId];
                } else if (!indicatorsMap[logicalId] && indicatorsMap[firestoreId]) {
                  indicatorsMap[logicalId] = indicatorsMap[firestoreId];
                }
              });
            }
          }
          setIndicators(indicatorsMap);
          setShowComponents(true);
        } else {
          console.warn('API response not OK:', res.status, res.statusText);
          // ใช้ข้อมูลเริ่มต้นเมื่อ API ไม่พร้อมใช้งาน
          setComponents([]);
          setSessionData({ evaluations: [], evaluationsActual: [] });
          setIndicators({});
          setShowComponents(true);
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        // ใช้ข้อมูลเริ่มต้นเมื่อเกิดข้อผิดพลาด
        setComponents([]);
        setSessionData({ evaluations: [], evaluationsActual: [] });
        setIndicators({});
        setShowComponents(true);
      }
      setLoading(false);
    };
    fetchFullSessionData();
  }, [selectedProgram, activeYear]);

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setSelectedComponent(null);
    setComponents([]);
    setIndicators({});
    setShowComponents(true);
    try { localStorage.setItem('selectedProgramContext', JSON.stringify(program)); } catch { }
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  // หากยังไม่ได้เลือกสาขา ให้แสดงหน้าเลือกสาขา
  if (!selectedProgram) {
    return (
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
    );
  }

  // หากเลือกสาขาแล้ว ให้แสดงหน้าจัดการแบบเดียวกับ component management
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {assessmentMode === 'criteria' ? 'กำหนดค่าเป้าหมาย' : 'ผลการดำเนินการ'}
        </h1>
        <p className="text-gray-600 mt-1">
          {assessmentMode === 'criteria'
            ? 'กำหนดค่าเป้าหมายและคะแนนประเมินตนเองสำหรับแต่ละตัวบ่งชี้'
            : 'บันทึกผลการดำเนินงานและหลักฐานอ้างอิงสำหรับแต่ละตัวบ่งชี้'}
        </p>
      </div>

      {/* Program info and change button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          <span className="text-gray-500">กำลังจัดการของ:</span>{' '}
          <span className="font-medium">{selectedProgram?.majorName || '-'}</span>
          {selectedProgram?.facultyName ? <span className="ml-1 text-gray-500">({selectedProgram.facultyName})</span> : null}
        </div>
        <button
          onClick={() => {
            try {
              localStorage.removeItem('selectedProgramContext');
              localStorage.removeItem('assessment_session_id');
            } catch { }
            setSelectedProgram(null);
            setShowComponents(false);
            setSelectedComponent(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          เปลี่ยนสาขา
        </button>
      </div>

      {/* Steps section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-8 border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          {assessmentMode === 'criteria' ? (
            <Target className="w-8 h-8 text-blue-600" />
          ) : (
            <ClipboardList className="w-8 h-8 text-blue-600" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {assessmentMode === 'criteria' ? 'ขั้นตอนการกำหนดค่าเป้าหมาย' : 'ขั้นตอนการบันทึกผลการดำเนินงาน'}
            </h2>
            <p className="text-gray-600 text-sm">
              {assessmentMode === 'criteria'
                ? 'ทำตามขั้นตอนเพื่อกำหนดเป้าหมายให้ครบทุกตัวบ่งชี้'
                : 'ทำตามขั้นตอนเพื่อบันทึกผลการดำเนินงานให้ครบทุกตัวบ่งชี้'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">เลือกองค์ประกอบ</h3>
              <p className="text-sm text-gray-600">เลือกองค์ประกอบคุณภาพที่ต้องการจัดการ</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {assessmentMode === 'criteria' ? 'กำหนดเป้าหมาย' : 'บันทึกผลการดำเนินงาน'}
              </h3>
              <p className="text-sm text-gray-600">
                {assessmentMode === 'criteria'
                  ? 'กำหนดค่าเป้าหมายและคะแนนประเมินตนเองสำหรับแต่ละตัวบ่งชี้'
                  : 'บันทึกผลการดำเนินงานและอัปโหลดหลักฐานอ้างอิง'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">ตรวจสอบและบันทึก</h3>
              <p className="text-sm text-gray-600">ตรวจสอบความถูกต้องและบันทึกข้อมูล</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* การเลือกองค์ประกอบ - แสดงเป็นตารางแบบเดียวกับหน้าจัดการ */}
          {components.length > 0 && !selectedComponent && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">เลือกองค์ประกอบคุณภาพเพื่อจัดการ</h3>
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
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold">
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
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
                            onClick={() => handleComponentSelect(component)}
                          >
                            <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {components.length === 0 && !loading && (
            <div className="bg-white p-12 rounded-lg border-2 border-dashed border-gray-200 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">ยังไม่มีข้อมูลองค์ประกอบคุณภาพ</h3>
              <p className="text-gray-500 mt-2">กรุณาเพิ่มองค์ประกอบในหน้า "จัดการองค์ประกอบ" ก่อนทำรายการ</p>
            </div>
          )}

          {/* แสดงตารางตัวบ่งชี้สำหรับบันทึกผลการดำเนินการ */}
          {selectedComponent && indicators[selectedComponent.component_id] && (
            <AssessmentTable
              selectedComponent={selectedComponent}
              indicators={indicators}
              selectedProgram={selectedProgram}
              mode={assessmentMode}
              onBack={() => setSelectedComponent(null)}
              sessionData={sessionData}
              activeYear={activeYear}
            />
          )}

          {/* Fallback if indicators not found for component */}
          {selectedComponent && !indicators[selectedComponent.component_id] && (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-500 mb-4">ไม่พบข้อมูลตัวบ่งชี้สำหรับองค์ประกอบนี้</p>
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                ย้อนกลับ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
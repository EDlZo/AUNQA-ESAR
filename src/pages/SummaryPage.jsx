import React, { useEffect, useState } from 'react';
import { FileText, GraduationCap, BarChart3 } from 'lucide-react';
import ProgramSelection from '../components/ProgramSelection';

export default function SummaryPage({ currentUser }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [rows, setRows] = useState([]); // evaluations_actual
  const [loading, setLoading] = useState(false);
  const [indicatorMap, setIndicatorMap] = useState({}); // id -> detail
  const [components, setComponents] = useState([]);
  const [componentIndicatorsCount, setComponentIndicatorsCount] = useState({}); // componentId -> count
  const [viewComponent, setViewComponent] = useState(null);
  const [viewIndicators, setViewIndicators] = useState([]);
  const [detailIndicator, setDetailIndicator] = useState(null);
  const [detailEvaluation, setDetailEvaluation] = useState(null);
  const [criteriaMap, setCriteriaMap] = useState({}); // indicator_id -> { target_value, score }
  const [committeeMap, setCommitteeMap] = useState({}); // indicator_id -> { committee_score, strengths, improvements }

  useEffect(() => {
    // สำหรับหน้าสรุปผลการดำเนินการ ให้เริ่มต้นใหม่เสมอ
    // ล้างข้อมูลเก่าและไม่โหลดจาก localStorage
    setSelectedProgram(null);
    setViewComponent(null);
    setViewIndicators([]);
  }, []);

  useEffect(() => {
    const sessionId = localStorage.getItem('assessment_session_id') || '';
    const major = selectedProgram?.majorName || '';
    if (!sessionId || !major) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/evaluations-actual/history?${new URLSearchParams({ session_id: sessionId, major_name: major }).toString()}`)
      .then(res => res.ok ? res.json() : [])
      .then(json => setRows(Array.isArray(json) ? json : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
    // ดึงรายการองค์ประกอบคุณภาพของสาขา
    fetch(`http://localhost:3001/api/quality-components?${new URLSearchParams({ session_id: sessionId, major_name: major }).toString()}`)
      .then(res => res.ok ? res.json() : [])
      .then(list => setComponents(Array.isArray(list) ? list : []))
      .catch(() => setComponents([]));
    // ดึงข้อมูลเกณฑ์ (target, score) สำหรับคอลัมน์ค่าเป้าหมาย/ประเมินตนเอง
    fetch(`http://localhost:3001/api/evaluations/history?${new URLSearchParams({ session_id: sessionId, major_name: major }).toString()}`)
      .then(res => res.ok ? res.json() : [])
      .then(list => {
        const map = {};
        (Array.isArray(list) ? list : []).forEach(r => {
          map[String(r.indicator_id)] = { target_value: r.target_value || '', score: r.score || '' };
        });
        setCriteriaMap(map);
      })
      .catch(() => setCriteriaMap({}));

    // ดึงข้อมูลคะแนนกรรมการ
    fetch(`http://localhost:3001/api/committee-evaluations?${new URLSearchParams({ session_id: sessionId, major_name: major }).toString()}`)
      .then(res => res.ok ? res.json() : [])
      .then(list => {
        const map = {};
        (Array.isArray(list) ? list : []).forEach(r => {
          map[String(r.indicator_id)] = {
            committee_score: r.committee_score || '',
            strengths: r.strengths || '',
            improvements: r.improvements || ''
          };
        });
        setCommitteeMap(map);
      })
      .catch(() => setCommitteeMap({}));
  }, [selectedProgram]);

  useEffect(() => {
    const sessionId = localStorage.getItem('assessment_session_id') || '';
    const major = selectedProgram?.majorName || '';
    if (!sessionId || !major) return;
    // fetch detail for each indicator id present
    const ids = Array.from(new Set(rows.map(r => r.indicator_id).filter(Boolean)));
    if (ids.length === 0) return;
    (async () => {
      const map = {};
      for (const id of ids) {
        try {
          const res = await fetch(`http://localhost:3001/api/indicator-detail?${new URLSearchParams({ indicator_id: id, session_id: sessionId, major_name: major }).toString()}`);
          if (res.ok) {
            const d = await res.json();
            map[id] = d;
          }
        } catch { }
      }
      setIndicatorMap(map);
    })();
  }, [rows, selectedProgram]);

  // นับจำนวนตัวบ่งชี้ต่อองค์ประกอบเพื่อแสดงในคอลัมน์ "จำนวน"
  useEffect(() => {
    const sessionId = localStorage.getItem('assessment_session_id') || '';
    const major = selectedProgram?.majorName || '';
    if (!sessionId || !major || components.length === 0) return;
    (async () => {
      const countMap = {};
      for (const comp of components) {
        try {
          const res = await fetch(`http://localhost:3001/api/indicators-by-component/${encodeURIComponent(comp.id)}?${new URLSearchParams({ session_id: sessionId, major_name: major }).toString()}`);
          const inds = res.ok ? await res.json() : [];
          // นับเฉพาะหัวข้อหลักของตัวบ่งชี้ (sequence ไม่มีจุด)
          const mainCount = (Array.isArray(inds) ? inds : []).filter(ind => !String(ind?.sequence ?? '').includes('.')).length;
          countMap[comp.id] = mainCount;
        } catch { countMap[comp.id] = 0; }
      }
      setComponentIndicatorsCount(countMap);
    })();
  }, [components, selectedProgram]);

  const handleViewIndicators = async (component) => {
    setViewComponent(component);
    setViewIndicators([]);
    const sessionId = localStorage.getItem('assessment_session_id') || '';
    const major = selectedProgram?.majorName || '';
    try {
      const res = await fetch(`http://localhost:3001/api/indicators-by-component/${encodeURIComponent(component.id)}?${new URLSearchParams({ session_id: sessionId, major_name: major }).toString()}`);
      const inds = res.ok ? await res.json() : [];
      setViewIndicators(Array.isArray(inds) ? inds : []);
    } catch { setViewIndicators([]); }
  };

  const openIndicatorDetail = (indicator) => {
    setDetailIndicator(indicator);
    // หา evaluation ล่าสุดของตัวบ่งชี้นี้จาก rows
    const list = rows.filter(r => String(r.indicator_id) === String(indicator.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setDetailEvaluation(list[0] || null);
  };

  // หน้ารายละเอียด (แบบหน้าใหม่ ไม่ใช้ป๊อปอัป)
  if (detailIndicator) {
    const crit = criteriaMap[String(detailIndicator.id)] || {};
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">รายละเอียด</div>
              <div className="font-semibold">{detailIndicator.sequence} : {detailIndicator.indicator_name}</div>
            </div>
            <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded" onClick={() => { setDetailIndicator(null); setDetailEvaluation(null); }}>กลับ</button>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
              {detailIndicator.sequence} {detailIndicator.indicator_name}
            </div>
            <div>
              <div className="font-semibold mb-2">ผลการดำเนินงาน</div>
              <div className="prose max-w-none border rounded p-3" dangerouslySetInnerHTML={{ __html: detailEvaluation?.operation_result || '<em>ไม่มีข้อมูล</em>' }} />
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
                      <td className="px-3 py-2 text-center">{detailEvaluation?.operation_score ?? '-'}</td>
                      <td className="px-3 py-2 text-center">{detailEvaluation?.reference_score ?? '-'}</td>
                      <td className="px-3 py-2 text-center">{detailEvaluation?.goal_achievement ?? '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {(() => {
              const committee = committeeMap[String(detailIndicator.id)] || {};
              return (
                <div className="border-2 border-blue-300 rounded p-3 space-y-4">
                  <div>
                    <div className="font-medium">คะแนนประเมิน (กรรมการ)</div>
                    <div className="text-sm">{committee.committee_score ?? '-'}</div>
                  </div>
                  <div>
                    <div className="font-medium">Strengths (จุดแข็ง)</div>
                    <div className="prose max-w-none border rounded p-3">
                      {committee.strengths ? (
                        <div dangerouslySetInnerHTML={{ __html: committee.strengths }} />
                      ) : (
                        <em>—</em>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Areas for Improvement (เรื่องที่พัฒนา/ปรับปรุงได้)</div>
                    <div className="prose max-w-none border rounded p-3">
                      {committee.improvements ? (
                        <div dangerouslySetInnerHTML={{ __html: committee.improvements }} />
                      ) : (
                        <em>—</em>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ส่วนแสดงหลักฐานอ้างอิง */}
            <div className="border-2 border-purple-300 rounded p-3">
              <div className="font-medium mb-3">รายการหลักฐานอ้างอิง</div>
              {(() => {
                // ดึงข้อมูลหลักฐานจาก detailEvaluation
                const evidenceFiles = [];
                let evidenceMeta = {};

                if (detailEvaluation?.evidence_files_json) {
                  try {
                    const files = JSON.parse(detailEvaluation.evidence_files_json);
                    if (Array.isArray(files)) {
                      evidenceFiles.push(...files);
                    }
                  } catch { }
                }
                if (detailEvaluation?.evidence_file && !evidenceFiles.includes(detailEvaluation.evidence_file)) {
                  evidenceFiles.push(detailEvaluation.evidence_file);
                }

                // ดึง metadata ของหลักฐาน
                if (detailEvaluation?.evidence_meta_json) {
                  try {
                    evidenceMeta = JSON.parse(detailEvaluation.evidence_meta_json) || {};
                  } catch { }
                }

                if (evidenceFiles.length === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
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
                          // ดึงข้อมูล metadata สำหรับไฟล์นี้
                          const fileMeta = evidenceMeta[filename] || {};
                          const evidenceNumber = fileMeta.number || `${index + 1}`;
                          const evidenceName = fileMeta.name || detailEvaluation?.evidence_name || filename;

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium text-center bg-gray-50 w-20">
                                {evidenceNumber}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {evidenceName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                {filename.startsWith('url_') ? (
                                  // URL หลักฐาน - เปิดลิงก์โดยตรง
                                  <a
                                    href={fileMeta.url || detailEvaluation?.evidence_url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-green-600 hover:text-green-800 underline cursor-pointer"
                                  >
                                    URL: เปิดลิงก์
                                  </a>
                                ) : (
                                  // ไฟล์เอกสาร - เปิดผ่าน /api/view/
                                  <a
                                    href={`http://localhost:3001/api/view/${encodeURIComponent(filename)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                  >
                                    ไฟล์: เปิดไฟล์
                                  </a>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div className="text-xs text-gray-500">บันทึกล่าสุด: {detailEvaluation ? new Date(detailEvaluation.created_at).toLocaleString('th-TH') : '-'}</div>
          </div>
        </div>
      </div>
    );
  }

  // หากยังไม่ได้เลือกสาขา ให้แสดงหน้าเลือกสาขา
  if (!selectedProgram) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-8">
          <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">สรุปผลการดำเนินการคุณภาพการศึกษา</h1>
          <p className="text-gray-600 mt-2">กรุณาเลือกสาขาที่ต้องการดูสรุปผล</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <ProgramSelection
            mode="assess"
            storageKey="summaryProgramSelection"
            buttonText="เลือกสาขา"
            onComplete={(s) => {
              setSelectedProgram(s);
              try { localStorage.setItem('selectedProgramContext', JSON.stringify(s)); } catch { }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">สรุปผลการดำเนินการคุณภาพการศึกษา</h1>
          <p className="text-sm text-gray-600">สาขา: {selectedProgram?.majorName || '-'}</p>
        </div>
        <button
          onClick={() => setSelectedProgram(null)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          เปลี่ยนสาขา
        </button>
      </div>

      {/* ตารางองค์ประกอบหลัก (Read-only) */}
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

      {/* รายการตัวบ่งชี้ขององค์ประกอบที่เลือก (Read-only) */}
      {viewComponent && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">ตัวบ่งชี้ขององค์ประกอบ</div>
              <div className="font-semibold">{viewComponent.quality_name}</div>
            </div>
            <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded" onClick={() => { setViewComponent(null); setViewIndicators([]); }}>ปิด</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ชื่อตัวบ่งชี้</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">คะแนนค่าเป้าหมาย</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ผลประเมินตนเอง</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">การบรรลุเป้าหมาย</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ผลประเมินกรรมการ</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ดูข้อมูล</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewIndicators.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-6 text-gray-400">ยังไม่มีตัวบ่งชี้</td></tr>
                ) : (
                  viewIndicators.map((ind) => {
                    const latest = rows.find(r => String(r.indicator_id) === String(ind.id));
                    const crit = criteriaMap[String(ind.id)] || {};
                    const committee = committeeMap[String(ind.id)] || {};
                    return (
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
                          <button className={(String(ind.sequence).includes('.') ? 'font-normal' : 'font-bold') + ' text-black-700 hover:text-black-900 text-left'} onClick={() => openIndicatorDetail(ind)}>
                            {ind.indicator_name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">{crit.score || '-'}</td>
                        <td className="px-4 py-3 text-center">{latest?.operation_score ?? '-'}</td>
                        <td className="px-4 py-3 text-center">{latest?.goal_achievement ?? '-'}</td>
                        <td className="px-4 py-3 text-center">{committee.committee_score || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <button className="inline-flex items-center px-3 py-1.5 text-xs rounded bg-blue-600 text-white" onClick={() => openIndicatorDetail(ind)}>ดูข้อมูล</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ลบ modal; ใช้หน้าเต็มด้านบนแทน */}


    </div>
  );
}

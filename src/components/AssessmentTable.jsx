// src/components/AssessmentTable.jsx
import React, { useState, useEffect } from 'react';
import AssessmentFormModal from './AssessmentFormModal';
import EvaluationFormModal from './EvaluationFormModal';
import { BASE_URL } from '../config/api.js';
import { ArrowLeft } from 'lucide-react';


export default function AssessmentTable({ selectedComponent, indicators, selectedProgram, currentUser, mode = 'criteria', onBack, sessionData, activeYear }) {
  const [evaluatedIndicators, setEvaluatedIndicators] = useState(new Set());
  const [assessingIndicator, setAssessingIndicator] = useState(null);
  const [flash, setFlash] = useState({ message: '', type: 'success' });
  const [criteriaCompletedIds, setCriteriaCompletedIds] = useState(new Set());

  const indicatorList = (indicators && selectedComponent) ? (indicators[selectedComponent.component_id] || indicators[selectedComponent.id] || []) : [];

  // Derived state from sessionData prop
  useEffect(() => {
    if (sessionData) {
      const { evaluations, evaluationsActual } = sessionData;

      // Update evaluated indicators based on mode
      const relevantList = mode === 'evaluation' ? evaluationsActual : evaluations;
      const evaluatedIds = new Set(relevantList.map(ev => String(ev.indicator_id)));
      setEvaluatedIndicators(evaluatedIds);

      // Update criteria completion status for evaluation mode
      if (mode === 'evaluation') {
        const criteriaIds = new Set(evaluations.map(ev => String(ev.indicator_id)));
        setCriteriaCompletedIds(criteriaIds);
      }
    }
  }, [sessionData, mode, selectedComponent]);

  useEffect(() => {
    if (flash.message) {
      const timer = setTimeout(() => setFlash({ message: '', type: 'success' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash.message]);

  // Local state to store evaluations, allowing updates without parent refresh
  const [localSessionData, setLocalSessionData] = useState(sessionData || { evaluations: [], evaluationsActual: [] });

  useEffect(() => {
    if (sessionData) {
      setLocalSessionData(sessionData);
    }
  }, [sessionData]);

  // ดึงข้อมูลสถานะการประเมิน (กรณีต้องการรีเฟรชหลังบันทึก)
  const fetchEvaluationStatus = async () => {
    if (!selectedComponent) return;
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram?.majorName || selectedProgram?.major_name || '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();

      // Fetch BOTH to update full state
      const [evalRes, actualRes] = await Promise.all([
        fetch(`${BASE_URL}/api/evaluations/history?${qs}`),
        fetch(`${BASE_URL}/api/evaluations-actual/history?${qs}`)
      ]);

      if (evalRes.ok && actualRes.ok) {
        const evaluations = await evalRes.json();
        const evaluationsActual = await actualRes.json();

        // Update local state
        setLocalSessionData({
          evaluations: Array.isArray(evaluations) ? evaluations : [],
          evaluationsActual: Array.isArray(evaluationsActual) ? evaluationsActual : []
        });

        // Update helper sets
        const list = (mode === 'evaluation' ? evaluationsActual : evaluations).filter(ev => String(ev.session_id) === String(sessionId));
        const evaluatedIds = new Set(list.map(ev => String(ev.indicator_id)));
        setEvaluatedIndicators(evaluatedIds);

        if (mode === 'evaluation') {
          const criteriaIds = new Set(evaluations.filter(ev => String(ev.session_id) === String(sessionId)).map(ev => String(ev.indicator_id)));
          setCriteriaCompletedIds(criteriaIds);
        }
      }
    } catch (error) {
      console.error('Error refreshing evaluation status:', error);
    }
  };

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

  const handleAssessClick = (indicator) => {
    setAssessingIndicator(indicator);
  };

  const handleAssessmentComplete = () => {
    setAssessingIndicator(null);
    setFlash({ message: 'บันทึกการประเมินเรียบร้อย', type: 'success' });
    fetchEvaluationStatus(); // รีเฟรชสถานะการประเมิน
  };

  const handleAssessmentCancel = () => {
    setAssessingIndicator(null);
  };

  const updateStatus = async (evaluationId, action, extraBody = {}) => {
    try {
      const url = `${BASE_URL}/api/evaluations-actual/${evaluationId}/${action}`;
      console.log('Sending update to:', url);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...extraBody,
          [action === 'approve' ? 'approved_by' : 'rejected_by']: currentUser?.name || currentUser?.username
        })
      });
      if (res.ok) {
        setFlash({ message: action === 'approve' ? 'อนุมัติการประเมินเรียบร้อย' : (action === 'submit' ? 'ส่งตรวจประเมินเรียบร้อย' : 'ส่งกลับแก้ไขเรียบร้อย'), type: 'success' });
        fetchEvaluationStatus();
      } else {
        const err = await res.json();
        setFlash({ message: `เกิดข้อผิดพลาด: ${err.error}`, type: 'error' });
      }
    } catch (err) {
      setFlash({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">อนุมัติแล้ว</span>;
      case 'pending_review': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold">รอการตรวจสอบ</span>;
      case 'revision_requested': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">ให้ปรับปรุง</span>;
      case 'submitted':
      case 'draft':
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">ฉบับร่าง</span>;
    }
  };

  // หากกำลังประเมิน ให้แสดงฟอร์มประเมิน
  if (assessingIndicator) {
    // เลือกฟอร์มตาม mode
    const FormComponent = mode === 'evaluation' ? EvaluationFormModal : AssessmentFormModal;

    // Determine ReadOnly Status
    let readOnly = false;
    if (mode === 'evaluation') {
      const evalData = localSessionData?.evaluationsActual?.find(r => String(r.indicator_id) === String(assessingIndicator.id));
      const isPending = evalData?.status === 'pending_review';
      const isApproved = evalData?.status === 'approved';

      // Managers reviewing pending items -> Read Only
      if (isPending && ['sar_manager', 'qa_admin', 'system_admin'].includes(currentUser?.role)) {
        readOnly = true;
      }
      // Approved items -> Read Only for everyone (uiness system admin override, but usually readonly)
      if (isApproved && currentUser?.role !== 'system_admin') {
        readOnly = true;
      }
    }

    return (
      <FormComponent
        indicator={assessingIndicator}
        selectedProgram={selectedProgram}
        onComplete={handleAssessmentComplete}
        onCancel={handleAssessmentCancel}
        allEvaluations={localSessionData?.evaluations || []}
        allEvaluationsActual={localSessionData?.evaluationsActual || []}
        activeYear={activeYear}
        readOnly={readOnly}
      />
    );
  }

  const baseIndicatorList = indicatorList;
  const filteredIndicatorList = mode === 'evaluation'
    ? baseIndicatorList.filter(ind => criteriaCompletedIds.has(String(ind.id)))
    : baseIndicatorList;

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'evaluation' ? 'ผลการดำเนินการ' : 'ตัวบ่งชี้'} - {selectedComponent.quality_name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'evaluation'
              ? 'เลือกตัวบ่งชี้เพื่อบันทึกผลการดำเนินงาน'
              : 'เลือกตัวบ่งชี้เพื่อทำการประเมิน'
            }
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            กลับ
          </button>
        )}
      </div>

      {/* Flash Message */}
      {flash.message && (
        <div className={`mx-6 mt-4 rounded-md px-4 py-2 border ${flash.type === 'success'
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                ลำดับ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                ตัวบ่งชี้
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                ชนิดตัวบ่งชี้
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                ชนิดเกณฑ์มาตรฐาน
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                สถานะ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIndicatorList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  ไม่มีข้อมูลตัวบ่งชี้
                </td>
              </tr>
            ) : (
              filteredIndicatorList.map((indicator) => (
                <tr key={indicator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    {String(indicator.sequence).includes('.') ? (
                      <span>{formatSequence(indicator.sequence)}</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold">
                        {formatSequence(indicator.sequence)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200 text-left">
                    <div className={(String(indicator.sequence).includes('.') ? 'font-normal' : 'font-bold') + ' text-gray-900 text-left'}>
                      {indicator.indicator_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 border-r border-gray-200">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {indicator.indicator_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 border-r border-gray-200">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {indicator.criteria_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm border-r border-gray-200">
                    {(() => {
                      const evalData = (mode === 'evaluation' ? localSessionData?.evaluationsActual : localSessionData?.evaluations)
                        ?.find(r => String(r.indicator_id) === String(indicator.id));
                      return (
                        <div className="flex flex-col items-center gap-1">
                          {evalData ? (
                            <>
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs font-bold mb-1">✓</span>
                              {getStatusBadge(evalData.status)}
                              {evalData.status === 'revision_requested' && evalData.feedback && (
                                <div className="text-[10px] text-red-600 italic mt-1 max-w-[120px] text-center">
                                  "{evalData.feedback}"
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">✗</span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {(() => {
                        const evalData = (mode === 'evaluation' ? localSessionData?.evaluationsActual : localSessionData?.evaluations)
                          ?.find(r => String(r.indicator_id) === String(indicator.id));

                        const isApproved = evalData?.status === 'approved';
                        const isPending = evalData?.status === 'pending_review';
                        const canEdit = !isPending && !isApproved;
                        const canReview = isPending && ['sar_manager', 'qa_admin', 'system_admin'].includes(currentUser?.role);

                        return (
                          <>
                            <button
                              onClick={() => handleAssessClick(indicator)}
                              disabled={!canEdit && !canReview && currentUser?.role !== 'system_admin'}
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white transition-colors whitespace-nowrap shadow-sm ${!canEdit && !canReview && currentUser?.role !== 'system_admin'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : (mode === 'evaluation'
                                  ? (canReview ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700')
                                  : 'bg-green-600 hover:bg-green-700')
                                }`}
                            >
                              {mode === 'evaluation'
                                ? (canReview ? 'ตรวจสอบ' : (evalData ? 'แก้ไขผล' : 'บันทึกผล'))
                                : (evalData ? 'แก้ไขเป้าหมาย' : 'กำหนดเป้าหมาย')
                              }
                            </button>

                            {evalData && mode === 'evaluation' && (
                              <>
                                {/* Reporter: Submit Button */}
                                {evalData.status !== 'pending_review' && evalData.status !== 'approved' && (currentUser?.role === 'reporter' || currentUser?.role === 'system_admin') && (
                                  <button
                                    onClick={() => {
                                      const evalId = evalData.id || evalData._id;
                                      if (evalId) updateStatus(evalId, 'submit');
                                      else alert('ไม่พบรหัสการประเมิน กรุณารีเฟรชหน้าเว็บ');
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 shadow-sm"
                                  >
                                    ส่งตรวจ
                                  </button>
                                )}

                                {/* Manager: Approve/Reject Buttons */}
                                {evalData.status === 'pending_review' && (['sar_manager', 'qa_admin', 'system_admin'].includes(currentUser?.role)) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        const evalId = evalData.id || evalData._id;
                                        if (evalId) updateStatus(evalId, 'approve');
                                      }}
                                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 shadow-sm"
                                    >
                                      อนุมัติ
                                    </button>
                                    <button
                                      onClick={() => {
                                        const evalId = evalData.id || evalData._id;
                                        if (evalId) {
                                          const fb = prompt('ระบุสิ่งที่ควรปรับปรุง:');
                                          if (fb !== null) updateStatus(evalId, 'reject', { feedback: fb });
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-md hover:bg-rose-700 shadow-sm"
                                    >
                                      ส่งกลับแก้
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// src/components/AssessmentTable.jsx
import React, { useState, useEffect } from 'react';
import AssessmentFormModal from './AssessmentFormModal';
import EvaluationFormModal from './EvaluationFormModal';
import { BASE_URL } from '../config/api.js';


export default function AssessmentTable({ selectedComponent, indicators, selectedProgram, mode = 'criteria', onBack, sessionData }) {
  const [evaluatedIndicators, setEvaluatedIndicators] = useState(new Set());
  const [assessingIndicator, setAssessingIndicator] = useState(null);
  const [flash, setFlash] = useState({ message: '', type: 'success' });
  const [criteriaCompletedIds, setCriteriaCompletedIds] = useState(new Set());

  const indicatorList = indicators[selectedComponent.id] || [];

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

  // ดึงข้อมูลสถานะการประเมิน (กรณีต้องการรีเฟรชหลังบันทึก)
  const fetchEvaluationStatus = async () => {
    if (!selectedComponent) return;
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const major = selectedProgram?.majorName || selectedProgram?.major_name || '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();

      const endpoint = mode === 'evaluation'
        ? `${BASE_URL}/api/evaluations-actual/history`
        : `${BASE_URL}/api/evaluations/history`;

      let res = await fetch(`${endpoint}?${qs}`);
      if (res.ok) {
        let evaluations = await res.json();
        let list = (Array.isArray(evaluations) ? evaluations : []).filter(ev => String(ev.session_id) === String(sessionId));

        const evaluatedIds = new Set(list.map(ev => String(ev.indicator_id)));
        setEvaluatedIndicators(evaluatedIds);

        // ถ้าเป็นโหมดประเมินผล ให้ดึงเกณฑ์มาด้วยเพื่อเช็คความพร้อม
        if (mode === 'evaluation') {
          const criteriaRes = await fetch(`${BASE_URL}/api/evaluations/history?${qs}`);
          if (criteriaRes.ok) {
            const criteriaRows = await criteriaRes.json();
            const criteriaIds = new Set(criteriaRows.filter(ev => String(ev.session_id) === String(sessionId)).map(ev => String(ev.indicator_id)));
            setCriteriaCompletedIds(criteriaIds);
          }
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

  // หากกำลังประเมิน ให้แสดงฟอร์มประเมิน
  if (assessingIndicator) {
    // เลือกฟอร์มตาม mode
    const FormComponent = mode === 'evaluation' ? EvaluationFormModal : AssessmentFormModal;

    return (
      <FormComponent
        indicator={assessingIndicator}
        selectedProgram={selectedProgram}
        onComplete={handleAssessmentComplete}
        onCancel={handleAssessmentCancel}
        allEvaluations={sessionData?.evaluations || []}
        allEvaluationsActual={sessionData?.evaluationsActual || []}
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
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
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
                สถานะการประเมิน
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ประเมินผล
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
                    {evaluatedIndicators.has(String(indicator.id)) ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-sm font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold">
                        ✗
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleAssessClick(indicator)}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors whitespace-nowrap ${mode === 'evaluation'
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                      {mode === 'evaluation'
                        ? (evaluatedIndicators.has(String(indicator.id)) ? 'แก้ไขผลการดำเนินการ' : 'ผลการดำเนินการ')
                        : (evaluatedIndicators.has(String(indicator.id)) ? 'แก้ไขการประเมิน' : 'เกณฑ์การประเมิน')
                      }
                    </button>
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
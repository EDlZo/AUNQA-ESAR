// src/components/IndicatorForm.jsx
import React, { useMemo } from 'react';

export default function IndicatorForm(props) {
  const handleCancel = () => props.onCancel && props.onCancel();

  // ตรวจสอบว่าเป็น "องค์ประกอบที่ 2" หรือไม่ เพื่อปรับรูปแบบการเพิ่มตัวบ่งชี้
  const isComponentTwo = useMemo(() => {
    const compId = props.selectedComponent?.component_id || props.selectedComponent?.componentId || '';
    const name = props.selectedComponent?.quality_name || props.selectedComponent?.qualityName || '';
    return String(compId).trim() === '2' || name.includes('องค์ประกอบที่ 2') || name.includes('องค์ประกอบ 2');
  }, [props.selectedComponent]);

  // รายการตัวบ่งชี้ตามเกณฑ์ AUN-QA (สำหรับองค์ประกอบที่ 2)
  const AUN_QA_INDICATORS = [
    'AUN.1 Expected Learning Outcomes',
    'AUN.2 Programme Structure and Content',
    'AUN.3 Teaching and Learning Approach',
    'AUN.4 Student Assessment',
    'AUN.5 Academic Staff',
    'AUN.6 Student Support Services',
    'AUN.7 Facilities and Infrastructure',
    'AUN.8 Output and Outcomes'
  ];

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-4">
          {/* ...ฟอร์มเดิม ใช้ props แทน ... */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {props.indicatorName ? 'แก้ไขตัวบ่งชี้' : 'เพิ่มตัวบ่งชี้'}
            </h2>
            <p className="text-gray-600">
              องค์ประกอบ: {props.selectedComponent?.quality_name || props.selectedComponent?.qualityName}
            </p>
          </div>

          {/* Flash message ตำแหน่งด้านบนของฟอร์มใกล้หัวข้อ "ตัวบ่งชี้" */}
          {props.flash && props.flash.message ? (
            <div className={`mb-4 rounded-md px-4 py-2 border ${props.flash.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {props.flash.message}
              <button
                type="button"
                className={`${props.flash.type === 'success' ? 'text-green-700' : 'text-red-700'} float-right`}
                onClick={() => props.onDismissFlash && props.onDismissFlash()}
              >
                ×
              </button>
            </div>
          ) : null}

          {props.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{props.error}</p>
            </div>
          )}

          <form onSubmit={props.onSubmit} className="space-y-6">
            {!isComponentTwo && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ลำดับ
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={props.indicatorSequence}
                    onChange={e => props.setIndicatorSequence(e.target.value)}
                    placeholder="เช่น 1.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชนิดตัวบ่งชี้
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={props.indicatorType}
                    onChange={e => props.setIndicatorType(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกชนิดตัวบ่งชี้ --</option>
                    <option value="ปัจจัยนำเข้า">ปัจจัยนำเข้า</option>
                    <option value="กระบวนการ">กระบวนการ</option>
                    <option value="ผลผลิต">ผลผลิต</option>
                    <option value="ผลลัพธ์">ผลลัพธ์</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชนิดเกณฑ์มาตรฐาน
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={props.criteriaType}
                    onChange={e => props.setCriteriaType(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกเกณฑ์มาตรฐาน --</option>
                    <option value="เชิงคุณภาพ">เชิงคุณภาพ</option>
                    <option value="เชิงปริมาณ">เชิงปริมาณ</option>
                    <option value="เชิงเวลา">เชิงเวลา</option>
                    <option value="เชิงต้นทุน">เชิงต้นทุน</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ตัวบ่งชี้
              </label>
              {isComponentTwo ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={props.indicatorName}
                  onChange={e => props.setIndicatorName(e.target.value)}
                  required
                >
                  <option value="">-- เลือกตัวบ่งชี้ตามเกณฑ์ AUN-QA --</option>
                  {AUN_QA_INDICATORS.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  value={props.indicatorName}
                  onChange={e => props.setIndicatorName(e.target.value)}
                  placeholder="เช่น ผลการบริหารจัดการหลักสูตรโดยรวม"
                  required
                />
              )}
            </div>

            {!isComponentTwo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  แหล่งข้อมูลหรือตัวชี้วัดที่เกี่ยวข้อง
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  value={props.dataSource}
                  onChange={e => props.setDataSource(e.target.value)}
                  placeholder="ระบุแหล่งข้อมูลหรือวิธีคำนวณ"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                บันทึก
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}

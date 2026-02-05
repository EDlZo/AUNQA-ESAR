import React, { useMemo } from 'react';

export default function IndicatorForm(props) {
  const handleCancel = () => props.onCancel && props.onCancel();

  // ตรวจสอบว่าเป็น "องค์ประกอบที่ 2" หรือไม่
  const isComponentTwo = useMemo(() => {
    // const compId = props.selectedComponent?.component_id || props.selectedComponent?.componentId || '';
    const name = props.selectedComponent?.quality_name || props.selectedComponent?.qualityName || '';
    // ยกเลิกการเช็ค ID == 2 เพราะอาจชนกับองค์ประกอบที่สร้างเอง
    // เช็คจากชื่อว่าต้องมีคำว่า "AUN-QA" หรือ "องค์ประกอบที่ 2" เท่านั้น
    return name.includes('AUN-QA') || name.includes('องค์ประกอบที่ 2') || (name.includes('องค์ประกอบ 2') && name.includes('AUN'));
  }, [props.selectedComponent]);

  console.log('🔵 IndicatorForm VERSION 3.0 - DROPDOWN SELECTION');
  console.log('isComponentTwo:', isComponentTwo);
  console.log('masterIndicators:', props.masterIndicators);

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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            เพิ่มตัวบ่งชี้
          </h2>
          <p className="text-gray-600">
            องค์ประกอบ: {props.selectedComponent?.quality_name || props.selectedComponent?.qualityName}
          </p>
        </div>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isComponentTwo ? 'เลือกหัวข้อหลัก AUN-QA' : 'เลือกตัวบ่งชี้'}
            </label>

            {isComponentTwo ? (
              /* Dropdown สำหรับ AUN-QA (Component 2) */
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
              /* Dropdown สำหรับองค์ประกอบอื่นๆ - เลือกจาก Master Templates */
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={props.selectedMasterId || props.indicatorName} // Bind to ID for template selection, name for manual/legacy
                onChange={e => {
                  const selectedId = e.target.value;
                  const selectedIndicator = props.masterIndicators?.find(ind => ind.id === selectedId);
                  if (selectedIndicator) {
                    // Set all fields from selected master indicator
                    props.setSelectedMasterId(selectedIndicator.id);
                    props.setIndicatorName(selectedIndicator.indicator_name);
                    props.setIndicatorSequence(selectedIndicator.sequence);
                    props.setIndicatorType(selectedIndicator.indicator_type);
                    props.setCriteriaType(selectedIndicator.criteria_type);
                    if (selectedIndicator.data_source) {
                      props.setDataSource(selectedIndicator.data_source);
                    }
                  } else {
                    // Clear if deselected
                    props.setSelectedMasterId('');
                    props.setIndicatorName('');
                    props.setIndicatorSequence('');
                    props.setIndicatorType('');
                    props.setCriteriaType('');
                    props.setDataSource('');
                  }
                }}
                required
              >
                <option value="">-- เลือกตัวบ่งชี้ --</option>
                {props.masterIndicators && props.masterIndicators.length > 0 ? (
                  props.masterIndicators
                    .filter(ind => !ind.parent_id) // Show only main indicators
                    .map(ind => (
                      <option key={ind.id} value={ind.id}>
                        ({ind.sequence}) {ind.indicator_name}
                      </option>
                    ))
                ) : (
                  <option value="" disabled>ไม่มีแม่แบบตัวบ่งชี้</option>
                )}
              </select>
            )}

            <p className="text-sm text-gray-500 mt-2">
              {isComponentTwo
                ? '* เมื่อเลือกหัวข้อหลัก ระบบจะเพิ่มหัวข้อหลักและหัวข้อย่อยทั้งหมดอัตโนมัติ'
                : '* เลือกตัวบ่งชี้'
              }
            </p>
          </div>

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

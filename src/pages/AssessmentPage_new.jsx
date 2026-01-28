// src/pages/AssessmentPage.jsx
import React, { useState, useEffect } from 'react';
import ProgramSelection from '../components/ProgramSelection';
import AssessmentTable from '../components/AssessmentTable';

export default function AssessmentPage() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showComponents, setShowComponents] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [indicators, setIndicators] = useState({});

  // Debug log
  console.log('AssessmentPage rendered:', { selectedProgram, showComponents });

  const handleProgramSelect = (program) => {
    console.log('🎯 handleProgramSelect called with:', program);
    
    if (!program || !program.majorName) {
      setSelectedProgram(null);
      setShowComponents(false);
      return;
    }
    
    // ใช้ข้อมูลจาก ProgramSelection ตรงๆ
    setSelectedProgram(program);
    setSelectedComponent(null);
    setIndicators({});
    setShowComponents(true); // แสดงส่วนองค์ประกอบทันที
    
    // บันทึกข้อมูลโปรแกรมที่เลือกใน localStorage
    localStorage.setItem('selectedProgramContext', JSON.stringify(program));
    console.log('💾 Program saved to localStorage:', program);
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ผลการดำเนินการ</h1>
        <p className="text-gray-600">บันทึกผลการดำเนินงานตามตัวบ่งชี้คุณภาพการศึกษา</p>
      </div>

      {/* การเลือกโปรแกรม - เหมือนหน้าจัดการองค์ประกอบ */}
      {!selectedProgram && (
        <div className="mb-8">
          <ProgramSelection 
            mode="assess"
            storageKey="assessmentProgramSelection"
            buttonText="ประเมินผล"
            onComplete={handleProgramSelect} 
          />
        </div>
      )}

      {/* แสดงส่วนองค์ประกอบ (read-only) */}
      {selectedProgram && showComponents && (
        <div className="space-y-6">
          {/* ข้อมูลสาขาที่เลือก */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  สาขา: {selectedProgram.majorName}
                </h2>
                <p className="text-gray-600">คณะ: {selectedProgram.facultyName}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedProgram(null);
                  setShowComponents(false);
                  setSelectedComponent(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                เปลี่ยนสาขา
              </button>
            </div>
          </div>

          {/* ตารางองค์ประกอบและตัวบ่งชี้ - โหมดประเมิน */}
          <AssessmentTable
            mode="assessment" // โหมดประเมิน (read-only + ปุ่มประเมินผล)
            selectedProgram={selectedProgram}
            onComponentSelect={handleComponentSelect}
            selectedComponent={selectedComponent}
            indicators={indicators}
            setIndicators={setIndicators}
          />
        </div>
      )}

      {/* คำแนะนำ */}
      {!selectedProgram && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">วิธีการใช้งาน</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>เลือกระดับ → ระดับหลักสูตร</li>
            <li>เลือกคณะ → คณะวิศวกรรมศาสตร์</li>
            <li>เลือกสาขาที่ต้องการประเมิน</li>
            <li>กดปุ่ม "ประเมินผล"</li>
            <li>ระบบจะแสดงรายการองค์ประกอบและตัวบ่งชี้ที่มีอยู่</li>
            <li>กดปุ่ม "ประเมินผล" เพื่อเริ่มการประเมิน</li>
          </ol>
        </div>
      )}
    </div>
  );
}
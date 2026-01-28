// src/components/InstructionsSection.jsx
import React from 'react';

export default function InstructionsSection() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-medium text-blue-900 mb-4">ขั้นตอนการใช้งาน:</h3>
      <div className="space-y-3">
        <div className="flex items-start">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">1</span>
          <p className="text-blue-800">กดปุ่ม "เพิ่มองค์ประกอบ"</p>
        </div>
        <div className="flex items-start">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">2</span>
          <p className="text-blue-800">เลือกองค์ประกอบ</p>
        </div>
        <div className="flex items-start">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">3</span>
          <p className="text-blue-800">กดปุ่ม "บันทึกข้อมูลใหม่"</p>
        </div>
      </div>
    </div>
  );
}

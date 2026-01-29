// src/components/Quality/AddQualityForm.jsx
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config/api.js';


export default function AddQualityForm({
  qualityName,
  componentId,
  setComponentId,
  setQualityName,
  onSubmit,
  onCancel,
  error
}) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ฟังก์ชันสำหรับดึงข้อมูลองค์ประกอบจาก API
  const fetchComponents = async (forceRefresh = false) => {
    setLoading(true);
    try {
      console.log('กำลังดึงข้อมูลองค์ประกอบ...');
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      const response = await fetch(`${BASE_URL}/api/quality-components?${qs}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('ข้อมูลที่ได้รับจาก API:', data);
      // เก็บข้อมูลในหน่วยความจำ
      if (forceRefresh) {
        sessionStorage.setItem('existingComponents', JSON.stringify(data));
      }
      setComponents(data);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลองค์ประกอบ:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ดึงข้อมูลองค์ประกอบจาก API เฉพาะเมื่อโหลดครั้งแรกเท่านั้น
  useEffect(() => {
    // ตรวจสอบว่ามีข้อมูลในหน่วยความจำหรือไม่
    const cachedComponents = sessionStorage.getItem('existingComponents');

    if (cachedComponents) {
      // ใช้ข้อมูลจากหน่วยความจำ
      setComponents(JSON.parse(cachedComponents));
      setLoading(false);
    } else {
      // ถ้าไม่มีข้อมูลในหน่วยความจำ ให้ดึงจาก API
      fetchComponents(true);
    }
  }, []);

  // ฟังก์ชันสำหรับรีเฟรชข้อมูล
  const handleRefresh = () => {
    setRefreshing(true);
    fetchComponents(true);
  };

  // เมื่อเลือกองค์ประกอบ ให้ตั้งค่าชื่อองค์ประกอบอัตโนมัติ
  const handleComponentChange = (e) => {
    const selectedId = e.target.value;
    setComponentId(selectedId);

    // หาองค์ประกอบที่เลือก
    const comp = components.find(comp => comp.id == selectedId);
    setSelectedComponent(comp);

    if (comp) {
      setQualityName(comp.quality_name || '');
    } else {
      setQualityName('');
    }
  };

  // ฟังก์ชันจัดเรียง component_id
  const sortComponents = (a, b) => {
    try {
      // ตรวจสอบว่าเป็น string และไม่ใช่ค่าว่าง
      const aId = String(a.component_id || '').trim();
      const bId = String(b.component_id || '').trim();

      // ถ้ามีค่าว่างให้ย้ายไปไว้ด้านหลัง
      if (!aId) return 1;
      if (!bId) return -1;

      // แยกส่วนของตัวเลข
      const aParts = aId.split('.').map(Number);
      const bParts = bId.split('.').map(Number);

      // เปรียบเทียบทีละส่วน
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = isNaN(aParts[i]) ? 0 : aParts[i];
        const bPart = isNaN(bParts[i]) ? 0 : bParts[i];

        if (aPart !== bPart) {
          return aPart - bPart;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error sorting components:', error, { a, b });
      return 0;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">เพิ่มองค์ประกอบคุณภาพ</h2>
        <p className="text-gray-600">กรอกข้อมูลองค์ประกอบคุณภาพใหม่</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังรีเฟรช...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              รีเฟรชข้อมูล
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            องค์ประกอบ
          </label>
          {loading ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
          ) : (
            <select
              value={componentId}
              onChange={handleComponentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- เลือกองค์ประกอบ --</option>
              {Array.isArray(components) && components.length > 0 ? (
                [...components]
                  .filter(item => item.component_id) // กรองเฉพาะรายการที่มี component_id
                  .sort(sortComponents)
                  .map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.component_id} {item.quality_name ? `- ${item.quality_name}` : ''}
                    </option>
                  ))
              ) : (
                <option value="" disabled>ไม่พบข้อมูลองค์ประกอบ</option>
              )}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อองค์ประกอบคุณภาพ
          </label>
          <input
            type="text"
            value={selectedComponent ? (selectedComponent.quality_name || '') : qualityName}
            onChange={(e) => setQualityName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            placeholder={selectedComponent ? '' : 'ชื่อองค์ประกอบจะถูกเติมให้อัตโนมัติเมื่อเลือกจากรายการด้านบน'}
            readOnly
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            บันทึก
          </button>
        </div>
      </form>
    </div>
  );
}

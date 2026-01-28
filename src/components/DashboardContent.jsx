// src/components/DashboardContent.jsx
import React from 'react';
import DefineComponentSection from './Quality/DefineComponentSection';
import ManageComponentSection from './Quality/ManageComponentSection';
import ReportSection from './ReportSection';
import ResultsContent from './ResultsContent';
// import ResultSection from './ResultSection';

export default function DashboardContent({ user }) {
  // ตรวจสอบว่า user มีข้อมูลครบถ้วน
  if (!user || !user.role) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  // แมป role string กับ role_id ในฐานข้อมูล
  switch (user.role) {
    case 'admin': // role_id: 1
      return <DefineComponentSection />;
    case 'staff': // role_id: 2
      return <ManageComponentSection />;
    case 'evaluator': // role_id: 3
      return (
        <>
          <ReportSection />
          <ResultsContent />
        </>
      );
    case 'external_evaluator': // role_id: 4
      return <ResultsContent />;
    case 'dev': // role_id: 5 - สามารถดูทุกหน้าได้
      return (
        <>
          <DefineComponentSection />
          <ManageComponentSection />
          <ReportSection />
          <ResultsContent />
        </>
      );
    default:
      return <div className="p-8 text-center">ไม่พบสิทธิ์การใช้งานสำหรับบทบาท: {user.role}</div>;
  }
}
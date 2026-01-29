// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  Award, BookOpen, Users, Globe, CheckCircle, Star,
  ChevronRight, Menu, X, GraduationCap, Building,
  FileText, Lock, User, Eye, EyeOff, Shield, UserCheck, Settings, LogOut, LayoutDashboard, Target, Layers
} from 'lucide-react';

// Import Components ที่จะสร้างขึ้นมาใหม่
import Header from './components/Header';
import Footer from './components/Footer';
import SummaryPage from './pages/SummaryPage';
import AssessmentPage from './pages/AssessmentPage';
import CommitteeEvaluationPage from './pages/CommitteeEvaluationPage';
import ReportsPage from './pages/ReportsPage';
import HeroSection from './components/HeroSection';
import LoginModal from './components/LoginModal';
import AboutContent from './components/AboutContent';
import ProcessContent from './components/ProcessContent';
import ResultsContent from './components/ResultsContent';
import DashboardContent from './components/DashboardContent';
import DefineComponentSection from './components/Quality/DefineComponentSection';
import ProgramSelection from './components/ProgramSelection';
import AssessmentTablePage from './pages/AssessmentTablePage';


export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        setActiveTab('dashboard');
      }
      const sel = localStorage.getItem('selectedProgramContext');
      if (sel) {
        try { setSelectedProgram(JSON.parse(sel)); } catch { }
      }
    } catch { }
  }, []);

  // ไม่ใช้ mock users แล้ว ใช้ API จริง

  const rolePermissions = {
    system_admin: { name: 'System Admin', color: 'bg-red-600', permissions: ['manage_structure', 'manage_users', 'view_all'] },
    sar_manager: { name: 'SAR Manager', color: 'bg-blue-600', permissions: ['select_criteria', 'set_targets', 'set_weights', 'manage_rounds', 'check_completeness', 'view_reports'] },
    reporter: { name: 'Reporter', color: 'bg-green-600', permissions: ['fill_results', 'upload_evidence', 'write_sar', 'edit_own_data'] },
    evaluator: { name: 'Evaluator', color: 'bg-yellow-600', permissions: ['view_assigned', 'give_scores', 'give_feedback', 'view_own_eval'] },
    external_evaluator: { name: 'External Evaluator', color: 'bg-purple-600', permissions: ['view_assigned_limited', 'give_scores', 'give_feedback'] },
    executive: { name: 'Executive', color: 'bg-gray-600', permissions: ['view_summary', 'view_dashboard', 'compare_results'] }
  };



  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('about');
    try { localStorage.removeItem('currentUser'); } catch { }
  };

  // ข้อมูลเหล่านี้จะถูกส่งเป็น props ไปยัง TabContent และ Component ย่อย
  const standards = [
    { title: "การบริหารจัดการเชิงกลยุทธ์", description: "การวางแผนและการบริหารจัดการที่มีประสิทธิภาพ", icon: <Building className="w-6 h-6" />, color: "bg-blue-500" },
    { title: "การเรียนการสอน", description: "คุณภาพการศึกษาและหลักสูตรที่ทันสมัย", icon: <BookOpen className="w-6 h-6" />, color: "bg-green-500" },
    { title: "การวิจัยและนวัตกรรม", description: "การพัฒนาองค์ความรู้และนวัตกรรม", icon: <Award className="w-6 h-6" />, color: "bg-purple-500" },
    { title: "การบริการวิชาการ", description: "การบริการแก่สังคมและชุมชน", icon: <Users className="w-6 h-6" />, color: "bg-orange-500" },
    { title: "การทำนุบำรุงศิลปวัทนธรรม", description: "การอนุรักษ์และส่งเสริมศิลปวัทนธรรม", icon: <Globe className="w-6 h-6" />, color: "bg-red-500" },
    { title: "การประกันคุณภาพภายใน", description: "ระบบการประกันคุณภาพที่มีประสิทธิภาพ", icon: <CheckCircle className="w-6 h-6" />, color: "bg-indigo-500" }
  ];

  const achievements = [
    { year: "2024", title: "ผ่านการประเมิน AUNQA ระดับดีเยี่ยม", score: "4.8/5.0" },
    { year: "2023", title: "รางวัลความเป็นเลิศทางวิชาการ ASEAN", score: "4.7/5.0" },
    { year: "2022", title: "การรับรองมาตรฐานสากล ISO 21001", score: "4.6/5.0" },
  ];

  // Logic สำหรับแสดงเนื้อหาแต่ละ Tab
  const TabContent = () => {
    if (!currentUser && activeTab !== 'summary') {
      return (
        <div className="text-center py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">กรุณาเข้าสู่ระบบ</h3>
            <p className="text-gray-600 mb-6">เข้าสู่ระบบเพื่อดูเนื้อหาและใช้งานฟีเจอร์ต่างๆ</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      );
    }


    // ป้องกัน error ถ้า currentUser เป็น null (เช่นหน้า summary)
    let userRole, hasPermission;
    if (currentUser) {
      userRole = rolePermissions[currentUser.role];
      hasPermission = (permission) => userRole.permissions.includes(permission);
    } else {
      userRole = null;
      hasPermission = () => false;
    }

    switch (activeTab) {
      case 'about':
        return <AboutContent currentUser={currentUser} rolePermissions={rolePermissions} standards={standards} />;
      case 'programs':
        return (
          <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">จัดการองค์ประกอบคุณภาพการศึกษา</h1>
              <p className="text-gray-600 mt-2">กรุณาเลือกสาขาที่ต้องการจัดการข้อมูล</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <ProgramSelection
                onComplete={(sel) => {
                  try { localStorage.setItem('selectedProgramContext', JSON.stringify(sel)); } catch { }
                  // Reuse existing session if same major, otherwise create new
                  try {
                    const existingSessionId = localStorage.getItem('assessment_session_id') || '';
                    const prevSelRaw = localStorage.getItem('selectedProgramContext');
                    const prevSel = prevSelRaw ? JSON.parse(prevSelRaw) : null;
                    const sameMajor = prevSel && prevSel.majorName === sel.majorName;
                    if (existingSessionId && sameMajor) {
                      setActiveTab('manage');
                      return;
                    }
                  } catch { }

                  fetch('/api/assessment-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      level_id: sel.levelId,
                      faculty_id: sel.facultyId,
                      faculty_name: sel.facultyName,
                      major_id: sel.majorId,
                      major_name: sel.majorName,
                      evaluator_id: currentUser?.user_id || null,
                    })
                  }).then(r => r.json()).then(data => {
                    if (data && data.session_id) {
                      try { localStorage.setItem('assessment_session_id', String(data.session_id)); } catch { }
                    }
                    setActiveTab('manage');
                  }).catch(() => setActiveTab('manage'));
                }}
              />
            </div>
          </div>
        );
      case 'manage':
        {
          const sel = selectedProgram;
          if (!sel) {
            return (
              <div className="max-w-4xl mx-auto py-12">
                <div className="text-center mb-8">
                  <Layers className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900">จัดการองค์ประกอบคุณภาพการศึกษา</h1>
                  <p className="text-gray-600 mt-2">กรุณาเลือกสาขาที่ต้องการจัดการข้อมูล</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <ProgramSelection
                    onComplete={(s) => {
                      try { localStorage.setItem('selectedProgramContext', JSON.stringify(s)); } catch { }
                      setSelectedProgram(s);
                      // Reuse existing session if same major, otherwise create new
                      try {
                        const existingSessionId = localStorage.getItem('assessment_session_id') || '';
                        const prevSelRaw = localStorage.getItem('selectedProgramContext');
                        const prevSel = prevSelRaw ? JSON.parse(prevSelRaw) : null;
                        const sameMajor = prevSel && prevSel.majorName === s.majorName;
                        if (existingSessionId && sameMajor) {
                          setActiveTab('manage');
                          return;
                        }
                      } catch { }

                      fetch('/api/assessment-sessions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          level_id: s.levelId,
                          faculty_id: s.facultyId,
                          faculty_name: s.facultyName,
                          major_id: s.majorId,
                          major_name: s.majorName,
                          evaluator_id: currentUser?.user_id || null,
                        })
                      }).then(r => r.json()).then(data => {
                        if (data && data.session_id) {
                          try { localStorage.setItem('assessment_session_id', String(data.session_id)); } catch { }
                        }
                        setActiveTab('manage');
                      }).catch(() => setActiveTab('manage'));
                    }}
                  />
                </div>
              </div>
            );
          }

          return (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">จัดการองค์ประกอบคุณภาพการศึกษา</h1>
                <p className="text-gray-600 mt-1">จัดการข้อมูลกลุ่มคุณภาพ องค์ประกอบ และตัวบ่งชี้</p>
              </div>
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">กำลังจัดการของ:</span>{' '}
                  <span className="font-medium">{sel?.majorName || '-'}</span>
                  {sel?.facultyName ? <span className="ml-1 text-gray-500">({sel.facultyName})</span> : null}
                </div>
                <button
                  onClick={() => { try { localStorage.removeItem('selectedProgramContext'); localStorage.removeItem('assessment_session_id'); } catch { }; setSelectedProgram(null); setActiveTab('manage'); }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  เปลี่ยนสาขา
                </button>
              </div>
              <DefineComponentSection />
            </div>
          );
        }
      case 'process':
        return <ProcessContent hasPermission={hasPermission} />;
      case 'results':
        return <ResultsContent hasPermission={hasPermission} achievements={achievements} />;
      case 'summary':
        return <SummaryPage currentUser={currentUser} />;
      case 'committee':
        return <CommitteeEvaluationPage currentUser={currentUser} />;
      case 'assessment_criteria':
        return <AssessmentPage currentUser={currentUser} setActiveTab={setActiveTab} assessmentMode="criteria" />;
      case 'assessment_evaluation':
        return <AssessmentPage currentUser={currentUser} setActiveTab={setActiveTab} assessmentMode="evaluation" />;
      case 'assessment_table':
        return <AssessmentTablePage setActiveTab={setActiveTab} />;
      case 'reports':
        return (
          <>
            <ReportsPage />
          </>
        );
      case 'dashboard':
        return <DashboardContent user={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        handleLogout={handleLogout}
        setShowLogin={setShowLogin}
        rolePermissions={rolePermissions}
      />

      {activeTab === 'about' && (
        <HeroSection
          onGoResults={() => setActiveTab('results')}
          onGoProcess={() => setActiveTab('process')}
        />
      )}

      <main className="flex-grow container mx-auto px-4 py-8">
        <TabContent />
      </main>

      {showLogin && (
        <LoginModal
          onLogin={(user) => {
            setCurrentUser(user);
            try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch { }
            setShowLogin(false);
            setActiveTab('dashboard'); // เปลี่ยนไปหน้า dashboard หลังจากเข้าสู่ระบบ
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      <Footer />
    </div>
  );
}
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, Users, Globe, CheckCircle, Star,
  ChevronRight, Menu, X, GraduationCap, Building,
  FileText, Lock, User, Eye, EyeOff, Shield, UserCheck, Settings, LogOut
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
        try { setSelectedProgram(JSON.parse(sel)); } catch {}
      }
    } catch {}
  }, []);

  // ไม่ใช้ mock users แล้ว ใช้ API จริง

  const rolePermissions = {
    admin: { name: 'Admin', color: 'bg-red-500', permissions: ['read', 'write', 'delete', 'admin'] },
    staff: { name: 'Staff', color: 'bg-blue-500', permissions: ['read', 'write'] },
    evaluator: { name: 'Evaluator', color: 'bg-yellow-500', permissions: ['read', 'write'] },
    external_evaluator: { name: 'External Evaluator', color: 'bg-purple-500', permissions: ['read', 'write'] },
    dev: { name: 'Developer', color: 'bg-green-500', permissions: ['read', 'write', 'delete', 'admin'] }
  };



  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('about');
    try { localStorage.removeItem('currentUser'); } catch {}
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

    switch(activeTab) {
      case 'about':
        return <AboutContent currentUser={currentUser} rolePermissions={rolePermissions} standards={standards} />;
      case 'programs':
        return (
          <ProgramSelection
            onComplete={(sel) => {
              try { localStorage.setItem('selectedProgramContext', JSON.stringify(sel)); } catch {}
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
              } catch {}

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
                  try { localStorage.setItem('assessment_session_id', String(data.session_id)); } catch {}
                }
                setActiveTab('manage');
              }).catch(() => setActiveTab('manage'));
            }}
          />
        );
      case 'manage':
        {
          const sel = selectedProgram;
          if (!sel) {
            return (
              <ProgramSelection
                onComplete={(s) => {
                  try { localStorage.setItem('selectedProgramContext', JSON.stringify(s)); } catch {}
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
                  } catch {}

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
                  }).then(r=>r.json()).then(data=>{
                    if (data && data.session_id) {
                      try { localStorage.setItem('assessment_session_id', String(data.session_id)); } catch {}
                    }
                    setActiveTab('manage');
                  }).catch(()=> setActiveTab('manage'));
                }}
              />
            );
          }

          return (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">กำลังจัดการของ:</span>{' '}
                  <span className="font-medium">{sel?.majorName || '-'}</span>
                  {sel?.facultyName ? <span className="ml-1 text-gray-500">({sel.facultyName})</span> : null}
                </div>
                <button
                  onClick={() => { try { localStorage.removeItem('selectedProgramContext'); localStorage.removeItem('assessment_session_id'); } catch {}; setSelectedProgram(null); setActiveTab('manage'); }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  เปลี่ยนสาขา
                </button>
              </div>
              <DefineComponentSection />
            </>
          );
        }
      case 'process':
        return <ProcessContent hasPermission={hasPermission} />;
      case 'results':
        return <ResultsContent hasPermission={hasPermission} achievements={achievements} />;
      case 'summary':
        return <SummaryPage currentUser={currentUser} />;
      case 'committee':
        return <CommitteeEvaluationPage />;
      case 'assessment':
        return <AssessmentPage currentUser={currentUser} setActiveTab={setActiveTab} />;
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
    <div className="min-h-screen bg-white">
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

      <HeroSection 
        onGoResults={() => setActiveTab('results')}
        onGoProcess={() => setActiveTab('process')}
      />

      <main className="container mx-auto px-4 py-8">
        <TabContent />
      </main>

      {showLogin && (
        <div className="fixed inset-0 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <LoginModal
            onLogin={(user) => {
              setCurrentUser(user);
              try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch {}
              setShowLogin(false);
              setActiveTab('dashboard'); // เปลี่ยนไปหน้า dashboard หลังจากเข้าสู่ระบบ
            }}
          />
        </div>
      )}
      
      <Footer />
    </div>
  );
}
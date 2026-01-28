import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { LayoutDashboard, FileText, CheckCircle, GraduationCap, Clock, RefreshCcw, ChevronRight, BarChart3 } from 'lucide-react';
import ProgramSelection from './ProgramSelection';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartTitle
);

export default function DashboardContent({ user }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalComponents: 0,
    totalIndicators: 0,
    completedAssessments: 0,
    averageScore: 0,
    componentProgress: [],
    recentEvaluations: []
  });

  // Load selected program from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedProgramContext');
      if (saved) {
        setSelectedProgram(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load program context', e);
    }
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchDashboardData();
    }
  }, [selectedProgram]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { majorName } = selectedProgram;
      const sessionId = localStorage.getItem('assessment_session_id');

      // Fetch Components
      const compRes = await fetch(`http://localhost:3001/api/quality-components?major_name=${encodeURIComponent(majorName)}`);
      const components = await compRes.json();

      // Fetch Evaluations
      const evalRes = await fetch(`http://localhost:3001/api/evaluations/history?major_name=${encodeURIComponent(majorName)}&session_id=${sessionId}`);
      const evaluations = await evalRes.json();

      // Fetch Committee Evaluations
      const commRes = await fetch(`http://localhost:3001/api/committee-evaluations?major_name=${encodeURIComponent(majorName)}&session_id=${sessionId}`);
      const committeeEvals = await commRes.json();

      // Calculate stats
      // For simplicity, let's assume each component has some indicators (this would need another API call in a real app, 
      // but we can estimate based on unique indicator_ids in evaluations)
      const uniqueIndicatorIds = new Set(evaluations.map(e => e.indicator_id));

      const componentProgress = components.map(c => {
        const componentEvals = evaluations.filter(e => {
          // This mapping depends on how indicator -> component is stored
          return true; // Simplified for demo
        });
        return {
          name: c.quality_name,
          progress: Math.floor(Math.random() * 40) + 60, // Mock progress for now as indicators aren't fetched here
          score: (Math.random() * 2 + 3).toFixed(2)
        };
      });

      setStats({
        totalComponents: components.length,
        totalIndicators: uniqueIndicatorIds.size || 24, // Mock if empty
        completedAssessments: evaluations.length,
        averageScore: (evaluations.reduce((acc, curr) => acc + (curr.score || 0), 0) / (evaluations.length || 1)).toFixed(2),
        componentProgress,
        recentEvaluations: evaluations.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [stats.completedAssessments, Math.max(0, stats.totalIndicators - stats.completedAssessments)],
      backgroundColor: ['#2563eb', '#f3f4f6'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
    }]
  };

  const barData = {
    labels: stats.componentProgress.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
    datasets: [{
      label: 'Progress (%)',
      data: stats.componentProgress.map(p => p.progress),
      backgroundColor: '#2563eb',
      borderRadius: 4,
    }]
  };

  if (!selectedProgram) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-8">
          <LayoutDashboard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">กรุณาเลือกสาขาเพื่อต้องการดู Dashboard</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <ProgramSelection
            onComplete={(sel) => {
              setSelectedProgram(sel);
              try { localStorage.setItem('selectedProgramContext', JSON.stringify(sel)); } catch { }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-blue-600" />
            ภาพรวมการพัฒนาคุณภาพการศึกษา
          </h1>
          <div className="flex items-center gap-2 mt-1 text-gray-500">
            <span className="font-medium text-blue-700">{selectedProgram.majorName}</span>
            <span>•</span>
            <span>{selectedProgram.facultyName}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={14} /> ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>
        <button
          onClick={() => setSelectedProgram(null)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCcw size={16} /> เปลี่ยนสาขา
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'องค์ประกอบทั้งหมด', value: stats.totalComponents, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'ตัวบ่งชี้ทั้งหมด', value: stats.totalIndicators, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'ประเมินแล้ว', value: stats.completedAssessments, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'คะแนนเฉลี่ย', value: stats.averageScore, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bar Chart */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">ร้อยละความก้าวหน้าตามองค์ประกอบ</h3>
                <p className="text-sm text-gray-500 mt-1">เปรียบเทียบความคืบหน้าการทำงานในแต่ละหมวดหมู่</p>
              </div>
            </div>
            <div className="h-[350px]">
              <Bar
                data={barData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { max: 100, grid: { display: false } },
                    y: { grid: { display: false } }
                  }
                }}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">กิจกรรมล่าสุด</h3>
              <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
                ดูทั้งหมด <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {stats.recentEvaluations.length > 0 ? stats.recentEvaluations.map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">ตัวบ่งชี้ที่ {ev.indicator_id}</p>
                      <p className="text-xs text-gray-500">บันทึกคะแนน: {ev.score}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{new Date(ev.created_at).toLocaleDateString('th-TH')}</p>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full mt-1">สมบูรณ์</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400 italic">ไม่มีกิจกรรมล่าสุด</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Charts & Info */}
        <div className="space-y-8">
          {/* Gauge Chart */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ภาพรวมความก้าวหน้า</h3>
            <p className="text-sm text-gray-500 mb-8">ร้อยละการรายงานข้อมูลทั้งหมด</p>
            <div className="relative h-48 flex items-center justify-center">
              <Doughnut
                data={progressData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '80%',
                  plugins: { legend: { display: false }, tooltip: { enabled: false } }
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
                <p className="text-4xl font-extrabold text-gray-900">
                  {Math.floor((stats.completedAssessments / (stats.totalIndicators || 1)) * 100)}%
                </p>
                <p className="text-xs text-gray-400 font-medium">COMPLETE</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
              <div className="text-center">
                <p className="text-xs text-gray-400">เป้าหมาย</p>
                <p className="text-lg font-bold text-gray-900">100%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">สถานะ</p>
                <p className="text-lg font-bold text-blue-600">On Track</p>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-white text-xl font-bold mb-4 italic text-right">AUN-QA Insight</h3>
              <p className="text-blue-50 mb-6 text-sm leading-relaxed">
                "การรักษามาตรฐานคุณภาพการศึกษาอย่างต่อเนื่อง ช่วยส่งเสริมความเป็นเลิศทางวิชาการและการยอมรับในระดับสากล"
              </p>
              <button className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all uppercase tracking-wider">
                Explore Best Practices
              </button>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
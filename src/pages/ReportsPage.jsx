// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, Filter, Search, Calendar, User,
  ChevronDown, Eye, Edit, Trash2, Printer, FileSpreadsheet,
  BarChart3, TrendingUp, Award, CheckCircle, Clock, RefreshCw, X, ArrowLeft
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { generateAssessmentPDF, downloadPDF } from '../utils/pdfGenerator';
import { BASE_URL } from '../config/api.js';


export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ดึงข้อมูลรายงานจาก API จริง
  const fetchReports = async () => {
    try {
      if (!refreshing) setLoading(true);

      // ดึงข้อมูลจาก API จริง
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();

      // ดึงข้อมูลการประเมินทั้งหมด
      const evaluationsResponse = await fetch(`/api/evaluations/history?${qs}`);
      const evaluationsData = await evaluationsResponse.json();

      // ดึงข้อมูลตัวบ่งชี้
      const indicatorsResponse = await fetch(`/api/quality-components?${qs}`);
      const indicatorsData = await indicatorsResponse.json();

      // สร้างรายงานจากข้อมูลจริง
      const reportsData = evaluationsData.map((evaluation, index) => {
        const indicator = indicatorsData.find(ind => ind.id === evaluation.indicator_id);
        const score = parseFloat(evaluation.score) || 0;

        // ดึงหัวข้อ AUN-QA แบบเต็ม
        const getFullAUNTitle = (indicator) => {
          if (!indicator) return 'ไม่ระบุตัวบ่งชี้';

          // แปลงรหัส AUN เป็นชื่อเต็ม
          const aunCodes = {
            'AUN.1': 'AUN.1 Expected Learning Outcomes',
            'AUN.2': 'AUN.2 Program Specification',
            'AUN.3': 'AUN.3 Structure and Content of Program',
            'AUN.4': 'AUN.4 Teaching and Learning Strategy',
            'AUN.5': 'AUN.5 Student Assessment',
            'AUN.6': 'AUN.6 Academic Staff',
            'AUN.7': 'AUN.7 Support Staff',
            'AUN.8': 'AUN.8 Student Support Services',
            'AUN.9': 'AUN.9 Facilities and Infrastructure',
            'AUN.10': 'AUN.10 Quality Assurance of Teaching and Learning',
            'AUN.11': 'AUN.11 Research and Development',
            'AUN.12': 'AUN.12 Community Services',
            'AUN.13': 'AUN.13 Stakeholders Feedback',
            'AUN.14': 'AUN.14 Output of Program',
            'AUN.15': 'AUN.15 Continuous Quality Improvement'
          };

          // ถ้ามีรหัส AUN ให้ใช้ชื่อเต็ม
          if (indicator.quality_code && aunCodes[indicator.quality_code]) {
            return `${aunCodes[indicator.quality_code]} - ${indicator.quality_name || indicator.qualityName || ''}`;
          }

          // ถ้าไม่มีรหัส AUN ให้แสดงชื่อตัวบ่งชี้ปกติ
          return indicator.quality_name || indicator.qualityName || 'ไม่ระบุตัวบ่งชี้';
        };

        return {
          id: evaluation.evaluation_id || index + 1,
          title: getFullAUNTitle(indicator),
          type: getReportType(indicator?.quality_type || 'general'),
          status: evaluation.status || 'completed',
          date: evaluation.created_at || new Date().toISOString(),
          author: evaluation.evaluator_name || 'ผู้ประเมิน',
          department: major || 'ไม่ระบุสาขา',
          score: score,
          indicators: 1,
          evaluations: 1,
          file: evaluation.evidence_file || null,
          comment: evaluation.comment || '',
          indicatorName: indicator?.quality_name || indicator?.qualityName || 'ไม่ระบุ',
          indicatorType: indicator?.quality_type || 'general',
          indicatorCode: indicator?.quality_code || '',
          fullTitle: getFullAUNTitle(indicator)
        };
      });

      // เรียงลำดับตามวันที่ล่าสุด
      reportsData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setReports(reportsData);
      setFilteredReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // รีเฟรชข้อมูล
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // กำหนดประเภทรายงานจากข้อมูลจริง
  const getReportType = (qualityType) => {
    const typeMap = {
      'strategic': 'strategic',
      'teaching': 'teaching',
      'research': 'research',
      'service': 'service',
      'culture': 'culture',
      'quality': 'quality'
    };
    return typeMap[qualityType] || 'general';
  };

  // Filter reports
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const currentYear = now.getFullYear();

      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        switch (dateFilter) {
          case 'this_year':
            return reportDate.getFullYear() === currentYear;
          case 'last_6_months':
            const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
            return reportDate >= sixMonthsAgo;
          case 'last_month':
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return reportDate >= oneMonthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, dateFilter, reports]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'สมบูรณ์' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" />, label: 'ดำเนินการ' },
      draft: { color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" />, label: 'ฉบับร่าง' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      strategic: { color: 'bg-purple-100 text-purple-800', label: 'การบริหาร' },
      teaching: { color: 'bg-blue-100 text-blue-800', label: 'การสอน' },
      research: { color: 'bg-green-100 text-green-800', label: 'การวิจัย' },
      service: { color: 'bg-pink-100 text-pink-800', label: 'บริการวิชาการ' },
      culture: { color: 'bg-orange-100 text-orange-800', label: 'ศิลปะวัฒนธรรม' },
      quality: { color: 'bg-indigo-100 text-indigo-800', label: 'ประกันคุณภาพ' },
      general: { color: 'bg-gray-100 text-gray-800', label: 'ทั่วไป' }
    };

    const config = typeConfig[type] || typeConfig.general;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handlePrintPDF = async (report) => {
    try {
      console.log('Generating PDF for report:', report);

      // ดึงข้อมูลตัวบ่งชี้จาก API จริงสำหรับสร้าง PDF
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();

      console.log('Fetching indicators with params:', qs);

      const indicatorsResponse = await fetch(`/api/quality-components?${qs}`);
      if (!indicatorsResponse.ok) {
        throw new Error(`HTTP error! status: ${indicatorsResponse.status}`);
      }
      const indicatorsData = await indicatorsResponse.json();

      console.log('Indicators data:', indicatorsData);

      // สร้างข้อมูล indicators สำหรับ PDF
      const pdfIndicators = indicatorsData.map(indicator => ({
        name: indicator.quality_name || indicator.qualityName || 'ไม่ระบุ',
        type: indicator.quality_type || 'general',
        score: report.score || 0, // ใช้คะแนนจากรายงานนี้
        status: 'completed',
        comment: String(report.comment || '') // แปลงเป็น string ชัดๆ
      }));

      // สร้าง PDF ด้วยข้อมูลจริง
      const reportData = {
        title: String(report.title || ''),
        author: String(report.author || ''),
        department: String(report.department || ''),
        date: String(report.date || ''),
        status: String(report.status || ''),
        indicators: Number(report.indicators) || 0,
        evaluations: Number(report.evaluations) || 0,
        score: Number(report.score) || 0,
        comment: String(report.comment || '') // แปลงเป็น string ชัดๆ
      };

      console.log('Generating PDF with data:', { reportData, pdfIndicators });
      generateAssessmentPDF(reportData, pdfIndicators, `${report.title}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`เกิดข้อผิดพลาดในการสร้าง PDF: ${error.message}`);
    }
  };

  const handleDownloadPDF = async (report) => {
    try {
      console.log('Downloading PDF for report:', report);

      // ดึงข้อมูลตัวบ่งชี้จาก API จริงสำหรับสร้าง PDF
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();

      console.log('Fetching indicators with params:', qs);

      const indicatorsResponse = await fetch(`/api/quality-components?${qs}`);
      if (!indicatorsResponse.ok) {
        throw new Error(`HTTP error! status: ${indicatorsResponse.status}`);
      }
      const indicatorsData = await indicatorsResponse.json();

      console.log('Indicators data:', indicatorsData);

      // สร้างข้อมูล indicators สำหรับ PDF
      const pdfIndicators = indicatorsData.map(indicator => ({
        name: indicator.quality_name || indicator.qualityName || 'ไม่ระบุ',
        type: indicator.quality_type || 'general',
        score: report.score || 0, // ใช้คะแนนจากรายงานนี้
        status: 'completed',
        comment: String(report.comment || '') // แปลงเป็น string ชัดๆ
      }));

      const reportData = {
        title: String(report.title || ''),
        author: String(report.author || ''),
        department: String(report.department || ''),
        date: String(report.date || ''),
        status: String(report.status || ''),
        indicators: Number(report.indicators) || 0,
        evaluations: Number(report.evaluations) || 0,
        score: Number(report.score) || 0,
        comment: String(report.comment || '') // แปลงเป็น string ชัดๆ
      };

      console.log('Generating PDF blob with data:', { reportData, pdfIndicators });
      const pdfBlob = await downloadPDF(reportData, pdfIndicators);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`เกิดข้อผิดพลาดในการดาวน์โหลด PDF: ${error.message}`);
    }
  };

  const handleExportExcel = () => {
    // สร้างข้อมูลสำหรับ Excel
    const csvContent = [
      ['ลำดับ', 'ชื่อรายงาน', 'ประเภท', 'สถานะ', 'วันที่', 'ผู้จัดทำ', 'หน่วยงาน', 'คะแนน', 'ตัวบ่งชี้', 'การประเมิน'],
      ...filteredReports.map((report, index) => [
        index + 1,
        report.title,
        report.type,
        report.status,
        report.date,
        report.author,
        report.department,
        report.score || '-',
        report.indicators,
        report.evaluations
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `รายงาน_AUN-QA_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.id));
    }
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
    setShowDetailModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลรายงาน...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าแรกกับมา
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานทั้งหมด</h1>
            <p className="text-gray-600">จัดการและดูรายงานการประเมินคุณภาพ AUN-QA</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              ส่งออก Excel
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรอง
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">รายงานทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">สมบูรณ์</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ดำเนินการ</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">คะแนนเฉลี่ย</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(reports.reduce((sum, r) => sum + (r.score || 0), 0) / reports.filter(r => r.score > 0).length || 0).toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหารายงาน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="completed">สมบูรณ์</option>
                  <option value="in_progress">ดำเนินการ</option>
                  <option value="draft">ฉบับร่าง</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ช่วงเวลา</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="this_year">ปีนี้</option>
                  <option value="last_6_months">6 เดือนล่าสุด</option>
                  <option value="last_month">เดือนล่าสุด</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Selection Actions */}
        {selectedReports.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-blue-800">เลือก {selectedReports.length} รายการ</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                พิมพ์ที่เลือก
              </button>
              <button className="px-3 py-1 bg-white border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm">
                ดาวน์โหลดที่เลือก
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หัวข้อ AUN-QA
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประเภท
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ประเมิน
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คะแนน
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {report.indicatorCode && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-md mr-2">
                            {report.indicatorCode}
                          </span>
                        )}
                        {report.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{report.department}</div>
                      {report.comment && (
                        <div className="text-xs text-gray-400 mt-2 italic" title={report.comment}>
                          " {report.comment} "
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(report.type)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-sm text-gray-900">{report.author}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(report.date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4">
                    {report.score > 0 ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{report.score}</span>
                        <span className="text-sm text-gray-500 ml-1">/5.0</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${(report.score / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePrintPDF(report)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="พิมพ์ PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(report)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="ดาวน์โหลด PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewDetail(report)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {report.file && (
                        <button
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ดูไฟล์หลักฐาน"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรายงาน</h3>
            <p className="text-gray-500">ลองปรับตัวกรองหรือคำค้นหาของคุณ</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">รายละเอียดรายงาน</h2>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลรายงาน</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">หัวข้อ AUN-QA:</span>
                    <p className="font-medium text-gray-900 text-sm leading-relaxed">{selectedReport.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">รหัสตัวบ่งชี้:</span>
                    <p className="font-medium text-gray-900">{selectedReport.indicatorCode || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">ชื่อตัวบ่งชี้:</span>
                    <p className="font-medium text-gray-900">{selectedReport.indicatorName || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">ผู้จัดทำ:</span>
                    <p className="font-medium text-gray-900">{selectedReport.author}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">หน่วยงาน:</span>
                    <p className="font-medium text-gray-900">{selectedReport.department}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">วันที่:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedReport.date).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">สถานะ:</span>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">ประเภท:</span>
                    <div className="mt-1">{getTypeBadge(selectedReport.type)}</div>
                  </div>
                </div>
              </div>

              {/* Score Info */}
              {selectedReport.score > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">คะแนนการประเมิน</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-blue-600">{selectedReport.score}</div>
                    <div className="text-gray-500">/ 5.0</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                          style={{ width: `${(selectedReport.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comment */}
              {selectedReport.comment && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">หมายเหตุ</h3>
                  <p className="text-gray-700">{selectedReport.comment}</p>
                </div>
              )}

              {/* File Info */}
              {selectedReport.file && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">ไฟล์หลักฐาน</h3>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">{selectedReport.file}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handlePrintPDF(selectedReport);
                    handleCloseDetail();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4 inline mr-2" />
                  พิมพ์ PDF
                </button>
                <button
                  onClick={() => {
                    handleDownloadPDF(selectedReport);
                    handleCloseDetail();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  ดาวน์โหลด PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// src/pages/DatabaseManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Database, Server, HardDrive, Trash2, RotateCcw,
    ShieldAlert, ArrowLeft, RefreshCw, Layers,
    FileText, CheckCircle, Users, Activity, AlertCircle, Edit3
} from 'lucide-react';
import MasterComponentsTable from '../components/Admin/MasterComponentsTable';
import MasterIndicatorsTable from '../components/Admin/MasterIndicatorsTable';
import MasterComponentForm from '../components/Admin/MasterComponentForm';
import MasterIndicatorForm from '../components/Admin/MasterIndicatorForm';
import { BASE_URL } from '../config/api.js';
import { useModal } from '../context/ModalContext';

export default function DatabaseManagementPage({ setActiveTab }) {
    const { showAlert, showConfirm } = useModal();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);

    // Management Mode State
    const [manageMode, setManageMode] = useState(null); // null, 'criteria'
    const [activeSubTab, setActiveSubTab] = useState('components'); // 'components', 'indicators'
    const [activeRound, setActiveRound] = useState(null);

    // Master Selection and Form State
    const [programs, setPrograms] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [allComponents, setAllComponents] = useState([]);
    const [allIndicators, setAllIndicators] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showCompForm, setShowCompForm] = useState(false);
    const [showIndForm, setShowIndForm] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchPrograms();
        fetchRounds();
        fetchMasterData();
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/programs`);
            if (res.ok) {
                const data = await res.json();
                setPrograms(data);
            }
        } catch (err) { console.error('Error fetching programs:', err); }
    };

    const fetchRounds = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/rounds`);
            if (res.ok) {
                const data = await res.json();
                setRounds(data);
                const active = data.find(r => r.is_active);
                setActiveRound(active);
            }
        } catch (err) { console.error('Error fetching rounds:', err); }
    };

    const fetchMasterData = async () => {
        try {
            const [compRes, indRes] = await Promise.all([
                fetch(`${BASE_URL}/api/master-quality-components`),
                fetch(`${BASE_URL}/api/master-indicators`)
            ]);
            if (compRes.ok) setAllComponents(await compRes.json());
            if (indRes.ok) setAllIndicators(await indRes.json());
        } catch (err) { console.error('Error fetching master data:', err); }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${BASE_URL}/api/admin/db-stats`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองรีสตาร์ทเซิร์ฟเวอร์');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // --- Master Management Handlers ---

    const handleSaveComponent = async (formData) => {
        try {
            const method = editingItem ? 'PATCH' : 'POST';
            const url = editingItem ? `${BASE_URL}/api/master-quality-components/${editingItem.id}` : `${BASE_URL}/api/master-quality-components`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowCompForm(false);
                setEditingItem(null);
                fetchMasterData();
                fetchStats();
                showAlert({ title: 'สำเร็จ', message: 'บันทึกข้อมูลเรียบร้อยแล้ว', type: 'success' });
            } else {
                showAlert({ title: 'ข้อผิดพลาด', message: 'ไม่สามารถบันทึกข้อมูลได้', type: 'error' });
            }
        } catch (err) {
            console.error('Save component error:', err);
            showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
        }
    };

    const handleDeleteComponent = (id) => {
        showConfirm({
            title: 'ยืนยันการลบ',
            message: 'คุณแน่ใจหรือไม่ที่จะลบแม่แบบองค์ประกอบนี้? ข้อมูลตัวบ่งชี้ที่เกี่ยวข้องอาจสูญหาย',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/master-quality-components/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        fetchMasterData();
                        fetchStats();
                        showAlert({ title: 'สำเร็จ', message: 'ลบข้อมูลสำเร็จ', type: 'success' });
                    }
                } catch (err) { console.error('Delete component error:', err); }
            }
        });
    };

    const handleSaveIndicator = async (formData) => {
        try {
            // Handle Bulk Add (Array of items)
            if (Array.isArray(formData)) {
                const [mainItem, ...subItems] = formData;

                // 1. Save/Update main indicator first
                const method = editingItem ? 'PATCH' : 'POST';
                const mainUrl = editingItem
                    ? `${BASE_URL}/api/master-indicators/${editingItem.id}`
                    : `${BASE_URL}/api/master-indicators`;

                console.log(`Saving main indicator [${method}]:`, mainUrl);
                const mainRes = await fetch(mainUrl, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mainItem)
                });

                if (mainRes.ok) {
                    const savedMain = await mainRes.json();
                    const parentId = editingItem ? editingItem.id : savedMain.id;

                    // 2. If there are sub-indicators, save them in bulk with the correct parent_id
                    if (subItems.length > 0) {
                        const itemsWithParent = subItems.map(item => ({
                            ...item,
                            parent_id: parentId
                        }));

                        const bulkUrl = `${BASE_URL}/api/master-indicators/bulk`;
                        console.log('Bulk saving sub-indicators:', bulkUrl);
                        const bulkRes = await fetch(bulkUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(itemsWithParent)
                        });

                        if (!bulkRes.ok) {
                            const errData = await bulkRes.json().catch(() => ({}));
                            console.error('Bulk save failed:', bulkRes.status, errData);
                            showAlert({ title: 'คำเตือน', message: `บันทึกหัวข้อย่อยบางส่วนไม่สำเร็จ (${bulkRes.status})`, type: 'warning' });
                        }
                    }

                    setShowIndForm(false);
                    setEditingItem(null);
                    fetchMasterData();
                    fetchStats();
                } else {
                    const errData = await mainRes.json().catch(() => ({}));
                    console.error('Main save failed:', mainRes.status, errData);
                    showAlert({ title: 'ข้อผิดพลาด', message: `ไม่สามารถบันทึกข้อมูลหลักได้ (${mainRes.status})`, type: 'error' });
                }
                return;
            }

            // Original Single Item Logic
            const method = editingItem ? 'PATCH' : 'POST';
            const url = editingItem ? `${BASE_URL}/api/master-indicators/${editingItem.id}` : `${BASE_URL}/api/master-indicators`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowIndForm(false);
                setEditingItem(null);
                fetchMasterData();
                fetchStats();
                showAlert({ title: 'สำเร็จ', message: 'บันทึกข้อมูลตัวบ่งชี้เรียบร้อยแล้ว', type: 'success' });
            } else {
                showAlert({ title: 'ข้อผิดพลาด', message: 'ไม่สามารถบันทึกข้อมูลได้', type: 'error' });
            }
        } catch (err) {
            console.error('Save indicator error:', err);
            showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
        }
    };

    const handleDeleteIndicator = (id) => {
        showConfirm({
            title: 'ยืนยันการลบ',
            message: 'คุณแน่ใจหรือไม่ที่จะลบแม่แบบตัวบ่งชี้นี้?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/master-indicators/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        fetchMasterData();
                        fetchStats();
                        showAlert({ title: 'สำเร็จ', message: 'ลบข้อมูลสำเร็จ', type: 'success' });
                    }
                } catch (err) { console.error('Delete indicator error:', err); }
            }
        });
    };

    // --- Original Handlers ---

    const handleClearCollection = (collection, label) => {
        showConfirm({
            title: 'ยืนยันการล้างข้อมูล',
            message: `คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลใน "${label}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลเดิมทั้งหมดจะสูญหาย`,
            type: 'error',
            confirmText: 'ล้างข้อมูลทันที',
            onConfirm: async () => {
                try {
                    setActionLoading(collection);
                    const res = await fetch(`${BASE_URL}/api/admin/clear-collection`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ collection })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        showAlert({ title: 'สำเร็จ', message: data.message, type: 'success' });
                        fetchStats();
                        fetchMasterData();
                    } else {
                        const error = await res.json();
                        showAlert({ title: 'ข้อผิดพลาด', message: error.error || error.details || 'Unknown error', type: 'error' });
                    }
                } catch (error) {
                    console.error('Error clearing collection:', error);
                    showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleResetAssessmentData = () => {
        showConfirm({
            title: 'พื้นที่อันตราย!',
            message: 'คำเตือน: คุณกำลังจะล้างข้อมูลการประเมินทั้งหมด รวมถึงองค์ประกอบและตัวบ่งชี้ ต้องการดำเนินการต่อหรือไม่? การดำเนินการนี้ล้างข้อมูลทั้งระบบ!',
            type: 'error',
            confirmText: 'ฉันเข้าใจ ยืนยันการรีเซ็ต',
            onConfirm: () => {
                showConfirm({
                    title: 'ยืนยันครั้งสุดท้าย',
                    message: 'ข้อมูลทั้งหมด (คะแนน, ไฟล์, ผลการดำเนินงาน) จะหายไปถาวร ยืนยันอีกครั้ง?',
                    type: 'error',
                    confirmText: 'ยืนยันลบข้อมูลทั้งหมด',
                    onConfirm: async () => {
                        try {
                            setActionLoading('reset_all');
                            const res = await fetch(`${BASE_URL}/api/admin/reset-assessment-data`, { method: 'POST' });
                            if (res.ok) {
                                const data = await res.json();
                                showAlert({ title: 'สำเร็จ', message: data.message, type: 'success' });
                                fetchStats();
                                fetchMasterData();
                            } else {
                                const error = await res.json();
                                showAlert({ title: 'ข้อผิดพลาด', message: error.error || error.details || 'Unknown error', type: 'error' });
                            }
                        } catch (error) {
                            console.error('Error resetting data:', error);
                            showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
                        } finally {
                            setActionLoading(null);
                        }
                    }
                });
            }
        });
    };

    const collectionCards = [
        { id: 'quality_components', label: 'องค์ประกอบคุณภาพ', description: 'กลุ่มคุณภาพและข้อกำหนดหลัก', icon: <Layers className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'indicators', label: 'ตัวบ่งชี้', description: 'ตัวชี้วัดในแต่ละองค์ประกอบ', icon: <Activity className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'evaluations', label: 'ข้อมูลการเขียน SAR', description: 'ข้อมูลเบื้องต้นและเนื้อหาการประเมิน', icon: <FileText className="w-6 h-6" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'evaluations_actual', label: 'รายการประเมิน & ไฟล์', description: 'ผลลัพธ์จริงๆ และไฟล์ประกอบหลักฐาน', icon: <CheckCircle className="w-6 h-6" />, color: 'text-teal-600', bg: 'bg-teal-50' },
        { id: 'committee_evaluations', label: 'การประเมินโดยกรรมการ', description: 'คะแนนและข้อเสนอแนะจากกรรมการ', icon: <Users className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'assessment_sessions', label: 'Assessment Sessions', description: 'ข้อมูลเซสชันการประเมินของผู้ใช้', icon: <RefreshCw className="w-6 h-6" />, color: 'text-orange-600', bg: 'bg-orange-50' }
    ];

    const statCards = [
        { id: 'total_collections', label: 'คอลเลกชันทั้งหมด', value: '9 รายการ', icon: <Database className="w-5 h-5" /> },
        { id: 'file_storage', label: 'พื้นที่ใช้งานไฟล์', value: formatBytes(stats.file_storage || 0), icon: <HardDrive className="w-5 h-5" /> },
        { id: 'rounds', label: 'รอบประเมิน', value: `${stats.rounds || 0} ปี`, icon: <RefreshCw className="w-5 h-5" /> },
        { id: 'users', label: 'ผู้ใช้งานในระบบ', value: `${stats.users || 0} คน`, icon: <Users className="w-5 h-5" /> },
    ];

    if (manageMode === 'criteria') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-prompt">
                <div className="flex-1 container mx-auto px-4 py-8 bg-white  overflow-hidden mb-8">
                    <button
                        onClick={() => setManageMode(null)}
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        กลับ
                    </button>

                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                                <Edit3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Master Criteria Templates</h1>
                                <p className="text-gray-600">จัดการ "ข้อมูลต้นแบบ" สำหรับนำไปใช้ในการเปิดประเมินแต่ละรอบ (QA Admin จะเลือกจากรายการที่นี่)</p>
                            </div>
                        </div>
                    </div>

                    {activeRound && (
                        <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <div className="text-amber-800 font-bold">ระวัง: รอบการประเมินปี {activeRound.year} กำลังเปิดใช้งาน</div>
                                <div className="text-amber-700 text-sm">การแก้ไขข้อมูลแม่แบบในขณะที่ยังมีการประเมินอยู่อาจทำให้ผู้ใช้งานเกิดความสับสน ควรจัดการให้เรียบร้อยก่อนเปิดรอบประเมิน</div>
                            </div>
                        </div>
                    )}

                    {/* Sub-Tabs */}
                    <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveSubTab('components')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'components' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            องค์ประกอบ (Components)
                        </button>
                        <button
                            onClick={() => setActiveSubTab('indicators')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'indicators' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            ตัวบ่งชี้ (Indicators)
                        </button>
                    </div>

                    <div className="border border-gray-100 rounded-2xl p-1">
                        {activeSubTab === 'components' ? (
                            <MasterComponentsTable
                                items={allComponents}
                                onAdd={() => { setEditingItem(null); setShowCompForm(true); }}
                                onEdit={(item) => { setEditingItem(item); setShowCompForm(true); }}
                                onDelete={handleDeleteComponent}
                            />
                        ) : (
                            <MasterIndicatorsTable
                                items={allIndicators}
                                components={allComponents}
                                onAdd={() => { setEditingItem(null); setShowIndForm(true); }}
                                onEdit={(item) => { setEditingItem(item); setShowIndForm(true); }}
                                onDelete={handleDeleteIndicator}
                            />
                        )}
                    </div>
                </div>

                {/* Modals */}
                {showCompForm && (
                    <MasterComponentForm
                        item={editingItem}
                        programs={programs}
                        rounds={rounds}
                        onSubmit={handleSaveComponent}
                        onCancel={() => { setShowCompForm(false); setEditingItem(null); }}
                    />
                )}
                {showIndForm && (
                    <MasterIndicatorForm
                        item={editingItem}
                        components={allComponents}
                        programs={programs}
                        rounds={rounds}
                        onSubmit={handleSaveIndicator}
                        onCancel={() => { setShowIndForm(false); setEditingItem(null); }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-prompt">
            <div className="flex-1 container mx-auto px-4 py-8" style={{ backgroundColor: 'white' }}>
                <div className="mb-8">
                    <button
                        onClick={() => setActiveTab('system_management')}
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        กลับ
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-900 rounded-lg">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">จัดการฐานข้อมูล (Database Management)</h1>
                                <p className="text-gray-600">ตรวจสอบสถิติและจัดการข้อมูลในระบบ</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            รีเฟรชสถิติ
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {error && (
                        <div className="col-span-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-2">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    )}

                    {!loading && !error && stats.users === 0 && (
                        <div className="col-span-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center mb-2">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            คำแนะนำ: หากค่าที่แสดงเป็น 0 ทั้งหมด อาจเกิดจากเซิร์ฟเวอร์ยังไม่ได้ถูกรีสตาร์ทเพื่อเปิดใช้งาน API ใหม่
                        </div>
                    )}

                    {statCards.map(card => (
                        <div key={card.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                                {card.icon}
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-0.5">{card.label}</div>
                                <div className="text-xl font-bold text-gray-900 line-clamp-1">
                                    {loading ? '...' : card.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-gray-500" />
                        การจัดการคอลเลกชัน (Collection Actions)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collectionCards.map((card) => (
                            <div key={card.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                                            {card.icon}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 uppercase font-semibold">จำนวนข้อมูล</div>
                                            <div className="text-xl font-bold text-gray-900">
                                                {loading ? '-' : (stats[card.id] || 0)}
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{card.label}</h3>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-1">{card.description}</p>

                                    <div className="flex gap-2">
                                        {(card.id === 'quality_components' || card.id === 'indicators') && (
                                            <button
                                                onClick={() => {
                                                    setManageMode('criteria');
                                                    setActiveSubTab(card.id === 'quality_components' ? 'components' : 'indicators');
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                จัดการ
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleClearCollection(card.id, card.label)}
                                            disabled={actionLoading === card.id}
                                            className={`${(card.id === 'quality_components' || card.id === 'indicators') ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {actionLoading === card.id ? 'กำลังล้าง...' : 'ล้างข้อมูล'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-red-50 rounded-2xl border border-red-100 p-8">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                        <ShieldAlert className="w-8 h-8" />
                        <h2 className="text-xl font-bold">พื้นที่อันตราย (Danger Zone)</h2>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">รีเซ็ตข้อมูลการประเมินทั้งหมด</h3>
                            <p className="text-gray-600 max-w-2xl text-sm">
                                ล้างข้อมูลการประเมิน องค์ประกอบ และตัวบ่งชี้ ทั้งหมดในครั้งเดียว (ระวัง!)
                            </p>
                        </div>
                        <button
                            onClick={handleResetAssessmentData}
                            disabled={actionLoading === 'reset_all'}
                            className="flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-50"
                        >
                            <RotateCcw className={`w-5 h-5 ${actionLoading === 'reset_all' ? 'animate-spin' : ''}`} />
                            {actionLoading === 'reset_all' ? 'กำลังดำเนินการ...' : 'รีเซ็ตข้อมูลทั้งหมด'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

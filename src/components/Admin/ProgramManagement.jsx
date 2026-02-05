// src/components/Admin/ProgramManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    Layers, School, BookOpen, Plus, Edit, Trash2,
    Search, X, ArrowLeft, ChevronRight, Save, AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../../config/api.js';

export default function ProgramManagement({ setActiveTab }) {
    const [activeSubTab, setActiveSubTab] = useState('levels'); // levels | faculties | programs
    const [loading, setLoading] = useState(false);

    // Data states
    const [levels, setLevels] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [programs, setPrograms] = useState([]);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form states
    const [levelForm, setLevelForm] = useState({ name: '' });
    const [facultyForm, setFacultyForm] = useState({ name: '' });
    const [programForm, setProgramForm] = useState({
        majorName: '',
        levelId: '',
        facultyId: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [lRes, fRes, pRes] = await Promise.all([
                fetch(`${BASE_URL}/api/levels`),
                fetch(`${BASE_URL}/api/faculties`),
                fetch(`${BASE_URL}/api/programs`)
            ]);
            if (lRes.ok) setLevels(await lRes.json());
            if (fRes.ok) setFaculties(await fRes.json());
            if (pRes.ok) setPrograms(await pRes.json());
        } catch (error) {
            console.error('Error fetching program data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setEditMode(!!item);

        if (activeSubTab === 'levels') {
            setLevelForm({ name: item?.name || '' });
        } else if (activeSubTab === 'faculties') {
            setFacultyForm({ name: item?.name || '' });
        } else if (activeSubTab === 'programs') {
            setProgramForm({
                majorName: item?.majorName || '',
                levelId: item?.levelId || '',
                facultyId: item?.facultyId || ''
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const type = activeSubTab; // levels | faculties | programs
        const method = editMode ? 'PATCH' : 'POST';
        const url = editMode ? `${BASE_URL}/api/${type}/${editingItem.id}` : `${BASE_URL}/api/${type}`;

        let body = {};
        if (type === 'levels') body = levelForm;
        if (type === 'faculties') body = facultyForm;
        if (type === 'programs') {
            const faculty = faculties.find(f => f.id === programForm.facultyId);
            body = {
                ...programForm,
                facultyName: faculty?.name || '',
                // Legacy support for mixed case IDs if needed
                majorId: editMode ? editingItem.majorId : `maj-${Date.now()}`
            };
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setShowModal(false);
                fetchAllData();
            } else {
                alert('บันทึกไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่? การลบอาจส่งผลกระทบต่อข้อมูลที่เกี่ยวข้อง')) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/${activeSubTab}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAllData();
            } else {
                alert('ลบไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white font-prompt">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button
                        onClick={() => setActiveTab('system_management')}
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        กลับ
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <School className="w-8 h-8 text-blue-600" />
                        จัดการหน่วยงานและหลักสูตร
                    </h1>
                    <p className="text-gray-600">จัดการข้อมูลระดับการศึกษา คณะ และสาขาวิชา</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่ม{activeSubTab === 'levels' ? 'ระดับ' : activeSubTab === 'faculties' ? 'คณะ' : 'สาขาวิชา'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-gray-50/50 p-1 rounded-xl">
                <button
                    onClick={() => setActiveSubTab('levels')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'levels'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-white/50'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    ระดับ ({levels.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('faculties')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'faculties'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-white/50'
                        }`}
                >
                    <School className="w-4 h-4" />
                    คณะ ({faculties.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('programs')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'programs'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-white/50'
                        }`}
                >
                    <BookOpen className="w-4 h-4" />
                    สาขาวิชา / หลักสูตร ({programs.length})
                </button>
            </div>

            {/* List */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {activeSubTab === 'levels' && <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อระดับ</th>}
                                {activeSubTab === 'faculties' && <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อคณะ</th>}
                                {activeSubTab === 'programs' && (
                                    <>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อสาขา</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">คณะ</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ระดับ</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !showModal ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                            ) : (
                                (activeSubTab === 'levels' ? levels : activeSubTab === 'faculties' ? faculties : programs).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {activeSubTab === 'programs' ? item.majorName : item.name}
                                            </div>
                                        </td>
                                        {activeSubTab === 'programs' && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {(() => {
                                                        const faculty = faculties.find(f => f.id === item.facultyId);
                                                        if (faculty) return faculty.name;
                                                        if (item.facultyId) {
                                                            return (
                                                                <div className="flex items-center gap-1 text-red-500" title="ลบไปแล้ว">
                                                                    {item.facultyName || 'ไม่พบข้อมูลคณะ'}
                                                                    <AlertCircle className="w-4 h-4" />
                                                                </div>
                                                            );
                                                        }
                                                        return item.facultyName || '-';
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {(() => {
                                                        const level = levels.find(l => l.id === item.levelId);
                                                        if (level) return level.name;
                                                        if (item.levelId) {
                                                            return (
                                                                <div className="flex items-center gap-1 text-red-500" title="ลบไปแล้ว">
                                                                    {item.levelName || 'ไม่พบข้อมูลระดับ'}
                                                                    <AlertCircle className="w-4 h-4" />
                                                                </div>
                                                            );
                                                        }
                                                        return '-';
                                                    })()}
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {((activeSubTab === 'levels' ? levels : activeSubTab === 'faculties' ? faculties : programs).length === 0 && !loading) && (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editMode ? 'แก้ไข' : 'เพิ่ม'}{activeSubTab === 'levels' ? 'ระดับ' : activeSubTab === 'faculties' ? 'คณะ' : 'สาขาวิชา'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {activeSubTab === 'levels' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">ชื่อระดับ</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        placeholder="เช่น ระดับหลักสูตร, ระดับคณะ"
                                        value={levelForm.name}
                                        onChange={e => setLevelForm({ name: e.target.value })}
                                    />
                                </div>
                            )}

                            {activeSubTab === 'faculties' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">ชื่อคณะ</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        placeholder="เช่น คณะวิศวกรรมศาสตร์"
                                        value={facultyForm.name}
                                        onChange={e => setFacultyForm({ name: e.target.value })}
                                    />
                                </div>
                            )}

                            {activeSubTab === 'programs' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">ชื่อสาขาวิชา / หลักสูตร</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                            placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                                            value={programForm.majorName}
                                            onChange={e => setProgramForm({ ...programForm, majorName: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">ระดับ</label>
                                            <select
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                                value={programForm.levelId}
                                                onChange={e => setProgramForm({ ...programForm, levelId: e.target.value })}
                                            >
                                                <option value="">-- เลือกระดับ --</option>
                                                {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">คณะ</label>
                                            <select
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                                value={programForm.facultyId}
                                                onChange={e => setProgramForm({ ...programForm, facultyId: e.target.value })}
                                            >
                                                <option value="">-- เลือกคณะ --</option>
                                                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

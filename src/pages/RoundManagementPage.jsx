// src/pages/RoundManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Plus, Check, X, AlertCircle, Trash2, Edit2, Save } from 'lucide-react';
import { BASE_URL } from '../config/api';
import { useModal } from '../context/ModalContext';

export default function RoundManagementPage({ setActiveTab }) {
    const { showAlert, showConfirm } = useModal();
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        year: '',
        name: '',
        is_active: false,
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/rounds`);
            if (res.ok) {
                const data = await res.json();
                setRounds(data);
            }
        } catch (error) {
            console.error('Error fetching rounds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            id: null,
            year: (new Date().getFullYear() + 543).toString(), // Default to current Thai year
            name: `ปีการศึกษา ${new Date().getFullYear() + 543}`,
            is_active: false,
            start_date: '',
            end_date: ''
        });
        setShowModal(true);
    };

    const handleEdit = (round) => {
        setFormData({
            id: round.id,
            year: round.year || '',
            name: round.name || '',
            is_active: !!round.is_active,
            start_date: round.start_date || '',
            end_date: round.end_date || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (formData.id) {
                // Update existing round
                res = await fetch(`${BASE_URL}/api/rounds/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new round
                res = await fetch(`${BASE_URL}/api/rounds`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (res.ok) {
                setShowModal(false);
                fetchRounds();
                showAlert({ title: 'สำเร็จ', message: formData.id ? 'แก้ไขรอบประเมินสำเร็จ' : 'สร้างรอบประเมินสำเร็จ', type: 'success' });
            } else {
                const data = await res.json();
                showAlert({ title: 'ข้อผิดพลาด', message: data.error || 'เกิดข้อผิดพลาด', type: 'error' });
            }
        } catch (error) {
            console.error('Error saving round:', error);
            showAlert({ title: 'ข้อผิดพลาด', message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', type: 'error' });
        }
    };

    const handleDelete = (round) => {
        showConfirm({
            title: 'ยืนยันการลบ',
            message: `คุณต้องการลบรอบ "${round.name}" ใช่หรือไม่? ข้อมูลประเมินและไฟล์ทั้งหมดในปีนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้`,
            type: 'error',
            confirmText: 'ลบข้อมูลทั้งหมด',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/rounds/${round.id}`, { method: 'DELETE' });
                    if (res.ok) {
                        fetchRounds();
                        showAlert({ title: 'สำเร็จ', message: 'ลบรอบประเมินเรียบร้อยแล้ว', type: 'success' });
                    } else {
                        showAlert({ title: 'ข้อผิดพลาด', message: 'ลบรอบประเมินไม่สำเร็จ', type: 'error' });
                    }
                } catch (error) {
                    console.error('Error deleting round:', error);
                    showAlert({ title: 'ข้อผิดพลาด', message: 'ลบรอบประเมินไม่สำเร็จ', type: 'error' });
                }
            }
        });
    };
    const handleStatusChange = async (round, newStatus) => {
        const isActive = newStatus === 'active';
        if (round.is_active === isActive) return;

        if (isActive) {
            showConfirm({
                title: 'เปลี่ยนรอบการประเมิน',
                message: `คุณต้องการเปลี่ยนสถานะรอบ "${round.name}" เป็น "เปิดใช้งาน" ใช่หรือไม่? รอบการประเมินอื่นๆ จะถูกปิดใช้งานโดยอัตโนมัติ`,
                type: 'warning',
                confirmText: 'เปิดใช้งานรอบนี้',
                onConfirm: async () => {
                    await updateRoundStatus(round.id, true);
                }
            });
        } else {
            await updateRoundStatus(round.id, false);
        }
    };

    const updateRoundStatus = async (id, isActive) => {
        try {
            const res = await fetch(`${BASE_URL}/api/rounds/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: isActive })
            });

            if (res.ok) {
                fetchRounds();
                if (isActive) showAlert({ title: 'สำเร็จ', message: 'เปลี่ยนรอบการประเมินปัจจุบันเรียบร้อยแล้ว', type: 'success' });
            } else {
                showAlert({ title: 'ข้อผิดพลาด', message: 'อัปเดตสถานะไม่สำเร็จ', type: 'error' });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert({ title: 'ข้อผิดพลาด', message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-prompt">
            <div className="flex-1 container mx-auto px-4 py-8" style={{ backgroundColor: 'gray-50' }}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <button
                            onClick={() => setActiveTab('system_management')}
                            className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            กลับ
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                            <Clock className="w-8 h-8 mr-2 text-blue-600" />
                            จัดการรอบประเมิน
                        </h1>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-1" />
                        เพิ่มรอบประเมิน
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ปีการศึกษา</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อรอบ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระยะเวลา</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">กำลังโหลดข้อมูล...</td></tr>
                            ) : rounds.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4 text-gray-500">ยังไม่มีรอบประเมินในระบบ</td></tr>
                            ) : (
                                rounds.map((round) => (
                                    <tr key={round.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{round.year}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{round.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {round.start_date || round.end_date ? (
                                                <div className="text-xs">
                                                    <div>เริ่ม: {round.start_date ? new Date(round.start_date).toLocaleDateString('th-TH') : '-'}</div>
                                                    <div>สิ้นสุด: {round.end_date ? new Date(round.end_date).toLocaleDateString('th-TH') : '-'}</div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <select
                                                value={round.is_active ? 'active' : 'inactive'}
                                                onChange={(e) => handleStatusChange(round, e.target.value)}
                                                className={`text-xs px-2 py-1 rounded-full border ${round.is_active
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                                    }`}
                                            >
                                                <option value="active">เปิดใช้งาน</option>
                                                <option value="inactive">ปิดใช้งาน</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {round.created_at?.seconds ? new Date(round.created_at.seconds * 1000).toLocaleDateString('th-TH') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(round)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {!round.is_active && (
                                                <button
                                                    onClick={() => handleDelete(round)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {formData.id ? 'แก้ไขรอบประเมิน' : 'เพิ่มรอบประเมินใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            placeholder="เช่น 2567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรอบ</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="เช่น ปีการศึกษา 2567"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.start_date || ''}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.end_date || ''}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                        ตั้งเป็นรอบปัจจุบัน
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-1.5" />
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

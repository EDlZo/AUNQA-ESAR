// src/pages/RoundManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Plus, Check, X, AlertCircle, Trash2, Edit2 } from 'lucide-react';

export default function RoundManagementPage({ setActiveTab }) {
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
            const res = await fetch('/api/rounds');
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
                res = await fetch(`/api/rounds/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new round
                res = await fetch('/api/rounds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (res.ok) {
                setShowModal(false);
                fetchRounds();
                alert(formData.id ? 'แก้ไขรอบประเมินสำเร็จ' : 'สร้างรอบประเมินสำเร็จ');
            } else {
                const data = await res.json();
                alert(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error saving round:', error);
            alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
        }
    };

    const handleDelete = async (round) => {
        if (!window.confirm(`คุณต้องการลบรอบ "${round.name}" ใช่หรือไม่? พึงระวังข้อมูลที่เกี่ยวข้องอาจได้รับผลกระทบ`)) return;

        try {
            const res = await fetch(`/api/rounds/${round.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchRounds();
            } else {
                alert('ลบรอบประเมินไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Error deleting round:', error);
            alert('ลบรอบประเมินไม่สำเร็จ');
        }
    };
    const handleStatusChange = async (round, newStatus) => {
        const isActive = newStatus === 'active';
        // If already in that status, do nothing (though select won't trigger usually)
        if (round.is_active === isActive) return;

        if (isActive && !window.confirm(`คุณต้องการเปลี่ยนสถานะรอบ "${round.name}" เป็น "เปิดใช้งาน" ใช่หรือไม่? รอบอื่นๆ จะถูกปิดใช้งานอัตโนมัติ`)) {
            // Reset select if needed, but since we rely on state updates, just return
            return;
        }

        try {
            const res = await fetch(`/api/rounds/${round.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: isActive })
            });

            if (res.ok) {
                fetchRounds();
            } else {
                alert('อัปเดตสถานะไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-prompt">
            <div className="flex-1 container mx-auto px-4 py-8" style={{ backgroundColor: 'white' }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <button
                            onClick={() => setActiveTab('system_management')}
                            className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            กลับ
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Clock className="w-8 h-8 mr-2 text-orange-600" />
                            จัดการรอบประเมิน
                        </h1>
                        <p className="text-gray-600">กำหนดปีการศึกษาและจัดการสถานะรอบการประเมิน</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-1" />
                        เพิ่มรอบประเมิน
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ปีการศึกษา</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ชื่อรอบ</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ระยะเวลา</th>
                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">สถานะ</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">วันที่สร้าง</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8">กำลังโหลด...</td></tr>
                            ) : rounds.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">ยังไม่มีรอบประเมิน</td></tr>
                            ) : (
                                rounds.map((round) => (
                                    <tr key={round.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{round.year}</td>
                                        <td className="px-6 py-4 text-gray-700">{round.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {round.start_date || round.end_date ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs">เริ่ม: {round.start_date ? new Date(round.start_date).toLocaleDateString('th-TH') : '-'}</span>
                                                    <span className="text-xs">สิ้นสุด: {round.end_date ? new Date(round.end_date).toLocaleDateString('th-TH') : '-'}</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <select
                                                value={round.is_active ? 'active' : 'inactive'}
                                                onChange={(e) => handleStatusChange(round, e.target.value)}
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-orange-500 ${round.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                <option value="active" className="bg-white text-gray-900">เปิดใช้งาน</option>
                                                <option value="inactive" className="bg-white text-gray-900">ปิดใช้งาน</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {round.created_at?.seconds ? new Date(round.created_at.seconds * 1000).toLocaleDateString('th-TH') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleEdit(round)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            {
                                                !round.is_active && (
                                                    <button
                                                        onClick={() => handleDelete(round)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="ลบรอบประเมิน"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )
                                            }
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
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'แก้ไขรอบประเมิน' : 'เพิ่มรอบประเมินใหม่'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ปี (พ.ศ.)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรอบการประเมิน</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={formData.start_date || ''}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={formData.end_date || ''}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                    ตั้งเป็นรอบปัจจุบันทันที
                                </label>
                            </div>

                            <div className="flex justify-end pt-4 gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-gray-600">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

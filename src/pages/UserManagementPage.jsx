// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Edit, Trash2, Search, X, Check, Shield, ArrowLeft } from 'lucide-react';
import { BASE_URL } from '../config/api';
import { useModal } from '../context/ModalContext';

export default function UserManagementPage({ setActiveTab }) {
    const { showAlert, showConfirm } = useModal();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [programs, setPrograms] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role_id: 1,
        faculty_id: '',
        major_id: '',
        major_name: ''
    });

    const roles = [
        { id: 1, name: 'System Admin' },
        { id: 2, name: 'SAR Manager' },
        { id: 3, name: 'Reporter' },
        { id: 5, name: 'External Evaluator' },
        { id: 6, name: 'Executive' },
        { id: 7, name: 'QA Admin' }
    ];

    useEffect(() => {
        fetchUsers();
        fetchPrograms();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/users`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/programs`);
            if (res.ok) {
                const data = await res.json();
                setPrograms(data);
            }
        } catch (error) {
            console.error('Failed to load programs');
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditUser(user);

            // Try to split full_name if first/last are missing
            let fName = user.first_name || '';
            let lName = user.last_name || '';

            if (!fName && !lName && user.full_name) {
                const parts = user.full_name.trim().split(' ');
                fName = parts[0] || '';
                lName = parts.slice(1).join(' ') || '';
            }

            setFormData({
                email: user.email || '',
                password: '', // Don't show password
                first_name: fName,
                last_name: lName,
                role_id: user.role_id || 1,
                faculty_id: user.faculty_id || '',
                major_id: user.major_id || '',
                major_name: user.major_name || ''
            });
        } else {
            setEditUser(null);
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                role_id: 1,
                faculty_id: '',
                major_id: '',
                major_name: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editUser ? `${BASE_URL}/api/users/${editUser.id}` : `${BASE_URL}/api/users`;
            const method = editUser ? 'PUT' : 'POST';

            // Clean up data before sending
            const payload = { ...formData };
            if (editUser && !payload.password) delete payload.password; // Don't send empty password on edit

            // If program selected, attach major_name
            if (payload.major_id) {
                const selectedProgram = programs.find(p => String(p.majorId) === String(payload.major_id));
                if (selectedProgram) {
                    payload.major_name = selectedProgram.majorName;
                    payload.faculty_id = selectedProgram.facultyId; // Auto set faculty
                }
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                fetchUsers();
                showAlert({ title: 'สำเร็จ', message: editUser ? 'อัปเดตผู้ใช้งานสำเร็จ' : 'สร้างผู้ใช้งานสำเร็จ', type: 'success' });
            } else {
                const data = await res.json();
                showAlert({ title: 'ข้อผิดพลาด', message: data.message || 'เกิดข้อผิดพลาด', type: 'error' });
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
        }
    };

    const handleDelete = (id) => {
        showConfirm({
            title: 'ยืนยันการลบ',
            message: 'คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
            type: 'error',
            confirmText: 'ลบผู้ใช้งาน',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/users/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        fetchUsers();
                        showAlert({ title: 'สำเร็จ', message: 'ลบผู้ใช้งานสำเร็จ', type: 'success' });
                    } else {
                        showAlert({ title: 'ข้อผิดพลาด', message: 'ลบผู้ใช้งานไม่สำเร็จ', type: 'error' });
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
                }
            }
        });
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
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
                        <Users className="w-8 h-8 mr-2 text-blue-600" />
                        จัดการผู้ใช้งาน
                    </h1>
                    <p className="text-gray-600">จัดการรายชื่อผู้ใช้งานและกำหนดสิทธิ์การเข้าถึง</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    เพิ่มผู้ใช้งาน
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ หรือ อีเมล..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สาขา/หน่วยงาน</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8">กำลังโหลด...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {roles.find(r => r.id === user.role_id)?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.major_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleOpenModal(user)} className="text-gray-500 hover:text-gray-700 mr-4">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{editUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editUser ? 'รหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)' : 'รหัสผ่าน'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editUser}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.role_id}
                                        onChange={e => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Show Program Selection only for relevant roles if needed, or always allow */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">สาขาวิชา (ถ้ามี)</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.major_id}
                                        onChange={e => setFormData({ ...formData, major_id: e.target.value })}
                                    >
                                        <option value="">-- ไม่ระบุ --</option>
                                        {programs.map(p => (
                                            <option key={p.majorId} value={p.majorId}>{p.majorName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end pt-4 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

        </>
    );
}

// src/components/Admin/MasterComponentForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function MasterComponentForm({ item, programs, rounds, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        component_id: '',
        quality_name: '',
        major_name: '',
        year: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                component_id: item.component_id || '',
                quality_name: item.quality_name || '',
                major_name: item.major_name || '',
                year: item.year || ''
            });
        }
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">
                        {item ? 'แก้ไของค์ประกอบคุณภาพ' : 'เพิ่มองค์ประกอบคุณภาพใหม่'}
                    </h3>
                    <button onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">รหัสองค์ประกอบ</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.component_id}
                                onChange={(e) => setFormData({ ...formData, component_id: e.target.value })}
                                placeholder="เช่น 1 หรือ 1.1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ปีการศึกษา</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            >
                                <option value="">-- อ้างอิงตามปีปัจจุบัน --</option>
                                {rounds.map(r => (
                                    <option key={r.id} value={r.year}>{r.year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ชื่อองค์ประกอบคุณภาพ</label>
                        <textarea
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                            value={formData.quality_name}
                            onChange={(e) => setFormData({ ...formData, quality_name: e.target.value })}
                            placeholder="ระบุชื่อหรือรายละเอียดองค์ประกอบ..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">หลักสูตร (ถ้าเป็น Global ให้เว้นว่าง)</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.major_name}
                            onChange={(e) => setFormData({ ...formData, major_name: e.target.value })}
                        >
                            <option value="">-- มาตรฐานกลาง (Global) --</option>
                            {programs.map(p => (
                                <option key={p.id} value={p.majorName || p.major_name}>{p.majorName || p.major_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                        >
                            <Save className="w-4 h-4" />
                            {item ? 'บันทึกการแก้ไข' : 'สร้างข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// src/components/Admin/MasterComponentsTable.jsx
import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Plus, ArrowUpDown } from 'lucide-react';

export default function MasterComponentsTable({ items, onEdit, onDelete, onAdd }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [majorFilter, setMajorFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    const majors = ['all', ...new Set(items.map(item => item.major_name || 'Global'))];
    const years = ['all', ...new Set(items.map(item => item.year || 'N/A'))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.quality_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(item.component_id).includes(searchTerm);
        const matchesMajor = majorFilter === 'all' || (item.major_name || 'Global') === majorFilter;
        const matchesYear = yearFilter === 'all' || (item.year || 'N/A') === yearFilter;
        return matchesSearch && matchesMajor && matchesYear;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="ค้นหาตามชื่อหรือรหัสองค์ประกอบ..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={majorFilter}
                        onChange={(e) => setMajorFilter(e.target.value)}
                    >
                        <option value="all">ทุกหลักสูตร</option>
                        {majors.filter(m => m !== 'all').map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <select
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="all">ทุกปีการศึกษา</option>
                        {years.filter(y => y !== 'all').map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    เพิ่มองค์ประกอบ
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100 w-24">ลำดับ</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100">ชื่อองค์ประกอบคุณภาพ</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100 w-48">หลักสูตร</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100 w-32">ปีการศึกษา</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-100">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                        {item.component_id}
                                    </span>
                                </td>
                                <td className="px-6 py-4 border-r border-gray-100">
                                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.quality_name}</div>
                                </td>
                                <td className="px-6 py-4 border-r border-gray-100">
                                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${item.major_name ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                        {item.major_name || 'Global'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center border-r border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">{item.year || '-'}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="แก้ไข"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="ลบ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic bg-gray-50/50">
                                    ไม่พบข้อมูลองค์ประกอบคุณภาพตามเงื่อนไขที่ระบุ
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-xs text-gray-400 px-2">
                * ข้อมูล 'Global' คือเกณฑ์มาตรฐานกลางที่ใช้ร่วมกัน หากระบุหลักสูตรจะเป็นเกณฑ์เฉพาะของหลักสูตรนั้น
            </div>
        </div>
    );
}

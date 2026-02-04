// src/components/Admin/MasterIndicatorsTable.jsx
import React, { useState, useMemo } from 'react';
import {
    Search, Edit2, Trash2, Plus, Type,
    Layers, ChevronDown, ChevronRight, Activity,
    Box, Filter, MoreHorizontal
} from 'lucide-react';

// Recursive Row Component for Level 2+ Accordion
const IndicatorRow = ({ item, depth = 0, onEdit, onDelete, onAddSub }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    const toggleExpand = (e) => {
        if (hasChildren) {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className="flex flex-col">
            <div
                className={`flex items-center group border-b border-gray-100 transition-all hover:bg-slate-50 relative ${depth > 0 ? 'bg-gray-50/20' : 'bg-white'}`}
                onClick={toggleExpand}
                style={{ cursor: hasChildren ? 'pointer' : 'default' }}
            >
                {/* Visual Indentation Line */}
                {depth > 0 && Array.from({ length: depth }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[1px] bg-gray-200 h-full"
                        style={{ left: `${(i + 1) * 1.25}rem` }}
                    />
                ))}

                {/* ID/Seq Column */}
                <div
                    className="w-20 px-3 py-3.5 flex items-center justify-center border-r border-gray-100 relative z-10"
                    style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
                >
                    {hasChildren && (
                        <div className="mr-1.5 transition-transform duration-200">
                            {isExpanded ?
                                <ChevronDown className="w-3.5 h-3.5 text-indigo-500" /> :
                                <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                            }
                        </div>
                    )}
                    <span className={`text-[11px] font-bold ${depth === 0 ? 'text-indigo-700' : 'text-gray-400'}`}>
                        {item.sequence ? item.sequence.split('.').map(p => parseInt(p, 10)).join('.') : '-'}
                    </span>
                </div>

                {/* Name/Detail Column */}
                <div className="flex-1 px-5 py-3.5 border-r border-gray-100 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${depth === 0 ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                            {item.indicator_name || 'ไม่ระบุชื่อตัวบ่งชี้'}
                        </span>
                        {depth === 0 && item.indicator_type && (
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                                {item.indicator_type === 'Quantitative' ? 'QTY' : 'QLT'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Metadata - Only for main level to keep it clean */}
                {depth === 0 && (
                    <div className="w-40 px-4 py-3 border-r border-gray-100 hidden lg:block italic text-[11px] text-gray-400">
                        {item.major_name || 'Global'}
                    </div>
                )}

                {/* Action Column */}
                <div className="w-36 px-4 py-3 flex items-center justify-end gap-1 relative z-10">
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                        {/* Only allow adding sub-indicators if it doesn't already have children or is level 0 */}

                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-Items (Recursion) */}
            {hasChildren && isExpanded && (
                <div className="bg-gray-50/10">
                    {item.children.map(child => (
                        <IndicatorRow
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function MasterIndicatorsTable({ items, components, onEdit, onDelete, onAdd }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedComponents, setExpandedComponents] = useState({});

    // 1. Build Tree and Filter
    const treeData = useMemo(() => {
        // Safe filter
        const filtered = items.filter(item => {
            const name = (item.indicator_name || '').toLowerCase();
            const seq = String(item.sequence || '').toLowerCase();
            const term = searchTerm.toLowerCase();
            return name.includes(term) || seq.includes(term);
        });

        // Group by component
        const compGroups = {};
        components.forEach(c => {
            compGroups[c.component_id] = { ...c, nodes: [] };
        });

        // Build hierarchy for each component
        filtered.forEach(item => {
            const group = compGroups[item.component_id];
            if (group) group.nodes.push({ ...item, children: [] });
        });

        // Convert flat nodes to trees within each group
        Object.values(compGroups).forEach(group => {
            const nodeMap = {};
            group.nodes.forEach(node => { nodeMap[node.id] = node; });

            const rootNodes = [];
            group.nodes.forEach(node => {
                if (node.parent_id && nodeMap[node.parent_id]) {
                    nodeMap[node.parent_id].children.push(node);
                } else {
                    rootNodes.push(node);
                }
            });

            // Sort root nodes by sequence
            rootNodes.sort((a, b) => String(a.sequence).localeCompare(String(b.sequence), undefined, { numeric: true }));
            group.tree = rootNodes;
        });

        return Object.values(compGroups)
            .filter(g => g.tree.length > 0 || (searchTerm === '' && g.quality_name))
            .sort((a, b) => (a.component_id || 0) - (b.component_id || 0));
    }, [items, components, searchTerm]);

    const toggleComponent = (id) => {
        setExpandedComponents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-lg group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อตัวบ่งชี้หรือเลขลำดับ..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => onAdd()}
                    className="ml-4 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    เพิ่มตัวบ่งชี้ใหม่
                </button>
            </div>

            {/* List of Components (Accordion Level 1) */}
            <div className="space-y-4">
                {treeData.length > 0 ? (
                    treeData.map((comp) => {
                        const isExpanded = expandedComponents[comp.id] !== false; // Default expanded

                        return (
                            <div key={comp.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Component Header */}
                                <div
                                    className="bg-slate-50/70 py-4 px-6 flex items-center justify-between cursor-pointer group"
                                    onClick={() => toggleComponent(comp.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform border border-indigo-50">
                                            {comp.component_id}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 leading-tight">{comp.quality_name}</h3>
                                            <p className="text-[11px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">
                                                {comp.major_name || 'Global'} • {comp.nodes.length} รายการ
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2 hover:bg-indigo-100/50 rounded-xl transition-colors">
                                        {isExpanded ?
                                            <ChevronDown className="w-5 h-5 text-gray-400" /> :
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        }
                                    </div>
                                </div>

                                {/* Component Tree (Accordion Level 2+) */}
                                {isExpanded && (
                                    <div className="border-t border-gray-50 flex flex-col">
                                        {comp.tree.length > 0 ? (
                                            comp.tree.map(node => (
                                                <IndicatorRow
                                                    key={node.id}
                                                    item={node}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
                                                    onAddSub={(parent) => onAdd({
                                                        ...parent,
                                                        parent_id: parent.id,
                                                        parent_name: parent.indicator_name,
                                                        id: undefined // Ensures we don't edit the parent itself
                                                    })}
                                                />
                                            ))
                                        ) : (
                                            <div className="py-12 text-center">
                                                <Box className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                                <p className="text-sm text-gray-400 italic">ไม่มีข้อมูลแสดงผล</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
                        <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium italic">ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
                    </div>
                )}
            </div>
        </div>
    );
}


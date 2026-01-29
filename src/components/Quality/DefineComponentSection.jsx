// src/components/DefineComponentSection.jsx
import React, { useState, useEffect } from 'react';
import QualityComponentsTable from '../Quality/QualityComponentsTable';
import AddQualityForm from './AddQualityForm';
import EditQualityForm from './EditQualityForm'; // เพิ่ม modal แก้ไข
import IndicatorForm from '../IndicatorForm';
import IndicatorTable from '../IndicatorTable';
import InstructionsSection from '../InstructionsSection';
import { AUNQA_SUBITEMS } from '../../templates/aunqa';
import { BASE_URL } from '../../config/api.js';


function pad2(n) {
  try { return String(parseInt(String(n), 10)).padStart(2, '0'); } catch { return '00'; }
}

// Helper to pad sequence like "1" to "01" or "1.1" to "01.01"
const normalizeSequence = (seq) => {
  if (!seq) return '';
  return String(seq).split('.')
    .map(part => {
      const p = part.trim();
      return p.length === 1 ? '0' + p : p;
    })
    .join('.');
};

async function seedIndicatorsForMainCode(mainCode, componentDbId, ctx) {
  const subitems = AUNQA_SUBITEMS[mainCode] || [];
  if (subitems.length === 0) return;
  const mainNumMatch = mainCode.match(/AUN\.(\d+)/i);
  const mainPart = pad2(mainNumMatch ? mainNumMatch[1] : '0');

  // เตรียมข้อมูลเป็น Array เพื่อส่งแบบ Bulk
  const indicatorsToSeed = subitems.map(it => ({
    component_id: componentDbId,
    sequence: `${mainPart}.${it.seq}`,
    indicator_type: 'ผลลัพธ์',
    criteria_type: 'เชิงคุณภาพ',
    indicator_name: it.text,
    data_source: '',
    session_id: ctx.session_id || '',
    major_name: ctx.major_name || ''
  }));

  try {
    const res = await fetch(`${BASE_URL}/api/bulk/indicators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indicators: indicatorsToSeed })
    });
    if (!res.ok) {
      console.error('Failed to seed indicators in bulk');
    }
  } catch (err) {
    console.error('Error seeding indicators:', err);
  }
}


export default function DefineComponentSection() {
  const [qualityName, setQualityName] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [componentId, setComponentId] = useState('1');

  const [showIndicatorForm, setShowIndicatorForm] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [indicatorSequence, setIndicatorSequence] = useState('');
  const [indicatorType, setIndicatorType] = useState('');
  const [criteriaType, setCriteriaType] = useState('');
  const [indicatorName, setIndicatorName] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [indicators, setIndicators] = useState({});
  const [isAssessing, setIsAssessing] = useState(false);
  const [evaluatedMap, setEvaluatedMap] = useState({}); // { [indicatorId]: true }

  const [editItem, setEditItem] = useState(null); // สำหรับ modal แก้ไข
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [currentContext, setCurrentContext] = useState({ facultyName: '', majorName: '' });

  // ดึงข้อมูลจาก backend
  useEffect(() => {
    const fetchQualityComponents = async () => {
      try {
        let sessionId = localStorage.getItem('assessment_session_id');
        if (!sessionId) {
          sessionId = Math.floor(Date.now() / 1000).toString();
          localStorage.setItem('assessment_session_id', sessionId);
        }

        const sel = localStorage.getItem('selectedProgramContext');
        let major = '';
        if (sel) {
          try {
            const parsed = JSON.parse(sel);
            major = parsed?.majorName || parsed?.major_name || '';
            setCurrentContext({
              facultyName: parsed?.facultyName || parsed?.faculty_name || '',
              majorName: major
            });
          } catch { }
        }
        const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
        const res = await fetch(`${BASE_URL}/api/quality-components?${qs}`);

        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data : []);
        } else {
          console.warn('API response not OK:', res.status, res.statusText);
          // ใช้ข้อมูลเริ่มต้นเมื่อ API ไม่พร้อมใช้งาน
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching quality components:', error);
        // ใช้ข้อมูลเริ่มต้นเมื่อเกิดข้อผิดพลาด
        setItems([]);
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };
    fetchQualityComponents();
  }, []);

  // ฟังก์ชันเพิ่มองค์ประกอบ
  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!componentId || !qualityName) return;

    const ctx = (() => {
      try {
        let sessionId = localStorage.getItem('assessment_session_id');
        if (!sessionId) {
          sessionId = Math.floor(Date.now() / 1000).toString();
          localStorage.setItem('assessment_session_id', sessionId);
        }
        const sel = localStorage.getItem('selectedProgramContext');
        const major = sel ? (JSON.parse(sel)?.majorName || JSON.parse(sel)?.major_name || '') : '';
        return { session_id: sessionId, major_name: major };
      } catch { return { session_id: '', major_name: '' }; }
    })();

    const newItem = {
      component_id: parseInt(componentId),
      quality_name: qualityName,
      ...ctx
    };
    const res = await fetch(`${BASE_URL}/api/quality-components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    if (res.ok) {
      const result = await res.json();
      setItems([...items, { ...newItem, id: result.id }]);

      setComponentId('1');
      setQualityName('');
      setShowAddForm(false);
    } else {
      setError('บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  // ฟังก์ชันลบองค์ประกอบ
  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบองค์ประกอบนี้?')) return;

    const ctxParams = (() => {
      try {
        const sessionId = localStorage.getItem('assessment_session_id') || '';
        const sel = localStorage.getItem('selectedProgramContext');
        const major = sel ? (JSON.parse(sel)?.majorName || JSON.parse(sel)?.major_name || '') : '';
        return new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      } catch { return ''; }
    })();

    const res = await fetch(`${BASE_URL}/api/quality-components/${id}?${ctxParams}`, { method: 'DELETE' });
    if (res.ok) {
      setItems(items.filter(item => item.id !== id));
    } else {
      setError('ลบข้อมูลไม่สำเร็จ');
    }
  };

  // ฟังก์ชันแก้ไของค์ประกอบ
  const handleEdit = (item) => {
    setEditItem(item);
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      console.log('ส่งข้อมูลแก้ไขไปยัง backend:', updatedItem); // log ข้อมูลที่ส่ง

      const ctx = (() => {
        try {
          const sessionId = localStorage.getItem('assessment_session_id') || '';
          const sel = localStorage.getItem('selectedProgramContext');
          const major = sel ? (JSON.parse(sel)?.majorName || JSON.parse(sel)?.major_name || '') : '';
          return { session_id: sessionId, major_name: major };
        } catch { return { session_id: '', major_name: '' }; }
      })();

      const res = await fetch(`${BASE_URL}/api/quality-components/${updatedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedItem, ...ctx })
      });

      console.log('HTTP response status:', res.status); // log status code

      if (res.ok) {
        const result = await res.json();
        console.log('ผลลัพธ์จาก backend:', result); // log response body
        setItems(prev => prev.map(it => it.id === updatedItem.id ? updatedItem : it));
        setEditItem(null);
      } else {
        const errorText = await res.text(); // อ่านข้อความ error จาก server
        console.error('แก้ไขข้อมูลไม่สำเร็จ:', errorText);
        setError('แก้ไขข้อมูลไม่สำเร็จ');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล:', err);
      setError('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
  };



  // ฟังก์ชันเปิดฟอร์มตัวบ่งชี้
  const openIndicatorForm = (component) => {
    setSelectedComponent(component);
    setShowIndicatorForm(true);
  };

  // ดึง indicators จาก backend ทุกครั้งที่เลือก component หรือเปิดฟอร์มตัวบ่งชี้
  useEffect(() => {
    if (!selectedComponent) return;
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || JSON.parse(sel)?.major_name || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      fetch(`${BASE_URL}/api/indicators-by-component/${selectedComponent.id}?${qs}`)
        .then(res => res.json())
        .then(async (data) => {
          setIndicators(prev => ({ ...prev, [selectedComponent.id]: data }));
          // ดึงประวัติการประเมินเพื่อทำเครื่องหมายสถานะหลังรีเฟรช
          try {
            const history = await fetch(`${BASE_URL}/api/evaluations/history?${qs}`).then(r => r.json());
            const map = {};
            if (Array.isArray(history)) {
              history.forEach(row => {
                if (row.indicator_id && row.session_id == sessionId) {
                  map[row.indicator_id] = true;
                }
              });
            }
            setEvaluatedMap(map);
          } catch { }
        })
        .catch(() => {
          setIndicators(prev => ({ ...prev, [selectedComponent.id]: [] }));
        });
    } catch {
      setIndicators(prev => ({ ...prev, [selectedComponent.id]: [] }));
    }
  }, [selectedComponent, showIndicatorForm]);

  // ฟังก์ชันเพิ่มตัวบ่งชี้
  const handleAddIndicator = async (e) => {
    e.preventDefault();
    if (!selectedComponent || !indicatorName) return;

    const normSeq = normalizeSequence(indicatorSequence);
    const ctx = (() => {
      try {
        const sessionId = localStorage.getItem('assessment_session_id') || '';
        const sel = localStorage.getItem('selectedProgramContext');
        const major = sel ? (JSON.parse(sel)?.majorName || JSON.parse(sel)?.major_name || '') : '';
        return { session_id: sessionId, major_name: major };
      } catch { return { session_id: '', major_name: '' }; }
    })();

    const newIndicator = {
      component_id: selectedComponent.id,
      sequence: normSeq,
      indicator_type: indicatorType,
      criteria_type: criteriaType,
      indicator_name: indicatorName,
      data_source: dataSource
    };

    try {
      // --- แก้ไข: เพิ่มการตรวจสอบตัวบ่งชี้ซ้ำในฝั่ง client ก่อนส่งไป server ---
      const currentIndicators = indicators[selectedComponent.id] || [];
      const dupBySeq = currentIndicators.some(ind => normalizeSequence(ind.sequence) === normSeq);
      const dupByName = currentIndicators.some(ind => {
        const nameA = String(ind.indicator_name || ind.indicatorName || '').trim().toLowerCase();
        const nameB = String(newIndicator.indicator_name).trim().toLowerCase();
        return nameA === nameB;
      });

      if (dupBySeq || dupByName) {
        setError('ตัวบ่งชี้นี้มีอยู่แล้ว (ลำดับหรือชื่อซ้ำ)');
        return;
      }

      // บันทึกเฉพาะหัวข้อเดียวตามที่ผู้ใช้ต้องการ (ยกเลิกการเพิ่มหัวข้อย่อยอัตโนมัติ)
      const res = await fetch(`${BASE_URL}/api/indicators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIndicator, ...ctx })
      });

      if (res.ok) {
        const result = await res.json();
        const addedItem = {
          ...newIndicator,
          ...ctx,
          id: result.id
        };

        setIndicators(prev => {
          const newList = [...(prev[selectedComponent.id] || []), addedItem];
          // เรียงลำดับทันทีในหน้าจอโดยใช้ numeric sorting
          newList.sort((a, b) => normalizeSequence(a.sequence).localeCompare(normalizeSequence(b.sequence), undefined, { numeric: true }));
          return { ...prev, [selectedComponent.id]: newList };
        });

        // รีเซ็ตฟอร์ม
        setShowIndicatorForm(false);
        setIndicatorName('');
        setIndicatorType('');
        setCriteriaType('');
        setDataSource('');
        setIndicatorSequence('');
        setError('');
      } else {
        setError('บันทึกตัวบ่งชี้ไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกตัวบ่งชี้');
    }
  };


  // ฟังก์ชันลบตัวบ่งชี้
  const handleDeleteIndicator = async (indicatorId, componentId) => {
    if (!window.confirm('ยืนยันการลบตัวบ่งชี้นี้?')) return;

    try {
      const ctxParams = (() => {
        try {
          const sessionId = localStorage.getItem('assessment_session_id') || '';
          const sel = localStorage.getItem('selectedProgramContext');
          const major = sel ? (JSON.parse(sel)?.majorName || JSON.parse(sel)?.major_name || '') : '';
          return new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
        } catch { return ''; }
      })();
      const res = await fetch(`${BASE_URL}/api/indicators/${indicatorId}?${ctxParams}`, { method: 'DELETE' });
      if (res.ok) {
        setIndicators(prev => ({
          ...prev,
          [componentId]: prev[componentId].filter(ind => ind.id !== indicatorId)
        }));
      } else {
        setError('ลบตัวบ่งชี้ไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการลบตัวบ่งชี้');
    }
  };

  // ฟังก์ชันแก้ไขตัวบ่งชี้ (เปิดฟอร์มแก้ไข)
  const handleEditIndicator = (indicator) => {
    setSelectedIndicator(indicator);
    setIndicatorSequence(indicator.sequence);
    setIndicatorType(indicator.indicator_type);
    setCriteriaType(indicator.criteria_type);
    setIndicatorName(indicator.indicator_name);
    setDataSource(indicator.data_source);
    setShowIndicatorForm(true);
  };

  // ฟังก์ชันเปิด/ปิดฟอร์ม
  const openAddForm = () => setShowAddForm(true);
  const closeAddForm = () => {
    setShowAddForm(false);
    setQualityName('');
    setError('');
  };

  const closeIndicatorForm = () => {
    setShowIndicatorForm(false);
    setSelectedComponent(null);
    setIndicatorName('');
    setIndicatorType('');
    setCriteriaType('');
    setDataSource('');
    setIndicatorSequence('');
    setError('');
  };

  // แสดงฟอร์มเพิ่มองค์ประกอบ
  if (showAddForm) {
    return (
      <AddQualityForm
        qualityName={qualityName}
        componentId={componentId}
        setComponentId={setComponentId}
        setQualityName={setQualityName}
        onSubmit={handleAdd}
        onCancel={closeAddForm}
        error={error}
      />
    );
  }

  // แสดงฟอร์มตัวบ่งชี้
  if (selectedComponent) {
    return (
      <div>
        {isAssessing ? null : (
          <button
            onClick={() => setSelectedComponent(null)}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            กลับ
          </button>
        )}
        {/* UI เพิ่มหัวข้อย่อยโดยอัตโนมัติถูกถอดออก ตามคำขอ */}
        {/* ฟอร์มย้ายไปอยู่ใน IndicatorTable ให้แสดงเพียงอันเดียวตลอด */}
        <IndicatorTable
          selectedComponent={selectedComponent}
          indicators={indicators}
          onEditClick={handleEditIndicator}
          onDeleteClick={handleDeleteIndicator}
          onAfterBulkAdded={async () => {
            try {
              const sessionId = localStorage.getItem('assessment_session_id') || '';
              const sel = localStorage.getItem('selectedProgramContext');
              const major = sel ? (JSON.parse(sel)?.majorName || JSON.parse(sel)?.major_name || '') : '';
              const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
              const refreshed = await fetch(`${BASE_URL}/api/indicators-by-component/${selectedComponent.id}?${qs}`).then(r => r.json()).catch(() => []);
              setIndicators(prev => ({ ...prev, [selectedComponent.id]: Array.isArray(refreshed) ? refreshed : [] }));
              // refresh evaluated map as well
              const history = await fetch(`${BASE_URL}/api/evaluations/history?${qs}`).then(r => r.json()).catch(() => []);
              const map = {};
              if (Array.isArray(history)) {
                history.forEach(row => { if (row.indicator_id && row.session_id == sessionId) map[row.indicator_id] = true; });
              }
              setEvaluatedMap(map);
            } catch { }
          }}
          onAssessingChange={setIsAssessing}
          evaluatedMap={evaluatedMap}
          onMarkEvaluated={(indicatorId, val) => setEvaluatedMap(prev => ({ ...prev, [indicatorId]: !!val }))}
        />
      </div>
    );
  }

  // หน้าแสดงตารางหลัก
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">

      </div>

      <InstructionsSection />

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">ส่วนที่ 1 องค์ประกอบคุณภาพ ระดับหลักสูตร</h3>
        <button
          onClick={openAddForm}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          เพิ่มองค์ประกอบ
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <QualityComponentsTable
          items={items}
          loading={loading}
          error={error}
          onAddClick={openAddForm}
          onEditClick={handleEdit}
          onDeleteClick={handleDelete}
          onIndicatorClick={openIndicatorForm}
          indicators={indicators}
        />
      </div>

      {/* Modal แก้ไข */}
      {editItem && (
        <EditQualityForm
          item={editItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditItem(null)}
        />
      )}
    </div>
  );
}

// src/components/DefineComponentSection.jsx
import React, { useState, useEffect } from 'react';
import QualityComponentsTable from '../Quality/QualityComponentsTable';
import AddQualityForm from './AddQualityForm';
import EditQualityForm from './EditQualityForm'; // เพิ่ม modal แก้ไข
import IndicatorForm from '../IndicatorForm';
import IndicatorTable from '../IndicatorTable';
import InstructionsSection from '../InstructionsSection';
import { AUNQA_SUBITEMS } from '../../templates/aunqa';

function pad2(n) {
  try { return String(parseInt(String(n), 10)).padStart(2, '0'); } catch { return '00'; }
}

async function seedIndicatorsForMainCode(mainCode, componentDbId, ctx) {
  const subitems = AUNQA_SUBITEMS[mainCode] || [];
  if (subitems.length === 0) return;
  const mainNumMatch = mainCode.match(/AUN\.(\d+)/i);
  const mainPart = pad2(mainNumMatch ? mainNumMatch[1] : '0');
  for (let i = 0; i < subitems.length; i++) {
    const it = subitems[i];
    const sequence = `${mainPart}.${it.seq}`;
    await fetch('http://localhost:3001/api/indicators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        component_id: componentDbId,
        sequence,
        indicator_type: 'ผลลัพธ์',
        criteria_type: 'เชิงคุณภาพ',
        indicator_name: it.text,
        data_source: '',
        session_id: ctx.session_id || '',
        major_name: ctx.major_name || ''
      })
    }).catch(() => {});
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
  const [currentContext, setCurrentContext] = useState({ facultyName: '', majorName: '' });

  // ดึงข้อมูลจาก backend
  useEffect(() => {
    try {
      const sessionId = localStorage.getItem('assessment_session_id') || '';
      const sel = localStorage.getItem('selectedProgramContext');
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      if (sel) {
        try {
          const parsed = JSON.parse(sel);
          setCurrentContext({
            facultyName: parsed?.facultyName || '',
            majorName: parsed?.majorName || ''
          });
        } catch {}
      }
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      fetch(`http://localhost:3001/api/quality-components1?${qs}`)
        .then(res => res.json())
        .then(data => {
          setItems(data);
          setLoading(false);
        })
        .catch(() => {
          setError('ไม่สามารถโหลดข้อมูลได้');
          setLoading(false);
        });
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
      setLoading(false);
    }
  }, []);

  // ฟังก์ชันเพิ่มองค์ประกอบ
  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!componentId || !qualityName) return;

    const ctx = (() => {
      try {
        const sessionId = localStorage.getItem('assessment_session_id') || '';
        const sel = localStorage.getItem('selectedProgramContext');
        const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
        return { session_id: sessionId, major_name: major };
      } catch { return { session_id: '', major_name: '' }; }
    })();

    const newItem = { componentId, qualityName, ...ctx };
    const res = await fetch('http://localhost:3001/api/quality-components1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    if (res.ok) {
      const result = await res.json();
      setItems([...items, { id: result.id, componentId, qualityName }]);

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
        const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
        return new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      } catch { return ''; }
    })();

    const res = await fetch(`http://localhost:3001/api/quality-components1/${id}?${ctxParams}`, { method: 'DELETE' });
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
        const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
        return { session_id: sessionId, major_name: major };
      } catch { return { session_id: '', major_name: '' }; }
    })();

    const res = await fetch(`http://localhost:3001/api/quality-components1/${updatedItem.id}`, {
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
      const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
      const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      fetch(`http://localhost:3001/api/indicators-by-component/${selectedComponent.id}?${qs}`)
        .then(res => res.json())
        .then(async (data) => {
          setIndicators(prev => ({ ...prev, [selectedComponent.id]: data }));
          // ดึงประวัติการประเมินเพื่อทำเครื่องหมายสถานะหลังรีเฟรช
          try {
            const history = await fetch(`http://localhost:3001/api/evaluations/history?${qs}`).then(r=>r.json());
            const map = {};
            if (Array.isArray(history)) {
              history.forEach(row => {
                if (row.indicator_id && row.session_id == sessionId) {
                  map[row.indicator_id] = true;
                }
              });
            }
            setEvaluatedMap(map);
          } catch {}
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

  const newIndicator = {
    component_id: selectedComponent.id,
    sequence: indicatorSequence,
    indicator_type: indicatorType,
    criteria_type: criteriaType,
    indicator_name: indicatorName,
    data_source: dataSource
  };

  try {
    const ctx = (() => {
      try {
        const sessionId = localStorage.getItem('assessment_session_id') || '';
        const sel = localStorage.getItem('selectedProgramContext');
        const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
        return { session_id: sessionId, major_name: major };
      } catch { return { session_id: '', major_name: '' }; }
    })();

    // ถ้าเป็นการเพิ่ม "หัวข้อตัวบ่งชี้หลัก" เช่น AUN.1 ...
    const mainMatch = String(indicatorName).match(/^\s*AUN\.(\d+)\b/i);
    if (mainMatch) {
      const mainNum = mainMatch[1];
      const mainCode = `AUN.${mainNum}`;
      const mainSeq = pad2(mainNum); // เช่น "01"

      // 1) เพิ่มแถวหัวข้อตัวบ่งชี้หลักเป็นหัวตาราง
      await fetch('http://localhost:3001/api/indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component_id: selectedComponent.id,
          sequence: mainSeq,            // หัวข้อหลักใช้เลขสองหลัก
          indicator_type: newIndicator.indicator_type || 'ผลลัพธ์',
          criteria_type: newIndicator.criteria_type || 'เชิงคุณภาพ',
          indicator_name: indicatorName,
          data_source: newIndicator.data_source || '',
          ...ctx
        })
      }).catch(() => {});

      // 2) เพิ่มหัวข้อย่อยทั้งหมดตามเทมเพลต
      await seedIndicatorsForMainCode(mainCode, selectedComponent.id, ctx);

      // 3) รีเฟรชรายการตัวบ่งชี้
      const qsRef = new URLSearchParams({ session_id: ctx.session_id || '', major_name: ctx.major_name || '' }).toString();
      const refreshed = await fetch(`http://localhost:3001/api/indicators-by-component/${selectedComponent.id}?${qsRef}`).then(r=>r.json()).catch(()=>[]);
      setIndicators(prev => ({ ...prev, [selectedComponent.id]: Array.isArray(refreshed) ? refreshed : [] }));

      // reset ฟอร์ม
      setShowIndicatorForm(false);
      setIndicatorName('');
      setIndicatorType('');
      setCriteriaType('');
      setDataSource('');
      setIndicatorSequence('');
      return;
    }

    // เพิ่มตัวบ่งชี้ทั่วไป (ไม่ใช่หัวข้อหลัก)
    const res = await fetch('http://localhost:3001/api/indicators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newIndicator, ...ctx })
    });

    if (res.ok) {
      const result = await res.json();
      setIndicators(prev => ({
        ...prev,
        [selectedComponent.id]: [...(prev[selectedComponent.id] || []), {
          ...newIndicator,
          id: result.id
        }]
      }));
      // รีเซ็ตฟอร์ม
      setShowIndicatorForm(false);
      setIndicatorName('');
      setIndicatorType('');
      setCriteriaType('');
      setDataSource('');
      setIndicatorSequence('');
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
        const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
        return new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
      } catch { return ''; }
    })();
    const res = await fetch(`http://localhost:3001/api/indicators/${indicatorId}?${ctxParams}`, { method: 'DELETE' });
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
              const major = sel ? (JSON.parse(sel)?.majorName || '') : '';
              const qs = new URLSearchParams({ session_id: sessionId, major_name: major }).toString();
              const refreshed = await fetch(`http://localhost:3001/api/indicators-by-component/${selectedComponent.id}?${qs}`).then(r=>r.json()).catch(()=>[]);
              setIndicators(prev => ({ ...prev, [selectedComponent.id]: Array.isArray(refreshed) ? refreshed : [] }));
              // refresh evaluated map as well
              const history = await fetch(`http://localhost:3001/api/evaluations/history?${qs}`).then(r=>r.json()).catch(()=>[]);
              const map = {};
              if (Array.isArray(history)) {
                history.forEach(row => { if (row.indicator_id && row.session_id == sessionId) map[row.indicator_id] = true; });
              }
              setEvaluatedMap(map);
            } catch {}
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">การเพิ่มองค์ประกอบคุณภาพ</h2>
        <p className="text-gray-600">ทำตามขั้นตอนเพื่อเพิ่มองค์ประกอบคุณภาพใหม่</p>
        <div className="mt-2 text-sm text-gray-700">
          <span className="text-gray-500">กำลังทำงานใน:</span>{' '}
          {currentContext.majorName ? (
            <>
              <span className="font-medium">{currentContext.majorName}</span>
              {currentContext.facultyName ? (
                <span className="ml-1 text-gray-500">({currentContext.facultyName})</span>
              ) : null}
            </>
          ) : (
            <span className="italic text-gray-500">ยังไม่ได้เลือกสาขา</span>
          )}
        </div>
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

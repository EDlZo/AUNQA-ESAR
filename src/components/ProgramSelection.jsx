import React, { useEffect, useMemo, useState } from 'react';

const LEVELS = [
  { id: 'programs', label: 'ระดับหลักสูตร' }
];

const DEFAULT_FACULTIES = [

  'คณะวิศวกรรมศาสตร์',

].map((name, idx) => ({ id: `fac-${idx + 1}`, name }));

const DEFAULT_MAJORS_BY_FACULTY = {
  'คณะวิศวกรรมศาสตร์': [
    'วิศวกรรมคอมพิวเตอร์',
    'วิศวกรรมคอมพิวเตอร์ปัญญาประดิษฐ์ (AI)',
    
  ],
};

export default function ProgramSelection({ 
  storageKey = 'programSelectionV2', 
  onComplete,
  mode = 'manage', // 'manage' หรือ 'assess'
  buttonText = null // text สำหรับปุ่ม (ถ้าไม่ระบุจะใช้ default ตาม mode)
}) {
  const [step, setStep] = useState('level'); // level | faculty | major
  const [selectedLevel, setSelectedLevel] = useState('');
  const [faculties, setFaculties] = useState(DEFAULT_FACULTIES);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState('');

  const getMajorCategory = (majorName) => {
    const n = (majorName || '').toLowerCase();
    if (n.includes('ปัญญาประดิษฐ์') || n.includes('(ai') || n.includes(' ai') || n.includes('ai)') || n === 'ai') {
      return 'AI';
    }
    if (n.includes('คอมพิวเตอร์')) {
      return 'คอมพิวเตอร์';
    }
    return 'อื่นๆ';
  };

  // Load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStep(parsed.step || 'level');
        setSelectedLevel(parsed.selectedLevel || '');
        setFaculties(parsed.faculties?.length ? parsed.faculties : DEFAULT_FACULTIES);
        setSelectedFacultyId(parsed.selectedFacultyId || '');
        setSelectedMajorId(parsed.selectedMajorId || '');
      }
    } catch {}
  }, [storageKey]);

  // Save
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        step,
        selectedLevel,
        faculties,
        selectedFacultyId,
        selectedMajorId,
      }));
    } catch {}
  }, [step, selectedLevel, faculties, selectedFacultyId, selectedMajorId, storageKey]);

  const selectedFaculty = useMemo(
    () => faculties.find(f => f.id === selectedFacultyId) || null,
    [faculties, selectedFacultyId]
  );

  const majorsForSelectedFaculty = useMemo(() => {
    const name = selectedFaculty?.name;
    const majors = name ? (DEFAULT_MAJORS_BY_FACULTY[name] || []) : [];
    return majors.map((m, idx) => ({ id: `maj-${idx + 1}`, name: m, category: getMajorCategory(m) }));
  }, [selectedFaculty]);

  const selectedMajor = useMemo(
    () => majorsForSelectedFaculty.find(m => m.id === selectedMajorId) || null,
    [majorsForSelectedFaculty, selectedMajorId]
  );

  // กำหนด text ของปุ่มตาม mode
  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (mode) {
      case 'assess':
        return 'ประเมินผล';
      case 'manage':
      default:
        return 'เลือกสาขา';
    }
  };

  const onChooseLevel = (levelId) => {
    setSelectedLevel(levelId);
    if (levelId === 'programs') {
      setStep('faculty');
    } else {
      setStep('level');
    }
  };

  const onChooseFaculty = (facId) => {
    setSelectedFacultyId(facId);
    setSelectedMajorId('');
    setStep('major');
  };

  const onChooseMajor = (majId) => {
    setSelectedMajorId(majId);
  };

  const resetToLevel = () => {
    setStep('level');
    setSelectedFacultyId('');
    setSelectedMajorId('');
  };

  const backOne = () => {
    if (step === 'major') setStep('faculty');
    else if (step === 'faculty') setStep('level');
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <button className="hover:underline" onClick={resetToLevel}>เลือกระดับ</button>
        {step !== 'level' && <span>/</span>}
        {step !== 'level' && (
          <button className="hover:underline" onClick={() => setStep('faculty')}>คณะ</button>
        )}
        {step === 'major' && <span>/ สาขา</span>}
      </div>

      {/* Step: Level */}
      {step === 'level' && (
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">เลือกระดับ</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800">
            {LEVELS.map(item => (
              <li key={item.id}>
                <button
                  className="text-left hover:underline"
                  onClick={() => onChooseLevel(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Step: Faculty */}
      {step === 'faculty' && (
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">เลือกคณะ</h2>
            <button onClick={backOne} className="text-sm text-gray-600 hover:underline">ย้อนกลับ</button>
          </div>
          <ul className="list-disc pl-6 space-y-2 text-gray-800">
            {faculties.map(f => (
              <li key={f.id}>
                <button className="text-left hover:underline" onClick={() => onChooseFaculty(f.id)}>
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Step: Major */}
      {step === 'major' && (
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">เลือกสาขา</h2>
            <button onClick={backOne} className="text-sm text-gray-600 hover:underline">ย้อนกลับ</button>
          </div>

          {majorsForSelectedFaculty.length === 0 ? (
            <p className="text-sm text-gray-600">ยังไม่มีรายการสาขาสำหรับ "{selectedFaculty?.name}"</p>
          ) : (
            <ul className="list-disc pl-6 space-y-2 text-gray-800">
              {majorsForSelectedFaculty.map(m => (
                <li key={m.id}>
                  <button className="text-left hover:underline" onClick={() => onChooseMajor(m.id)}>
                    {m.name}
                  </button>
                  <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-700 align-middle">
                    {m.category}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Summary */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">ผลการเลือก</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <div>
            <span className="text-gray-500">ระดับ:</span>{' '}
            {LEVELS.find(l => l.id === selectedLevel)?.label || '-'}
          </div>
          <div>
            <span className="text-gray-500">คณะ:</span>{' '}
            {selectedFaculty?.name || '-'}
          </div>
          <div>
            <span className="text-gray-500">สาขา:</span>{' '}
            {selectedMajor?.name || '-'}
          </div>
          <div>
            <span className="text-gray-500">กลุ่ม:</span>{' '}
            {selectedMajor?.category || '-'}
          </div>
        </div>
        <div className="mt-4">
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedLevel === 'programs' && selectedFacultyId && selectedMajorId
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!(selectedLevel === 'programs' && selectedFacultyId && selectedMajorId)}
            onClick={() => {
              console.log('🔥 ProgramSelection button clicked');
              console.log('Selected data:', {
                levelId: selectedLevel,
                facultyId: selectedFacultyId,
                majorId: selectedMajorId,
                facultyName: selectedFaculty?.name,
                majorName: majorsForSelectedFaculty.find(m => m.id === selectedMajorId)?.name,
              });
              
              if (onComplete) {
                console.log('✅ Calling onComplete...');
                onComplete({
                  levelId: selectedLevel,
                  facultyId: selectedFacultyId,
                  majorId: selectedMajorId,
                  facultyName: selectedFaculty?.name,
                  majorName: majorsForSelectedFaculty.find(m => m.id === selectedMajorId)?.name,
                });
              } else {
                console.log('❌ No onComplete function provided');
              }
            }}
          >
            {getButtonText()}
          </button>
        </div>
      </section>
    </div>
  );
}



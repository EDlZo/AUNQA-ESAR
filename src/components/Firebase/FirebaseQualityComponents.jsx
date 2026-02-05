import React, { useState } from 'react';
import { useQualityComponents } from '../../hooks/useFirebase.js';
import { useModal } from '../../context/ModalContext.js';

const FirebaseQualityComponents = ({ majorName, sessionId }) => {
  const { showAlert, showConfirm } = useModal();
  const {
    components,
    loading,
    error,
    addComponent,
    updateComponent,
    deleteComponent
  } = useQualityComponents(majorName);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [formData, setFormData] = useState({
    component_id: '',
    quality_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;
      if (editingComponent) {
        result = await updateComponent(editingComponent.id, formData);
      } else {
        result = await addComponent({
          ...formData,
          session_id: sessionId
        });
      }

      if (result.success) {
        setFormData({ component_id: '', quality_name: '' });
        setShowAddForm(false);
        setEditingComponent(null);
        showAlert({ title: 'สำเร็จ', message: editingComponent ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ', type: 'success' });
      } else {
        showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาด: ' + result.error, type: 'error' });
      }
    } catch (err) {
      showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาด: ' + err.message, type: 'error' });
    }
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setFormData({
      component_id: component.component_id || '',
      quality_name: component.quality_name || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: 'ยืนยันการลบ',
      message: 'คุณต้องการลบองค์ประกอบนี้หรือไม่?',
      type: 'error',
      onConfirm: async () => {
        const result = await deleteComponent(id);
        if (result.success) {
          showAlert({ title: 'สำเร็จ', message: 'ลบข้อมูลสำเร็จ', type: 'success' });
        } else {
          showAlert({ title: 'ข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการลบ: ' + result.error, type: 'error' });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({ component_id: '', quality_name: '' });
    setShowAddForm(false);
    setEditingComponent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            องค์ประกอบคุณภาพ (Firebase)
          </h2>
          <p className="text-sm text-gray-600">
            สาขา: {majorName} | จำนวน: {components.length} รายการ
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          เพิ่มองค์ประกอบ
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            {editingComponent ? 'แก้ไของค์ประกอบ' : 'เพิ่มองค์ประกอบใหม่'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสองค์ประกอบ
              </label>
              <input
                type="text"
                value={formData.component_id}
                onChange={(e) => setFormData({ ...formData, component_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น 1.1, 2.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อองค์ประกอบคุณภาพ *
              </label>
              <input
                type="text"
                value={formData.quality_name}
                onChange={(e) => setFormData({ ...formData, quality_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ระบุชื่อองค์ประกอบคุณภาพ"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingComponent ? 'บันทึกการแก้ไข' : 'เพิ่มองค์ประกอบ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Components List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {components.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>ยังไม่มีองค์ประกอบคุณภาพ</p>
            <p className="text-sm">คลิก "เพิ่มองค์ประกอบ" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    รหัส
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    ชื่อองค์ประกอบ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    วันที่สร้าง
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {components.map((component) => (
                  <tr key={component.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {component.component_id || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {component.quality_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {component.created_at ?
                        new Date(component.created_at.seconds * 1000).toLocaleDateString('th-TH') :
                        '-'
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(component)}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(component.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Firebase Info */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">
          🔥 Firebase Features Active:
        </h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Real-time data synchronization</li>
          <li>• Cloud-based storage (no local database needed)</li>
          <li>• Automatic backups and scaling</li>
          <li>• Cross-device data consistency</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseQualityComponents;
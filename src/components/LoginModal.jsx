// src/components/LoginModal.jsx
import React, { useState } from 'react';

export default function LoginModal({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reporter');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login with:', { username, password, role });

      // เรียก API เพื่อตรวจสอบการเข้าสู่ระบบ
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          role: role
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // แปลง role_id เป็น role string
        const roleMapping = {
          1: 'system_admin',
          2: 'sar_manager',
          3: 'reporter',
          4: 'evaluator',
          5: 'external_evaluator',
          6: 'executive'
        };

        const userData = {
          ...data.user,
          role: roleMapping[data.user.role_id] || 'unknown'
        };

        console.log('Login successful, user data:', userData);
        onLogin(userData);
      } else {
        setError(data.message || 'ชื่อผู้ใช้ รหัสผ่าน หรือ Role ไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-12">
        <h2 className="text-3xl font-bold mb-8 text-center">เข้าสู่ระบบ</h2>
        <form onSubmit={handleLogin}>
          <label className="block text-xl mb-4">ชื่อผู้ใช้</label>
          <input className="w-full p-4 mb-6 border rounded-xl text-lg" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
          <label className="block text-xl mb-4">รหัสผ่าน</label>
          <input className="w-full p-4 mb-6 border rounded-xl text-lg" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          <label className="block text-xl mb-4">บทบาท</label>
          <select className="w-full p-4 mb-8 border rounded-xl text-lg" value={role} onChange={e => setRole(e.target.value)} required>
            <option value="system_admin">System Admin</option>
            <option value="sar_manager">SAR Manager</option>
            <option value="reporter">Reporter</option>
            <option value="evaluator">Evaluator</option>
            <option value="external_evaluator">External Evaluator</option>
            <option value="executive">Executive</option>
          </select>
          <button type="submit" className="w-full py-4 text-2xl bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">เข้าสู่ระบบ</button>
        </form>
        {error && <div className="text-red-500 text-center mt-2">{error}</div>}
      </div>
    </div>
  );
}
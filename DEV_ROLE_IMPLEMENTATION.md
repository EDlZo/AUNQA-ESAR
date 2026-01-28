# 🚀 การเพิ่ม Role Developer ในระบบ AUNQA

## 📋 สรุปการเปลี่ยนแปลง

### ✅ สิ่งที่ได้เพิ่มแล้ว:

1. **Role Dev ในฐานข้อมูล** ✅
   - Role ID: 5
   - Role Name: 'Dev'
   - ข้อมูลผู้ใช้: `dev@example.com` / `devpass`

2. **สิทธิ์การเข้าถึง** ✅
   - อ่าน (read)
   - เขียน (write)
   - ลบ (delete)
   - จัดการระบบ (admin)

3. **การแสดงผลในแอปพลิเคชัน** ✅
   - เพิ่มใน `rolePermissions` ใน `App.jsx`
   - สี: `bg-green-500`
   - ชื่อ: 'Developer'

4. **การเข้าถึงหน้า Dashboard** ✅
   - แก้ไขเงื่อนไขใน `Header.jsx`
   - Role Dev สามารถเข้าถึงปุ่ม Dashboard ได้

5. **การแสดงเนื้อหาใน Dashboard** ✅
   - แก้ไข `DashboardContent.jsx`
   - Role Dev จะเห็นทุกส่วน:
     - DefineComponentSection
     - ManageComponentSection
     - ReportSection
     - ResultsContent

## 🔧 ไฟล์ที่แก้ไข:

### 1. `src/App.jsx`
```javascript
const rolePermissions = {
  // ... existing roles ...
  dev: { name: 'Developer', color: 'bg-green-500', permissions: ['read', 'write', 'delete', 'admin'] }
};
```

### 2. `src/components/DashboardContent.jsx`
```javascript
case 'dev': // role_id: 5 - สามารถดูทุกหน้าได้
  return (
    <>
      <DefineComponentSection />
      <ManageComponentSection />
      <ReportSection />
      <ResultsContent />
    </>
  );
```

### 3. `src/components/Header.jsx`
```javascript
{currentUser && (currentUser.role === 'admin' || currentUser.role === 'dev') && (
  // แสดงปุ่ม Dashboard
)}
```

## 🧪 วิธีการทดสอบ:

### 1. รันคำสั่ง SQL:
```sql
-- ใช้ไฟล์ add_dev_user.sql หรือ
INSERT INTO users (name, email, role_id, department, password) VALUES
('Developer User', 'dev@example.com', 5, 'Development Team', 'devpass');
```

### 2. เข้าสู่ระบบ:
- **Email:** `dev@example.com`
- **Password:** `devpass`
- **Role:** `Developer`

### 3. ผลลัพธ์ที่คาดหวัง:
- ✅ เข้าสู่ระบบสำเร็จ
- ✅ เห็นปุ่ม Dashboard ในเมนู
- ✅ เข้าถึงหน้า Dashboard ได้
- ✅ เห็นทุกส่วนในหน้า Dashboard

## 🎯 สิทธิ์ของ Role Developer:

- **อ่านข้อมูล:** ✅ ทุกหน้า
- **เขียนข้อมูล:** ✅ ทุกหน้า
- **ลบข้อมูล:** ✅ ทุกหน้า
- **จัดการระบบ:** ✅ ทุกหน้า
- **เข้าถึง Dashboard:** ✅
- **เข้าถึงทุกส่วน:** ✅

## 📝 หมายเหตุ:

- Role Dev มีสิทธิ์เทียบเท่า Admin
- สามารถเข้าถึงและแก้ไขได้ทุกหน้า
- เหมาะสำหรับการพัฒนาและทดสอบระบบ
- ข้อมูลผู้ใช้มีอยู่ในฐานข้อมูลแล้ว

## 🔄 ขั้นตอนการใช้งาน:

1. รันคำสั่ง SQL ใน `add_dev_user.sql`
2. รีสตาร์ท server (ถ้าจำเป็น)
3. เข้าสู่ระบบด้วย `dev@example.com` / `devpass`
4. เลือก Role: `Developer`
5. ทดสอบการเข้าถึงทุกหน้า 
# 🔧 แก้ไขปัญหาการเข้าสู่ระบบ

## ปัญหาที่พบ
- เกิดข้อผิดพลาด 401 Unauthorized เมื่อพยายามเข้าสู่ระบบ
- ไม่สามารถเข้าสู่ระบบตาม role ได้

## วิธีแก้ไข

### 1. ตรวจสอบฐานข้อมูล
รันคำสั่ง SQL ในไฟล์ `test_users.sql` ใน phpMyAdmin:

```sql
USE project_aunqa;

-- ลบข้อมูลผู้ใช้เดิม (ถ้ามี)
DELETE FROM users WHERE email IN ('admin@example.com', 'staff@example.com', 'evaluator@example.com', 'external@example.com');

-- เพิ่มข้อมูลผู้ใช้ใหม่
INSERT INTO users (name, email, role_id, department, password) VALUES
('Admin User', 'admin@example.com', 1, 'IT Department', 'adminpass'),
('Staff User', 'staff@example.com', 2, 'Quality Assurance', 'staffpass'),
('Evaluator User', 'evaluator@example.com', 3, 'Academic Affairs', 'evaluatorpass'),
('External Evaluator', 'external@example.com', 4, 'External', 'externalpass');
```

### 2. ตรวจสอบการเชื่อมต่อฐานข้อมูล
ตรวจสอบไฟล์ `db.cjs` ว่าการตั้งค่าถูกต้อง:

```javascript
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // ถ้าใช้ XAMPP ปกติจะว่าง
  database: 'project_aunqa'
});
```

### 3. รัน Server
เปิด Terminal และรันคำสั่ง:

```bash
node server.cjs
```

ควรเห็นข้อความ: "Connected to MySQL!" และ "Server running on port 3001"

### 4. ทดสอบการเข้าสู่ระบบ

#### ข้อมูลผู้ใช้ทดสอบ:

**Admin:**
- Email: `admin@example.com`
- Password: `adminpass`
- Role: `Admin`

**Staff:**
- Email: `staff@example.com`
- Password: `staffpass`
- Role: `Staff`

**Evaluator:**
- Email: `evaluator@example.com`
- Password: `evaluatorpass`
- Role: `Evaluator`

**External Evaluator:**
- Email: `external@example.com`
- Password: `externalpass`
- Role: `External Evaluator`



### 5. ตรวจสอบ Console
เปิด Developer Console ในเบราว์เซอร์เพื่อดู log การ debug ที่เพิ่มเข้าไป

## การทำงานของแต่ละ Role

1. **Admin** → หน้า DefineComponentSection (กำหนดองค์ประกอบคุณภาพ)
2. **Staff** → หน้า ManageComponentSection (จัดการองค์ประกอบ)
3. **Evaluator** → หน้า ReportSection + ResultsContent (รายงาน + ผลลัพธ์)
4. **External Evaluator** → หน้า ResultsContent (ดูผลลัพธ์เท่านั้น)

## หากยังมีปัญหา

1. ตรวจสอบว่า XAMPP/MySQL กำลังรันอยู่
2. ตรวจสอบว่า database `project_aunqa` มีอยู่
3. ตรวจสอบว่า server รันที่ port 3001
4. ตรวจสอบ console ในเบราว์เซอร์สำหรับข้อผิดพลาด 
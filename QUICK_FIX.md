# 🚀 แก้ไขปัญหาการเข้าสู่ระบบ - วิธีรวดเร็ว

## ✅ Server กำลังรันแล้ว (Port 3001)

## 🔧 ขั้นตอนการแก้ไข:

### 1. รันคำสั่ง SQL ใน phpMyAdmin:
```sql
USE project_aunqa;

-- เพิ่มข้อมูลผู้ใช้ทดสอบ
INSERT INTO users (name, email, role_id, department, password) VALUES
('Admin User', 'admin@example.com', 1, 'IT Department', 'adminpass'),
('Staff User', 'staff@example.com', 2, 'Quality Assurance', 'staffpass'),
('Evaluator User', 'evaluator@example.com', 3, 'Academic Affairs', 'evaluatorpass'),
('External Evaluator', 'external@example.com', 4, 'External', 'externalpass'),
('Developer User', 'dev@example.com', 5, 'Development Team', 'devpass');
```

### 2. ทดสอบการเข้าสู่ระบบ:
- **Email:** `dev@example.com`
- **Password:** `devpass`
- **Role:** `Developer`

### 3. ตรวจสอบ Console:
เปิด Developer Console ในเบราว์เซอร์เพื่อดู log การ debug

## 🎯 ผลลัพธ์ที่คาดหวัง:
- เข้าสู่ระบบสำเร็จ
- ถูกนำไปยังหน้า Dashboard ที่แสดงทุกส่วน (สำหรับ Developer)
- ไม่มีข้อผิดพลาด 401 Unauthorized

## 📝 ข้อมูลผู้ใช้ทั้งหมด:
- Admin: `admin@example.com` / `adminpass`
- Staff: `staff@example.com` / `staffpass`
- Evaluator: `evaluator@example.com` / `evaluatorpass`
- External: `external@example.com` / `externalpass`
- Developer: `dev@example.com` / `devpass` 
# 🔧 คู่มือการติดตั้ง AUNQA-ESAR System

## 📋 ข้อกำหนดระบบ

- Node.js 18+ 
- npm หรือ yarn
- Firebase Account
- เบราว์เซอร์ที่รองรับ ES6+

## 🚀 การติดตั้งแบบละเอียด

### ขั้นตอนที่ 1: Clone และติดตั้ง Dependencies

```bash
# Clone repository
git clone <repository-url>
cd AUNQA-ESAR

# ติดตั้ง dependencies
npm install
```

### ขั้นตอนที่ 2: ตั้งค่า Firebase Project

#### 2.1 สร้าง Firebase Project
1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. คลิก "Create a project"
3. ตั้งชื่อโปรเจค เช่น "aunqa-esar"
4. เปิดใช้งาน Google Analytics (ถ้าต้องการ)

#### 2.2 เปิดใช้งาน Firestore Database
1. ไปที่ "Firestore Database" ในเมนูซ้าย
2. คลิก "Create database"
3. เลือก "Start in test mode" (สำหรับ development)
4. เลือก location ที่ใกล้ที่สุด

#### 2.3 ตั้งค่า Authentication (ถ้าต้องการ)
1. ไปที่ "Authentication" ในเมนูซ้าย
2. คลิก "Get started"
3. เปิดใช้งาน "Email/Password" provider

#### 2.4 ดาวน์โหลด Service Account Key
1. ไปที่ "Project Settings" (เฟืองใน sidebar)
2. คลิกแท็บ "Service accounts"
3. คลิก "Generate new private key"
4. บันทึกไฟล์เป็น `firebase-service-account.json` ในโฟลเดอร์ root

#### 2.5 ดาวน์โหลด Web App Config
1. ไปที่ "Project Settings" > แท็บ "General"
2. ในส่วน "Your apps" คลิก "Add app" > เลือก Web
3. ตั้งชื่อ app เช่น "AUNQA-ESAR-Web"
4. คัดลอกค่า config ที่ได้

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

#### 3.1 สร้างไฟล์ .env
```bash
cp .env.example .env
```

#### 3.2 แก้ไขค่าใน .env
เปิดไฟล์ `.env` และแก้ไขค่าต่อไปนี้:

```env
# Firebase Web App Config (จาก Project Settings)
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...

# Firebase Admin Config
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### ขั้นตอนที่ 4: Import ข้อมูลเริ่มต้น (ถ้ามี)

ถ้ามีข้อมูลจาก MySQL อยู่แล้ว:

```bash
# ตรวจสอบการเชื่อมต่อ Firebase
npm run check-firebase

# Import ข้อมูลจาก MySQL (ถ้าต้องการ)
npm run migrate
```

### ขั้นตอนที่ 5: เริ่มใช้งาน

#### 5.1 เริ่ม Backend Server
```bash
npm run server-firebase
```
✅ Server จะทำงานที่ `http://localhost:3002`

#### 5.2 เริ่ม Frontend Server (Terminal ใหม่)
```bash
npm run dev
```
✅ Frontend จะทำงานที่ `http://localhost:5173`

#### 5.3 ทดสอบระบบ
1. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`
2. ลอง Login ด้วย:
   - Username: `dev@test.com`
   - Password: `adminpass`
   - Role: `System Admin`

## 🔍 การตรวจสอบการติดตั้ง

### ตรวจสอบ Firebase Connection
```bash
curl http://localhost:3002/api/ping
# ควรได้: {"status":"ok","firebase":"connected"}
```

### ตรวจสอบ Login API
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username": "dev@test.com", "password": "adminpass", "role": "system_admin"}' \
  http://localhost:3002/api/login
# ควรได้: {"success":true,"user":{...}}
```

### ตรวจสอบ Data API
```bash
curl http://localhost:3002/api/quality-components
# ควรได้: [{"id":1,"component_id":"1",...}]
```

## 🚨 การแก้ไขปัญหาที่พบบ่อย

### ปัญหา: Firebase Admin initialization failed
**สาเหตุ**: Service account key ไม่ถูกต้อง
**แก้ไข**: 
1. ตรวจสอบไฟล์ `firebase-service-account.json`
2. ตรวจสอบ `FIREBASE_PROJECT_ID` ใน `.env`

### ปัญหา: CORS Error
**สาเหตุ**: Frontend และ Backend ทำงานคนละ port
**แก้ไข**: ตรวจสอบ `VITE_API_BASE_URL` ใน `.env`

### ปัญหา: Login ไม่ได้
**สาเหตุ**: ไม่มีข้อมูล users ใน Firestore
**แก้ไข**: 
```bash
npm run create-users  # สร้าง sample users
```

### ปัญหา: ข้อมูลไม่แสดง
**สาเหตุ**: Collections ใน Firestore ว่าง
**แก้ไข**: Import ข้อมูลจาก MySQL หรือสร้างข้อมูลทดสอบ

## 📁 โครงสร้างไฟล์สำคัญ

```
├── .env                    # Environment variables (ห้าม commit)
├── .env.example           # ตัวอย่าง environment variables
├── firebase-service-account.json  # Firebase service key (ห้าม commit)
├── server-firebase.cjs    # Backend server
├── src/
│   ├── firebase/
│   │   ├── config.js      # Firebase client config
│   │   ├── auth.js        # Authentication functions
│   │   └── firestore.js   # Firestore functions
│   └── config/
│       └── api.js         # API endpoints configuration
└── uploads/               # ไฟล์ที่อัปโหลด
```

## 🔐 Security Checklist

- [ ] ไฟล์ `.env` ถูก ignore ใน git
- [ ] ไฟล์ `firebase-service-account.json` ถูก ignore ใน git
- [ ] Firebase Security Rules ถูกตั้งค่าแล้ว
- [ ] CORS ถูกจำกัดเฉพาะ domain ที่ต้องการ
- [ ] Environment variables ไม่มีค่า sensitive ใน code

## 📞 ติดต่อสอบถาม

หากมีปัญหาในการติดตั้ง กรุณาตรวจสอบ:
1. Console ของเบราว์เซอร์ (F12)
2. Terminal ที่รัน server
3. Firebase Console > Firestore > Data

---

✅ **เมื่อติดตั้งเสร็จแล้ว ระบบจะพร้อมใช้งานโดยไม่ต้องพึ่ง XAMPP หรือ MySQL อีกต่อไป!**
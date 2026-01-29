# 🔧 การตั้งค่า Environment Variables ใน Vercel

## 🚨 ปัญหาที่พบ
```
"ทำไมบังยิง api เป็น localhost อยู่"
```

## ✅ การแก้ไข

### 1. ตั้งค่า Environment Variables ใน Vercel Dashboard

ไปที่ **Vercel Dashboard** > **Project** > **Settings** > **Environment Variables**

เพิ่มตัวแปรต่อไปนี้:

#### 🌐 API Configuration
```
VITE_API_BASE_URL=https://aunqa-esar.vercel.app
```

#### 🔥 Firebase Configuration
```
FIREBASE_PROJECT_ID=aunqa-esar
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aunqa-esar.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCTcG+6/P77Xeba\nv228dKGAvNbURxjkUMAE3coUiLKJA7/W4FuORc6dIZCwAUzgTgvGiMQ0ApMps2FI\ne+kiKF7+C/mTO3xCYonqcjG09Ir6hXm3+mJquyyHqILKZBf/T9luCIgAd9hFwn89\niQDNsMGO2/Wet3e+VLSKKm49O/IS0BDUEd5ynRqJx4Yfnlj6F2EEScw3sQh7yLuB\n6Osr5Am+cgCtednSF9pNdpxtcMpOKJ4vAyIzeeFQTnyL4pIuZpj2yHa6ctSdTnXh\n9byl+2hMEh/5QryrFZ4YwbRmRIHzHiFFyX8X4vTZqLBIno+NcfJF+N7rBSvrWzzY\nilq2Bls9AgMBAAECggEAHDYbavAV6gshrSGL4c9/R57ajGu+O5Gn7EZz8FHnt4fc\nIUV0v1hkHHTbtpHJH/JPFoH86ObFOel05+WtyjdnVbz82Es9j4ZDVXTcRf+0yBLa\nI3XpdvqxnpOD0y4r2VJyDDfdrhlAbLi2mBOq77CumKNF8ESyyNx0XyuXRGg//ZFA\nBDZjlOY4K3y7BVMKvz9n3grgirYvL8AKKHmU/bbwGuEgCjVvZWvjuDJejYbShusE\nKCRxqikUfYJj5qsYwdT+220TfVtzktyv0QP2ze3qGLZvFcO5fd03R7nq1iSd5szI\nc3EbfL+qGzvtIKO9QDHDTuGPCi7KTjZWSREs8E26AQKBgQDIibyqUBV1GF8H5qBq\nA9jYwI0+VAJi9qZ9VMgiXquUVW/JrvNMtNDkumZyf4JXS8a4xLlKlNtgvJjDd2XR\nUKCRQQCNjeiSgM29opSC0+9eYHzub/VjsTqHwFffgnErMnlxgFJnDS+CLYB2mW/G\nFgxoepREhMPdMSR8795Q26/AoQKBgQC8N0Ha0JblBTEorxwlTMIvJTjJOQqjHMot\nBHejqUrLcPxwafVUTaI6+4sq1G0E5dod28ghoYC5cLN9SMTzjrExbddI6PLDKp/b\n0OZqNJgqHy4k9PPdZNrmjkigOAbdVoOMaJZkHByQ6J/t+aNGfLl+WWE3RWQVi7yo\n5K6HaevpHQKBgDizSRbWodqD04rGWKDhCZTvjIAM/MfCeXyCVjvxjI3aQktCHiSY\nE2A4m/LPvqi0EjH33XQK9qQ5bvAFeFJge6XWPTPI5fNWW9W8fEUpa0rB+VDpcvaH\nC8eKSM43cYwHL3M6FxJwFfi2qNXfuEzHuyZnUji1WTPXSzvQDonKM71BAoGAZ2Zk\nA3Y8r6zeiN9KsyMsOwJT5Bg2Q835NCoUIBFNSd7UkF1lrd7IlWbD2c/B5MLxxR2N\nIQy8zyOfN+DWcoedyO3zK9buJ1IvaG+nZglm3x0qGJuJrcNOjwLz2zFsdASnWGfM\n10qqVuG1muNeU8cJkORBiD/S8BNInfCkATirpfECgYARFlyBQw89o/ZPKywjabFG\nUA6MzqU9md1XKkaOOFT0YJDnxTwYYHemwOYQ8EWKzQAtQMRB+rTtGP35fowjbGg6\n/ZCtwzFIGcgjVBUs2SBJ+4UbAqW2rpi499lI58Rbi+sZTwMHqMn/kSUjpbNcwN26\nZ2TklwzQiPI4EcQ2sW/ZbQ==\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=aunqa-esar.appspot.com
```

#### 🔐 Frontend Firebase Config
```
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=aunqa-esar.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aunqa-esar
VITE_FIREBASE_STORAGE_BUCKET=aunqa-esar.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxxxxxxx
```

#### 🔑 Security
```
JWT_SECRET=skJ8h7wLxT0pV2qRzF5mA9nB3yC6dE1
CORS_ORIGIN=https://aunqa-esar.vercel.app
NODE_ENV=production
```

### 2. สำคัญ! ตั้งค่าให้ทุก Environment

ใน Vercel ต้องเลือก **Environment** ให้ครบ:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 3. Deploy ใหม่

หลังจากตั้งค่า environment variables แล้ว:

```bash
# Commit code changes
git add .
git commit -m "Fix hardcoded API URLs to use environment variables"
git push

# Deploy
vercel --prod
```

## 🔍 การตรวจสอบ

### ตรวจสอบใน Browser Console:
```javascript
// เปิด Developer Tools (F12) และพิมพ์:
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
```

### ตรวจสอบ API Calls:
- เปิด **Network Tab** ใน Developer Tools
- Refresh หน้าเว็บ
- ดู API calls ควรเป็น `https://aunqa-esar.vercel.app/api/...`
- **ไม่ควรเป็น** `http://localhost:3002/api/...`

## 🚨 Troubleshooting

### ปัญหา: ยังเป็น localhost อยู่
```bash
# ตรวจสอบว่า environment variables ถูกตั้งค่าแล้ว
# ใน Vercel Dashboard > Settings > Environment Variables

# ลอง redeploy
vercel --prod --force
```

### ปัญหา: API calls ล้มเหลว
```bash
# ตรวจสอบ CORS settings
# ตรวจสอบ Firebase credentials
# ดู Vercel Function logs
```

### ปัญหา: Build ล้มเหลว
```bash
# ตรวจสอบ syntax errors จากการแก้ไข URLs
# ดู build logs ใน Vercel Dashboard
```

## 📝 สิ่งที่เปลี่ยนไป

### ✅ ก่อนแก้ไข:
```javascript
// Hardcoded URLs
fetch('http://localhost:3002/api/login')
fetch('http://localhost:3002/api/quality-components')
```

### ✅ หลังแก้ไข:
```javascript
// Dynamic URLs from environment
import { BASE_URL } from '../config/api.js';
fetch(`${BASE_URL}/api/login`)
fetch(`${BASE_URL}/api/quality-components`)
```

### 🔧 Environment Variables:
```bash
# Development
VITE_API_BASE_URL=http://localhost:3002

# Production  
VITE_API_BASE_URL=https://aunqa-esar.vercel.app
```

## 🎯 ผลลัพธ์

หลังจากแก้ไขแล้ว:
- ✅ Development: ใช้ `http://localhost:3002`
- ✅ Production: ใช้ `https://aunqa-esar.vercel.app`
- ✅ ไม่มี hardcoded URLs อีกต่อไป
- ✅ พี่เขาจะเห็น API calls ไปที่ domain จริง

---

**🚀 ตอนนี้ระบบจะใช้ API URL ที่ถูกต้องตาม environment แล้ว!**
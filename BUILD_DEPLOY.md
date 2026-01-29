# 🚀 คำแนะนำการ Build และ Deploy

## 🔧 การแก้ไขปัญหา Static Assets

### ปัญหาที่พบ:
```
GET https://aunqa-esar.vercel.app/src/image/rmutsv-logo.png 404 (Not Found)
```

### ✅ การแก้ไข:
1. **ย้ายไฟล์ logo ไป public directory**:
   ```bash
   cp src/image/rmutsv-logo.png public/
   ```

2. **อัปเดต path ใน Header.jsx**:
   ```jsx
   // เปลี่ยนจาก
   src="/src/image/rmutsv-logo.png"
   
   // เป็น
   src="/rmutsv-logo.png"
   ```

3. **อัปเดต vercel.json** เพื่อ handle static files:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server-firebase.cjs"
       },
       {
         "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
         "dest": "/dist/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/index.html"
       }
     ]
   }
   ```

## 📁 โครงสร้างไฟล์ที่ถูกต้อง

```
public/
├── rmutsv-logo.png     ✅ ไฟล์ static ต้องอยู่ใน public/
├── vite.svg
└── index.html

src/
├── image/              ❌ ไม่ควรใช้สำหรับ static assets
└── components/
```

## 🔄 ขั้นตอนการ Deploy ใหม่

### 1. Build และทดสอบ Local
```bash
# Build project
npm run build

# ทดสอบ production build
npm run preview

# ตรวจสอบว่า logo แสดงได้
# เปิด http://localhost:4173
```

### 2. Deploy ไป Vercel
```bash
# Commit changes
git add .
git commit -m "Fix static assets path for production"
git push

# Deploy
vercel --prod
```

### 3. ตรวจสอบหลัง Deploy
- ✅ Logo แสดงได้: `https://your-app.vercel.app/rmutsv-logo.png`
- ✅ API ทำงาน: `https://your-app.vercel.app/api/ping`
- ✅ Frontend load ได้: `https://your-app.vercel.app`

## 🛠️ การแก้ไขปัญหาอื่นๆ

### ปัญหา: API calls ล้มเหลว
```bash
# ตรวจสอบ environment variables ใน Vercel
# Dashboard > Settings > Environment Variables
```

### ปัญหา: Build ล้มเหลว
```bash
# ลบ cache และ build ใหม่
rm -rf node_modules dist .vite
npm install --legacy-peer-deps
npm run build
```

### ปัญหา: Firebase connection
```bash
# ตรวจสอบ FIREBASE_PRIVATE_KEY format
# ต้องมี \\n ใน environment variable
```

## 📝 Best Practices สำหรับ Static Assets

### ✅ ทำ:
- ใส่ไฟล์ static ใน `public/` directory
- ใช้ absolute path จาก root: `/filename.png`
- ใช้ Vite's asset handling สำหรับ dynamic imports

### ❌ ไม่ทำ:
- ใช้ `/src/` path ใน production
- ใส่ assets ใน `src/` แล้วใช้ absolute path
- Hardcode localhost URLs

### 🔧 สำหรับ Dynamic Assets:
```jsx
// ใช้ import สำหรับ assets ที่ต้อง process
import logo from '../assets/logo.png'

// หรือใช้ dynamic import
const logoUrl = new URL('../assets/logo.png', import.meta.url).href
```

## 🎯 สรุป

การแก้ไขครั้งนี้:
1. ✅ ย้าย `rmutsv-logo.png` ไป `public/`
2. ✅ อัปเดต path ใน `Header.jsx`
3. ✅ ปรับ `vercel.json` ให้ handle static files
4. ✅ อัปเดต `vite.config.js` ให้ proxy ไป Firebase server

ตอนนี้ระบบควร deploy ได้สำเร็จและ logo แสดงได้ถูกต้องแล้ว!
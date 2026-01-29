# 🚀 คู่มือการ Deploy AUNQA-ESAR System

## 📋 ข้อกำหนดสำหรับ Production

- Node.js 18+ 
- Firebase Project (Prion)
- Domain name (ถ้าต้องการ)
- SSL Certificate (สำหรับ HTTPS)

## 🔧 การเตรียมความพร้อม

### 1. ตั้งค่า Firebase Production Project

#### สร้าง Firebase Project ใหม่สำหรับ Production
```bash
# ไปที่ Firebase Console
# สร้าง project ใหม่ เช่น "aunqa-esar-prod"
# เปิดใช้งาน Firestore Database
# ดาวน์โหลด Service Account Key ใหม่
```

#### ตั้งค่า Environment Variables สำหรับ Production
```bash
# Copy ไฟล์ production template
cp oduction .env

# แก้ไขค่าใน .env ให้ตรงกับ production
```

### 2. แก้ไข .env สำหรับ Production

```env
# Application Environment
NODE_ENV=production
PORT=3002

# API Configuration (Production)
VITE_API_BASE_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com

# Firebase Configuration (Production)
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-production-project.iam.gserviceaccount.com
FIRECTION_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-production-project.appspot.com

# Firebase Web App Config (Production)
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-production-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-production-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-production-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-production-sender-id
VITE_FIREBASE_APP_ID=your-production-app-id

# JWT Configuration (Production)
JWTSECRET=your-super-strong-production-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d

# CORS Configuration (Production)
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
CORS_CREDENTIALS=true

# Production Settings
DEBUG=false
LOG_LEVEL=warn
```

## 🌐 การ Deploy บน Vercel

### 1. เตรียม Project สำหรับ Vercel

สร้างไฟล์ `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server-firebase.cjs",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "usecel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server-firebase.cjs"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Deploy ขั้นตอน

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. ตั้งค่า Environment Variables ใน Vercel Dashboard
# ไปที่ Vercel Dashboard > Project > Settings > Environment Variables
# เพิ่มตัวแปรทั้งหมดจาก .env
```

### 3. ตั้งค่า Environment Variables ใน Vercel

ใน Vercel Dashboard > Settings > Environment Variables:

```
NODE_ENV=production
PORT=3002
VITE_API_BASE_URL=https://your-vercel-app.vercel.app
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGEspot.com
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## 🐳 การ Deploy ด้วย Docker

### 1. สร้าง Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COP./
COPY .npmrc ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3002

# Start server
CMD ["npm", "run", "server-firebase"]
```

### 2. สร้าง docker-compose.yml

```yaml
version: '3.8'
services:
  aunqa-app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      -_EMAIL}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
      - FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
      - JWT_SECRET=${JWT_SECRET}
    env_file:
      - .env
    restart: unless-stopped
```

### 3. Deploy ด้วย Docker

```bash
# Build image
docker build -t aunqa-esar .

# Run container
docker run -d \
  --name aunqa-app \
  -p 3002:3002 \
  --env-file .env \
  aunqa-esar

# หรือใช้ docker-compose
docker-compose up -d
```

## ☁️ การ Deploy บน VPS/Server

### 1. เตรียม Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (ถ้าต้องการ reverse proxy)
sudo apt install nginx -y
```

### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd AUNQA-ESAR

# Install dependencies
npm install --legacy-peer-deps

# Build frontend
npm run build

# Copy environment file
cp .env.production .env
# แก้ไขค่าใน .env ให้ถูกต้อง

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. ตั้งค่า Nginx (ถ้าต้องการ)

```nginx
# /etc/nginx/sites-available/aunqa-esar
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Checklist สำหรับ Production

- [ ] ใช้ HTTPS (SSL Certificate)
- [ ] ตั้งค่า CORS ให้จำกัดเฉพาะ domain ที่ต้องการ
- [ ] ใช้ JWT Secret ที่แข็งแกร่ง (32+ characters)
- [ ] ตั้งค่า Firebase Security Rules
- [ ] ซ่อน sensitive information ใน environment variables
- [ ] เปิดใช้งาน rate liting
- [ ] ตั้งค่า logging และ monitoring
- [ ] Backup database เป็นประจำ

## 🚨 การแก้ไขปัญหา Deploy

### ปัญหา: npm install ล้มเหลว
```bash
# ใช้ legacy peer deps
npm install --legacy-peer-deps

# หรือลบ node_modules และ package-lock.json แล้วติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### ปัญหา: Firebase connection failed
- ตรวจสอบ environment variables
- ตรวจสอบ Firebase project ID
- ตรวจสอบ private key format (ต้องมี \\n)

### ปัญหา: CORS Error
 ให้ตรงกับ domain
- ตรวจสอบ protocol (http vs https)

### ปัญหา: Build failed
```bash
# ตรวจสอบ dependencies
npm audit fix --legacy-peer-deps

# Build แบบ verbose
npm run build -- --verbose
```

## 📊 Monitoring และ Maintenance

### การตรวจสอบสถานะ
```bash
# ตรวจสอบ PM2 processes
pm2 status

# ดู logs
pm2 logs

# Restart application
pm2 restart all

# Monitor resources
pm2 monit
```

### การ Backup
```bash
# Backup Firebase data (ใช้ Firebase CLI)
%m%d)

# Backup uploaded files
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

---

✅ **เมื่อ deploy เสร็จแล้ว ระบบจะพร้อมใช้งานบน production!**
# 🚀 คู่มือการ Deploy AUNQA-ESAR System

## 📋 ข้อกำหนดสำหรับ Production

### Server Requirements
- **Node.js**: 18+ LTS
- **RAM**: อย่างน้อย 2GB
- **Storage**: อย่างน้อย 10GB
- **Network**: HTTPS support
- **OS**: Ubuntu 20.04+ หรือ CentOS 8+

### Services ที่ต้องการ
- **Firebase Project** (Production)
- **Domain Name** + **SSL Certificate**
- **Process Manager** (PM2 แนะนำ)
- **Reverse Proxy** (Nginx แนะนำ)

## 🔧 การเตรียม Production Environment

### 1. สร้าง Firebase Project สำหรับ Production

```bash
# สร้าง project ใหม่สำหรับ production
# หรือใช้ project เดียวกันแต่แยก environment
```

#### 1.1 Firebase Security Rules (Production)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - เฉพาะ authenticated users
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Quality components - เฉพาะ admin
    match /quality_components/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Evaluations - เฉพาะเจ้าของหรือ admin
    match /evaluations/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. เตรียม Server

#### 2.1 ติดตั้ง Dependencies
```bash
# อัปเดต system
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง PM2
sudo npm install -g pm2

# ติดตั้ง Nginx
sudo apt install nginx -y
```

#### 2.2 สร้าง User สำหรับ Application
```bash
# สร้าง user
sudo adduser aunqa
sudo usermod -aG sudo aunqa

# สลับไปใช้ user ใหม่
su - aunqa
```

### 3. Deploy Application

#### 3.1 Clone และ Setup
```bash
# Clone repository
git clone <your-repository-url> /home/aunqa/aunqa-esar
cd /home/aunqa/aunqa-esar

# ติดตั้ง dependencies
npm install --production

# สร้าง directories
mkdir -p logs uploads ssl
```

#### 3.2 Setup Environment Variables
```bash
# Copy production environment
cp .env.production .env

# แก้ไขค่าใน .env
nano .env
```

**สิ่งที่ต้องแก้ไขใน .env:**
```env
# เปลี่ยนเป็น domain จริง
VITE_API_BASE_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com

# ใส่ Firebase config จริง
VITE_FIREBASE_API_KEY=your-real-api-key
VITE_FIREBASE_PROJECT_ID=your-production-project

# ใส่ secret key ที่แข็งแกร่ง
SESSION_SECRET=your-super-strong-32-character-secret

# จำกัด CORS เฉพาะ domain จริง
CORS_ORIGIN=https://your-domain.com
```

#### 3.3 Upload Firebase Service Account Key
```bash
# อัปโหลดไฟล์ service account key สำหรับ production
# ตั้งชื่อเป็น firebase-service-account.json
scp firebase-service-account-prod.json aunqa@your-server:/home/aunqa/aunqa-esar/firebase-service-account.json

# ตั้งสิทธิ์ไฟล์
chmod 600 firebase-service-account.json
```

### 4. Build Application

#### 4.1 Build Frontend
```bash
# Build React app สำหรับ production
npm run build

# ตรวจสอบ build
ls -la dist/
```

#### 4.2 Test Production Build
```bash
# ทดสอบ production build
npm run preview

# ทดสอบ backend
node server-firebase.cjs
```

### 5. Setup Process Manager (PM2)

#### 5.1 สร้าง PM2 Configuration
```bash
# สร้างไฟล์ ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'aunqa-esar-api',
      script: 'server-firebase.cjs',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
EOF
```

#### 5.2 เริ่ม Application ด้วย PM2
```bash
# เริ่ม application
pm2 start ecosystem.config.js

# ตั้งให้เริ่มอัตโนมัติเมื่อ server restart
pm2 startup
pm2 save

# ตรวจสอบสถานะ
pm2 status
pm2 logs
```

### 6. Setup Nginx Reverse Proxy

#### 6.1 สร้าง Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/aunqa-esar
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Serve static files (React build)
    location / {
        root /home/aunqa/aunqa-esar/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Large file upload support
        client_max_body_size 50M;
    }
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

#### 6.2 เปิดใช้งาน Site
```bash
# เปิดใช้งาน site
sudo ln -s /etc/nginx/sites-available/aunqa-esar /etc/nginx/sites-enabled/

# ทดสอบ configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 7. Setup SSL Certificate

#### 7.1 ใช้ Let's Encrypt (ฟรี)
```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx -y

# สร้าง SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# ตั้งให้ renew อัตโนมัติ
sudo crontab -e
# เพิ่มบรรทัด: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 8. Setup Monitoring & Logging

#### 8.1 Log Rotation
```bash
sudo nano /etc/logrotate.d/aunqa-esar
```

```
/home/aunqa/aunqa-esar/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 aunqa aunqa
    postrotate
        pm2 reload aunqa-esar-api
    endscript
}
```

#### 8.2 Basic Monitoring
```bash
# ติดตั้ง htop สำหรับ monitoring
sudo apt install htop -y

# Setup PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔒 Security Checklist

- [ ] **Firewall**: เปิดเฉพาะ port 80, 443, 22
- [ ] **SSH**: ปิด password login, ใช้ key-based authentication
- [ ] **SSL**: ใช้ HTTPS เท่านั้น
- [ ] **Environment**: ไม่มี sensitive data ใน code
- [ ] **Firebase Rules**: จำกัดการเข้าถึงข้อมูล
- [ ] **CORS**: จำกัดเฉพาะ domain ที่อนุญาต
- [ ] **Headers**: ตั้งค่า security headers
- [ ] **Updates**: อัปเดต system และ dependencies เป็นประจำ

## 📊 Performance Optimization

### 1. Frontend Optimization
```bash
# Build optimization
npm run build -- --mode production

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

### 2. Backend Optimization
```javascript
// ใน server-firebase.cjs เพิ่ม
const compression = require('compression');
app.use(compression());

// Connection pooling
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // เพิ่ม connection settings
});
```

### 3. Database Optimization
- สร้าง Firestore indexes ที่จำเป็น
- ใช้ pagination สำหรับข้อมูลจำนวนมาก
- Cache ข้อมูลที่ไม่เปลี่ยนแปลงบ่อย

## 🚀 Deployment Commands

```bash
# การ deploy แบบเต็ม
git pull origin main
npm install --production
npm run build
pm2 reload all
sudo systemctl reload nginx

# การ deploy แบบ quick (เฉพาะ code)
git pull origin main
npm run build
pm2 reload aunqa-esar-api
```

## 📞 Troubleshooting

### ปัญหาที่พบบ่อย:

1. **502 Bad Gateway**: ตรวจสอบ PM2 และ port 3002
2. **SSL Error**: ตรวจสอบ certificate และ Nginx config
3. **Firebase Error**: ตรวจสอบ service account key และ permissions
4. **CORS Error**: ตรวจสอบ CORS_ORIGIN ใน .env

### การตรวจสอบ:
```bash
# ตรวจสอบ PM2
pm2 status
pm2 logs

# ตรวจสอบ Nginx
sudo nginx -t
sudo systemctl status nginx

# ตรวจสอบ SSL
openssl s_client -connect your-domain.com:443

# ตรวจสอบ API
curl https://your-domain.com/api/ping
```

---

✅ **เมื่อ deploy เสร็จแล้ว ระบบจะพร้อมใช้งาน production ที่ปลอดภัยและมีประสิทธิภาพ!**
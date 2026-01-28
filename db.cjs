// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // หรือ user ที่ตั้งไว้ใน phpMyAdmin
  password: '', // ถ้าใช้ XAMPP ปกติจะว่าง
  database: 'project_aunqa' // ชื่อฐานข้อมูลที่สร้างใน phpMyAdmin
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL!');
});

module.exports = connection;
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'https://smart-attendance-app-gamma.vercel.app',
  credentials: true
}));
app.use(express.json());

// ————————————————
// TEST ROUTE
// ————————————————
app.get('/', (req, res) => {
  res.send('Smart Attendance App Backend is Running!');
});

// ————————————————
// LOGIN
// ————————————————
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND role = ?';
  db.query(query, [email, role], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'User not found' });
    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (!match) return res.status(401).json({ success: false, message: 'Wrong password' });
      const token = jwt.sign({ id: user.id, role: user.role }, 'smartapp123secret', { expiresIn: '1d' });
      res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  });
});

// ————————————————
// STUDENT ROUTES
// ————————————————
app.get('/api/student/attendance/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM attendance WHERE student_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, attendance: results });
  });
});

// ————————————————
// TEACHER ROUTES
// ————————————————
app.post('/api/teacher/attendance', (req, res) => {
  const { student_id, subject, status, date } = req.body;
  const query = 'INSERT INTO attendance (student_id, subject, status, date) VALUES (?, ?, ?, ?)';
  db.query(query, [student_id, subject, status, date], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Attendance marked!' });
  });
});

app.get('/api/teacher/students', (req, res) => {
  const query = "SELECT * FROM users WHERE role = 'student'";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, students: results });
  });
});

// ————————————————
// ADMIN ROUTES
// ————————————————
app.get('/api/admin/users', (req, res) => {
  const query = 'SELECT id, name, email, role FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, users: results });
  });
});

app.post('/api/admin/users', (req, res) => {
  const { name, email, password, role } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, hash, role], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      res.json({ success: true, message: 'User created!' });
    });
  });
});

// ————————————————
// START SERVER
// ————————————————
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
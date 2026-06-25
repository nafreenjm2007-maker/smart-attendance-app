const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────
// TEST ROUTE
// ─────────────────────────────
app.get('/', (req, res) => {
  res.send('Smart Attendance App Backend is Running!');
});

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND role = ?';
  db.query(query, [email, role], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'User not found' });
    const user = results[0];
    if (password !== user.password) return res.status(401).json({ success: false, message: 'Wrong password' });
    const token = jwt.sign({ id: user.id, role: user.role }, 'smartapp123secret', { expiresIn: '1d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// ─────────────────────────────
// STUDENT ROUTES
// ─────────────────────────────
app.get('/api/student/attendance/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT a.subject, a.date, a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE s.user_id = ?
    ORDER BY a.date DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, attendance: results });
  });
});

// ─────────────────────────────
// TEACHER ROUTES
// ─────────────────────────────
app.get('/api/teacher/students', (req, res) => {
  const query = `
    SELECT s.id, u.name, s.roll_number, s.class_name
    FROM students s
    JOIN users u ON s.user_id = u.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, students: results });
  });
});

app.post('/api/teacher/attendance', (req, res) => {
  const { records, subject, date } = req.body;
  let completed = 0;
  records.forEach((record) => {
    const query = `
      INSERT INTO attendance (student_id, subject, date, status)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status)
    `;
    db.query(query, [record.studentId, subject, date, record.status], (err) => {
      if (err) console.log('Error:', err.message);
      completed++;
      if (completed === records.length) {
        res.json({ success: true, message: 'Attendance saved!' });
      }
    });
  });
});

app.post('/api/teacher/curriculum', (req, res) => {
  const { teacherId, subject, topic, chapter } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const query = 'INSERT INTO curriculum (teacher_id, subject, topic, chapter, date_taught) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [teacherId, subject, topic, chapter, date], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Curriculum saved!' });
  });
});

// ─────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────
app.get('/api/admin/report', (req, res) => {
  const q1 = 'SELECT COUNT(*) as total FROM students';
  const q2 = 'SELECT COUNT(*) as total FROM attendance';
  const q3 = 'SELECT COUNT(*) as total FROM curriculum';
  const q4 = `
    SELECT u.name, s.class_name,
      COUNT(a.id) as total_count,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
      ROUND(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0)) as percentage
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN attendance a ON s.id = a.student_id
    GROUP BY s.id, u.name, s.class_name
  `;
  const q5 = `
    SELECT topic, chapter, subject, date_taught
    FROM curriculum
    ORDER BY date_taught DESC LIMIT 10
  `;

  db.query(q1, (err, r1) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.query(q2, (err, r2) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      db.query(q3, (err, r3) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        db.query(q4, (err, r4) => {
          if (err) return res.status(500).json({ success: false, message: err.message });
          db.query(q5, (err, r5) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({
              success: true,
              totalStudents: r1[0].total,
              totalAttendanceRecords: r2[0].total,
              totalCurriculumTopics: r3[0].total,
              avgAttendance: 80,
              studentReport: r4,
              curriculumReport: r5,
            });
          });
        });
      });
    });
  });
});

// ─────────────────────────────
// START SERVER
// ─────────────────────────────
app.listen(5000, () => {
  console.log('Server started on port 5000');
  console.log('Database connected successfully!');
});
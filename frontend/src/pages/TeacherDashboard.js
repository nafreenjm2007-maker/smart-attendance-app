import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [students, setStudents] = useState([]);
  const [topic, setTopic] = useState('');
  const [chapter, setChapter] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Load students from real database
  useEffect(() => {
    fetch('http://localhost:5000/api/teacher/students')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const withStatus = data.students.map(s => ({
            ...s,
            status: 'present'
          }));
          setStudents(withStatus);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const toggleStatus = (id) => {
    setStudents(students.map(s =>
      s.id === id
        ? { ...s, status: s.status === 'present' ? 'absent' : 'present' }
        : s
    ));
  };

  const handleSaveAttendance = async () => {
    const date = new Date().toISOString().split('T')[0];
    const records = students.map(s => ({
      studentId: s.id,
      status: s.status,
    }));

    try {
      const response = await fetch('http://localhost:5000/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, subject, date }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('✅ Attendance saved to database successfully!');
      } else {
        setMessage('❌ Failed to save attendance!');
      }
    } catch {
      setMessage('❌ Cannot connect to server!');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveCurriculum = async () => {
    if (!topic || !chapter) {
      setMessage('⚠️ Please enter topic and chapter!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/teacher/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          subject,
          topic,
          chapter,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('✅ Curriculum saved to database successfully!');
        setTopic('');
        setChapter('');
      } else {
        setMessage('❌ Failed to save curriculum!');
      }
    } catch {
      setMessage('❌ Cannot connect to server!');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const presentCount = students.filter(s => s.status === 'present').length;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerText}>👩‍🏫 Teacher Dashboard</h2>
        <button style={styles.logoutBtn} onClick={() => {
          localStorage.clear();
          navigate('/');
        }}>
          Logout
        </button>
      </div>

      {/* Welcome */}
      <div style={styles.welcomeCard}>
        <h3 style={{ margin: 0, color: '#2e7d32' }}>
          Welcome, {user.name || 'Teacher'}! 👋
        </h3>
        <p style={{ margin: '5px 0 0', color: '#666' }}>
          Today: {new Date().toDateString()}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={styles.messageBox}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h1 style={{ color: '#4caf50', margin: 0 }}>{presentCount}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Present</p>
        </div>
        <div style={styles.statCard}>
          <h1 style={{ color: '#f44336', margin: 0 }}>
            {students.length - presentCount}
          </h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Absent</p>
        </div>
        <div style={styles.statCard}>
          <h1 style={{ color: '#1a73e8', margin: 0 }}>{students.length}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Total</p>
        </div>
      </div>

      {/* Subject Selector */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📚 Select Subject</h3>
        <select
          style={styles.input}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option>Mathematics</option>
          <option>Physics</option>
          <option>Chemistry</option>
          <option>English</option>
          <option>Computer Science</option>
        </select>
      </div>

      {/* Mark Attendance */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>✅ Mark Attendance</h3>
        {loading ? (
          <p style={{ color: '#666' }}>Loading students...</p>
        ) : students.length === 0 ? (
          <p style={{ color: '#666' }}>No students found in database.</p>
        ) : (
          students.map((student) => (
            <div key={student.id} style={styles.studentRow}>
              <div>
                <span style={styles.rollNo}>#{student.roll_number}</span>
                <span style={styles.studentName}>{student.name}</span>
              </div>
              <button
                style={{
                  ...styles.toggleBtn,
                  backgroundColor:
                    student.status === 'present' ? '#4caf50' : '#f44336',
                }}
                onClick={() => toggleStatus(student.id)}
              >
                {student.status === 'present' ? '✅ Present' : '❌ Absent'}
              </button>
            </div>
          ))
        )}
        <button style={styles.saveBtn} onClick={handleSaveAttendance}>
          💾 Save Attendance to Database
        </button>
      </div>

      {/* Log Curriculum */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📖 Log Today's Curriculum</h3>
        <input
          style={styles.input}
          placeholder="Topic taught (e.g. Quadratic Equations)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Chapter (e.g. Chapter 3)"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
        />
        <button style={styles.saveBtn} onClick={handleSaveCurriculum}>
          💾 Save Curriculum to Database
        </button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  headerText: { color: 'white', margin: 0 },
  logoutBtn: {
    backgroundColor: 'white',
    color: '#2e7d32',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  messageBox: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #4caf50',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statsRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    marginTop: 0,
    color: '#333',
    borderBottom: '2px solid #f0f2f5',
    paddingBottom: '10px',
  },
  studentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f2f5',
  },
  rollNo: {
    color: '#999',
    fontSize: '13px',
    marginRight: '10px',
  },
  studentName: {
    fontWeight: 'bold',
    color: '#333',
  },
  toggleBtn: {
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  saveBtn: {
    marginTop: '15px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
};

export default TeacherDashboard;
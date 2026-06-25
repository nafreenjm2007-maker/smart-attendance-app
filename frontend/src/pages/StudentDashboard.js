import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/student/attendance/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAttendance(data.attendance);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  // Calculate stats
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = total - present;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  // Group by subject
  const subjectMap = {};
  attendance.forEach(a => {
    if (!subjectMap[a.subject]) {
      subjectMap[a.subject] = { total: 0, present: 0 };
    }
    subjectMap[a.subject].total++;
    if (a.status === 'present') subjectMap[a.subject].present++;
  });

  const getColor = (pct) => {
    if (pct >= 75) return '#4caf50';
    if (pct >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerText}>👨‍🎓 Student Dashboard</h2>
        <button style={styles.logoutBtn} onClick={() => {
          localStorage.clear();
          navigate('/');
        }}>
          Logout
        </button>
      </div>

      {/* Welcome */}
      <div style={styles.welcomeCard}>
        <h3 style={{ margin: 0, color: '#1a73e8' }}>
          Welcome, {user.name || 'Student'}! 👋
        </h3>
        <p style={{ margin: '5px 0 0', color: '#666' }}>
          {new Date().toDateString()}
        </p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h1 style={{ color: getColor(percentage), margin: 0 }}>
            {percentage}%
          </h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Overall Attendance</p>
        </div>
        <div style={styles.statCard}>
          <h1 style={{ color: '#1a73e8', margin: 0 }}>{present}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Classes Present</p>
        </div>
        <div style={styles.statCard}>
          <h1 style={{ color: '#f44336', margin: 0 }}>{absent}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Absences</p>
        </div>
      </div>

      {/* Low attendance warning */}
      {percentage > 0 && percentage < 75 && (
        <div style={styles.warningCard}>
          ⚠️ Your attendance is below 75%! You need to attend more classes.
        </div>
      )}

      {/* Subject wise */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📊 Attendance by Subject</h3>
        {loading ? (
          <p style={{ color: '#666' }}>Loading your attendance...</p>
        ) : Object.keys(subjectMap).length === 0 ? (
          <p style={{ color: '#666' }}>No attendance records found yet.</p>
        ) : (
          Object.entries(subjectMap).map(([subject, data], index) => {
            const pct = Math.round((data.present / data.total) * 100);
            return (
              <div key={index} style={styles.subjectRow}>
                <div style={styles.subjectInfo}>
                  <span style={styles.subjectName}>{subject}</span>
                  <span style={{ color: getColor(pct), fontWeight: 'bold' }}>
                    {pct}%
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: pct + '%',
                    backgroundColor: getColor(pct),
                  }} />
                </div>
                <p style={styles.attendCount}>
                  {data.present}/{data.total} classes attended
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Recent attendance */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📅 Recent Attendance</h3>
        {attendance.slice(0, 5).map((record, index) => (
          <div key={index} style={styles.recordRow}>
            <div>
              <span style={styles.subjectName}>{record.subject}</span>
              <span style={{ color: '#999', fontSize: '13px', marginLeft: '10px' }}>
                {record.date}
              </span>
            </div>
            <span style={{
              color: record.status === 'present' ? '#4caf50' : '#f44336',
              fontWeight: 'bold',
            }}>
              {record.status === 'present' ? '✅ Present' : '❌ Absent'}
            </span>
          </div>
        ))}
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
    backgroundColor: '#1a73e8',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  headerText: { color: 'white', margin: 0 },
  logoutBtn: {
    backgroundColor: 'white',
    color: '#1a73e8',
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
  warningCard: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    padding: '15px',
    borderRadius: '10px',
    color: '#856404',
    marginBottom: '20px',
    fontWeight: 'bold',
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
  subjectRow: { marginBottom: '15px' },
  subjectInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  subjectName: { fontWeight: 'bold', color: '#333' },
  progressBar: {
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    height: '10px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '10px',
    borderRadius: '10px',
  },
  attendCount: {
    fontSize: '12px',
    color: '#999',
    margin: '4px 0 0',
  },
  recordRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f2f5',
  },
};

export default StudentDashboard;
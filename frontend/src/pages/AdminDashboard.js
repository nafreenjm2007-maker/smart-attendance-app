import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/report')
      .then(res => res.json())
      .then(data => {
        if (data.success) setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getColor = (value) => {
    if (value >= 75) return '#4caf50';
    if (value >= 60) return '#ff9800';
    return '#f44336';
  };

  const getStatus = (value) => {
    if (value >= 75) return 'Good';
    if (value >= 60) return 'Average';
    return 'Low';
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerText}>🏫 Admin Dashboard</h2>
        <button style={styles.logoutBtn} onClick={() => {
          localStorage.clear();
          navigate('/');
        }}>
          Logout
        </button>
      </div>

      {/* Welcome */}
      <div style={styles.welcomeCard}>
        <h3 style={{ margin: 0, color: '#6a1b9a' }}>
          Welcome, {user.name || 'Admin'}! 👋
        </h3>
        <p style={{ margin: '5px 0 0', color: '#666' }}>
          Smart Attendance Management System | {new Date().toDateString()}
        </p>
      </div>

      {loading ? (
        <div style={styles.card}>
          <p style={{ textAlign: 'center', color: '#666' }}>
            Loading real data from database...
          </p>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <h1 style={{ color: '#4caf50', margin: 0 }}>
                {report?.totalStudents || 0}
              </h1>
              <p style={{ margin: '5px 0 0', color: '#666' }}>Total Students</p>
            </div>
            <div style={styles.statCard}>
              <h1 style={{ color: '#1a73e8', margin: 0 }}>
                {report?.totalAttendanceRecords || 0}
              </h1>
              <p style={{ margin: '5px 0 0', color: '#666' }}>Attendance Records</p>
            </div>
            <div style={styles.statCard}>
              <h1 style={{ color: '#ff9800', margin: 0 }}>
                {report?.totalCurriculumTopics || 0}
              </h1>
              <p style={{ margin: '5px 0 0', color: '#666' }}>Topics Taught</p>
            </div>
            <div style={styles.statCard}>
              <h1 style={{ color: '#6a1b9a', margin: 0 }}>
                {report?.avgAttendance || 0}%
              </h1>
              <p style={{ margin: '5px 0 0', color: '#666' }}>Avg Attendance</p>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 Student Attendance Report</h3>
            {report?.studentReport?.length === 0 ? (
              <p style={{ color: '#666' }}>No attendance records yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Student Name</th>
                    <th style={styles.th}>Class</th>
                    <th style={styles.th}>Present</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Percentage</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.studentReport?.map((row, index) => (
                    <tr key={index} style={styles.tableRow}>
                      <td style={styles.td}>{row.name}</td>
                      <td style={styles.td}>{row.class_name}</td>
                      <td style={styles.td}>{row.present_count}</td>
                      <td style={styles.td}>{row.total_count}</td>
                      <td style={styles.td}>
                        <span style={{
                          color: getColor(row.percentage),
                          fontWeight: 'bold'
                        }}>
                          {row.percentage}%
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: getColor(row.percentage),
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}>
                          {getStatus(row.percentage)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Curriculum Report */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📚 Recent Curriculum Activity</h3>
            {report?.curriculumReport?.length === 0 ? (
              <p style={{ color: '#666' }}>No curriculum logged yet.</p>
            ) : (
              report?.curriculumReport?.map((row, index) => (
                <div key={index} style={styles.curriculumRow}>
                  <div>
                    <span style={styles.topicName}>{row.topic}</span>
                    <span style={styles.chapterName}> — {row.chapter}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={styles.subjectBadge}>{row.subject}</span>
                    <p style={styles.dateText}>{row.date_taught}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
            <div style={styles.actionsRow}>
              <button style={{
                ...styles.actionBtn,
                backgroundColor: '#1a73e8'
              }}>
                📥 Download Report
              </button>
              <button style={{
                ...styles.actionBtn,
                backgroundColor: '#2e7d32'
              }}>
                👨‍🎓 Manage Students
              </button>
              <button style={{
                ...styles.actionBtn,
                backgroundColor: '#6a1b9a'
              }}>
                📅 View Timetable
              </button>
              <button style={{
                ...styles.actionBtn,
                backgroundColor: '#e65100'
              }}>
                🔔 Send Alerts
              </button>
            </div>
          </div>
        </>
      )}
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
    backgroundColor: '#6a1b9a',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  headerText: { color: 'white', margin: 0 },
  logoutBtn: {
    backgroundColor: 'white',
    color: '#6a1b9a',
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f0f2f5',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    color: '#666',
    fontSize: '13px',
  },
  tableRow: {
    borderBottom: '1px solid #f0f2f5',
  },
  td: {
    padding: '12px',
    color: '#333',
  },
  curriculumRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f2f5',
  },
  topicName: {
    fontWeight: 'bold',
    color: '#333',
  },
  chapterName: {
    color: '#666',
    fontSize: '14px',
  },
  subjectBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1a73e8',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  dateText: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#999',
  },
  actionsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  },
};

export default AdminDashboard;
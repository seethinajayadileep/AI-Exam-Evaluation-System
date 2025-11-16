
import React, { useState, useEffect } from 'react';



function StudentOverview({ onViewAssignmentsClick }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [pendingCount, setPendingCount] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);
  const [averageScore, setAverageScore] = useState('N/A');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('https://backend-ai-subjective-exam-evaluato.vercel.app/assignments');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        console.error("Failed to fetch assignments for overview:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []); 

  
  useEffect(() => {
    if (assignments.length > 0) {
      const pending = assignments.filter(a => a.status === 'pending').length;
      const submitted = assignments.filter(a => a.status === 'submitted').length;
      const graded = assignments.filter(a => a.status === 'graded').length;

      setPendingCount(pending);
      setSubmittedCount(submitted);
      setGradedCount(graded);

      
      const gradedAssignments = assignments.filter(a => a.status === 'graded' && a.score !== null);
      if (gradedAssignments.length > 0) {
        const totalScore = gradedAssignments.reduce((sum, a) => sum + a.score, 0);
        const totalMaxMarks = gradedAssignments.reduce((sum, a) => sum + a.maxMarks, 0);

        if (totalMaxMarks > 0) {
          const avg = (totalScore / totalMaxMarks) * 100;
          setAverageScore(`${avg.toFixed(0)}%`); 
        } else {
          setAverageScore('N/A');
        }
      } else {
        setAverageScore('N/A');
      }
    } else {
      
      setPendingCount(0);
      setSubmittedCount(0);
      setGradedCount(0);
      setAverageScore('N/A');
    }
  }, [assignments]);
  return (
    <div className="student-tab-content active" id="dashboard">
      <div className="student-content-header">
        <h2>Dashboard Overview</h2>
        <div className="student-quick-actions">
          {}
          <button className="student-btn student-btn-primary" onClick={onViewAssignmentsClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            View Assignments
          </button>
        </div>
      </div>

      <div className="student-stats-grid">
        <div className="student-stat-card">
          <div className="student-stat-icon pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <div className="student-stat-info">
            <h3 id="pendingAssignments">{pendingCount}</h3>
            <p>Pending Assignments</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon submitted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </div>
          <div className="student-stat-info">
            <h3 id="submittedAssignments">{submittedCount}</h3>
            <p>Submitted</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon graded">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="student-stat-info">
            <h3 id="gradedAssignments">{gradedCount}</h3>
            <p>Graded</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon average">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26" />
            </svg>
          </div>
          <div className="student-stat-info">
            <h3 id="averageScore">{averageScore}</h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentOverview;
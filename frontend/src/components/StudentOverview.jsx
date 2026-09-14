import React, { useState, useEffect } from "react";
import { api } from "../api/client";

function StudentOverview({ onViewAssignmentsClick }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await api("/api/assignments");
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const pending = assignments.filter((a) => a.status === "pending").length;
  const submitted = assignments.filter((a) => a.status === "submitted" || a.status === "pending_review").length;
  const graded = assignments.filter((a) => a.status === "graded").length;
  const gradedAssignments = assignments.filter((a) => a.status === "graded" && a.score !== null);
  let averageScore = "N/A";
  if (gradedAssignments.length > 0) {
    const totalScore = gradedAssignments.reduce((sum, a) => sum + a.score, 0);
    const totalMaxMarks = gradedAssignments.reduce((sum, a) => sum + a.maxMarks, 0);
    if (totalMaxMarks > 0) {
      averageScore = `${((totalScore / totalMaxMarks) * 100).toFixed(0)}%`;
    }
  }

  if (loading) return <p>Loading overview…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="student-tab-content active" id="dashboard">
      <div className="student-content-header">
        <h2>Dashboard Overview</h2>
        <div className="student-quick-actions">
          <button type="button" className="student-btn student-btn-primary" onClick={onViewAssignmentsClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
          <div className="student-stat-info">
            <h3>{pending}</h3>
            <p>Pending Assignments</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-info">
            <h3>{submitted}</h3>
            <p>Submitted</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-info">
            <h3>{graded}</h3>
            <p>Graded</p>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-info">
            <h3>{averageScore}</h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentOverview;

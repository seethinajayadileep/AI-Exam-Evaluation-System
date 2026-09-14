import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { displayStatus, formatDate } from "../utils/dates";

function StudentRecentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await api("/api/assignments");
        const sorted = [...data].sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate));
        setAssignments(sorted.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="student-recent-assignments">
        <h3>Recent Assignments</h3>
        <p>Loading recent assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-recent-assignments">
        <h3>Recent Assignments</h3>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="student-recent-assignments">
      <h3>Recent Assignments</h3>
      <div className="student-assignment-list">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment._id} className="student-assignment-item">
              <div className="student-assignment-info">
                <h5>{assignment.title}</h5>
                <p>{assignment.subject} • Due: {formatDate(assignment.dueDate)}</p>
              </div>
              <span className={`student-assignment-status student-status-${assignment.status}`}>
                {displayStatus(assignment.status)}
              </span>
            </div>
          ))
        ) : (
          <p>No recent assignments found.</p>
        )}
      </div>
    </div>
  );
}

export default StudentRecentAssignments;
